import { useCallback, useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import {
  ARRIVE_EPSILON,
  CAMERA_LERP,
  FAST_TRAVEL_MULT,
  FOCUS_BIAS,
  FOCUS_ZOOM_OVERLAY,
  FOCUS_ZOOM_STATION,
  INTERACTION_RADIUS_DEFAULT,
  MOBILE_BREAKPOINT,
  PLAYER_SCALE_MAX,
  PLAYER_SCALE_MIN,
  PLAYER_SPEED,
  REVEAL_FROM,
  SCENE_FADE_MS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  ZOOM_DESKTOP_MIN,
  ZOOM_LERP,
  ZOOM_MOBILE_MIN,
  isDebugEnabled,
  prefersReducedMotion,
} from "../config/world"
import {
  SPAWN_POINT,
  STATIC_OBSTACLES,
  WALKABLE_AREA,
  WAYPOINTS,
  type Point,
  type SceneGeometry,
} from "../data/map"
import { OVERWORLD_PROPS, propObstacles } from "../data/props"
import { SCENES, sceneObstacles, type WorkshopSceneDef } from "../data/scenes"
import { WORLD_SPACES, getSpace, type WorkshopSpace } from "../data/spaces"
import { game } from "../game/state"
import {
  cameraTransform,
  clampCamera,
  screenToWorldCoordinates,
  worldToScreenCoordinates,
} from "../utils/coordinates"
import {
  clamp,
  dist,
  findNearestWalkablePoint,
  findPath,
  isPointInsideWalkableArea,
} from "../utils/geometry"
import { damp, lerp } from "../utils/interpolation"

// ============================================================
// Tipos públicos
// ============================================================

export type PoiKind = "space" | "station" | "exit"

/** Punto de interés genérico: espacio del patio, estación o salida. */
export interface Poi {
  id: string
  kind: PoiKind
  x: number
  y: number
  radius: number
  name: string
  action: string
}

export interface SceneRuntime {
  id: string
  width: number
  height: number
  geo: SceneGeometry
  pois: Poi[]
  /** anclas de profundidad (y) de los props, ordenadas */
  depthAnchors: number[]
  spawn: Point
  depthRange: { far: number; near: number }
  def?: WorkshopSceneDef
}

export interface DebugInfo {
  scene: string
  player: Point
  target: Point | null
  camera: { x: number; y: number; zoom: number }
  mouseWorld: Point | null
  fps: number
  depthIndex: number
  nearby: string | null
  lastLogged: Point | null
}

export interface EngineRefs {
  worldRef: RefObject<HTMLDivElement>
  playerRef: RefObject<SVGGElement>
  figureRef: RefObject<SVGGElement>
  labelRef: RefObject<HTMLDivElement>
  markerRef: RefObject<SVGGElement>
}

export const OVERWORLD_ID = "overworld"

const MOVE_KEYS: Record<string, [number, number]> = {
  w: [0, -1],
  a: [-1, 0],
  s: [0, 1],
  d: [1, 0],
  arrowup: [0, -1],
  arrowleft: [-1, 0],
  arrowdown: [0, 1],
  arrowright: [1, 0],
}

// ============================================================
// Construcción de escenas
// ============================================================

function spaceAction(space: WorkshopSpace): string {
  if (space.type === "available") return "DISPONIBLE"
  if (space.type === "installation") return "VER"
  if (space.cta?.enterSceneId) return "VER"
  return "VER"
}

function polygonBounds(poly: Array<[number, number]>) {
  let minY = Infinity
  let maxY = -Infinity
  for (const [, y] of poly) {
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return { minY, maxY }
}

function buildOverworld(): SceneRuntime {
  const geo: SceneGeometry = {
    walkable: WALKABLE_AREA,
    obstacles: [...STATIC_OBSTACLES, ...propObstacles(OVERWORLD_PROPS)],
    waypoints: WAYPOINTS,
  }
  const pois: Poi[] = WORLD_SPACES.map((s) => ({
    id: s.id,
    kind: "space",
    x: s.interactionPoint!.x,
    y: s.interactionPoint!.y,
    radius: s.interactionRadius || INTERACTION_RADIUS_DEFAULT,
    name: s.name,
    action: spaceAction(s),
  }))
  const b = polygonBounds(WALKABLE_AREA)
  return {
    id: OVERWORLD_ID,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    geo,
    pois,
    depthAnchors: OVERWORLD_PROPS.map((p) => p.y).sort((a, b2) => a - b2),
    spawn: SPAWN_POINT,
    depthRange: { far: b.minY, near: b.maxY },
  }
}

function buildRoom(def: WorkshopSceneDef): SceneRuntime {
  const geo: SceneGeometry = {
    walkable: def.walkable,
    obstacles: sceneObstacles(def),
    waypoints: def.waypoints,
  }
  const pois: Poi[] = [
    ...def.stations.map<Poi>((st) => ({
      id: st.id,
      kind: "station",
      x: st.position.x,
      y: st.position.y,
      radius: st.interactionRadius,
      name: st.name,
      action: st.verb,
    })),
    {
      id: `${def.id}-exit`,
      kind: "exit",
      x: def.exit.position.x,
      y: def.exit.position.y,
      radius: def.exit.radius,
      name: def.exit.label,
      action: "SALIR",
    },
  ]
  const b = polygonBounds(def.walkable)
  return {
    id: def.id,
    width: def.width,
    height: def.height,
    geo,
    pois,
    depthAnchors: def.props.map((p) => p.y).sort((a, b2) => a - b2),
    spawn: def.spawnPoint,
    depthRange: { far: b.minY, near: b.maxY },
    def,
  }
}

const OVERWORLD = buildOverworld()

function computeBaseZoom(vw: number, vh: number, scene: SceneRuntime): number {
  const cover = Math.max(vw / scene.width, vh / scene.height)
  const floor = vw < MOBILE_BREAKPOINT ? ZOOM_MOBILE_MIN : ZOOM_DESKTOP_MIN
  return Math.max(cover, floor)
}

// ============================================================
// Motor
// ============================================================

export function useExperienceEngine(refs: EngineRefs) {
  const debugEnabled = isDebugEnabled()
  const reducedMotion = prefersReducedMotion()

  const [sceneId, setSceneId] = useState<string>(OVERWORLD_ID)
  const [transitioning, setTransitioning] = useState(false)
  const [nearbyPoiId, setNearbyPoiId] = useState<string | null>(null)
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null)
  const [activeStationId, setActiveStationId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const [playerDepthIndex, setPlayerDepthIndex] = useState(0)
  const [debug, setDebug] = useState<DebugInfo | null>(null)

  const S = useRef({
    scene: OVERWORLD as SceneRuntime,
    pos: { ...SPAWN_POINT },
    path: [] as Point[],
    speedMult: 1,
    pendingActivateId: null as string | null,
    afterTransition: null as (() => void) | null,
    facing: 1,
    walking: false,
    keys: new Set<string>(),
    camera: { x: REVEAL_FROM.x, y: REVEAL_FROM.y, zoom: 0.8 },
    baseZoom: 0.8,
    focus: null as { x: number; y: number; mult: number } | null,
    viewport: { width: 1280, height: 720 },
    mouseScreen: null as Point | null,
    lastLogged: null as Point | null,
    depthIndex: -1,
    fps: 60,
    lastDebugPush: 0,
    raf: 0,
    lastTime: 0,
  })

  // Espejos para leer estado de React dentro del loop
  const pausedRef = useRef(false)
  pausedRef.current = activeSpaceId !== null || activeStationId !== null || menuOpen || transitioning
  const nearbyRef = useRef<string | null>(null)
  nearbyRef.current = nearbyPoiId

  const markCommandIssued = useCallback(() => {
    setHasMoved((prev) => (prev ? prev : true))
  }, [])

  const showMarker = useCallback(
    (x: number, y: number) => {
      const g = refs.markerRef.current
      if (!g) return
      g.setAttribute("transform", `translate(${x}, ${y})`)
      const inner = g.firstElementChild as SVGGElement | null
      if (inner && "animate" in inner) {
        inner.animate(
          [
            { opacity: 0.95, transform: "scale(0.45)" },
            { opacity: 0.75, transform: "scale(1)", offset: 0.35 },
            { opacity: 0, transform: "scale(1.05)" },
          ],
          { duration: 650, easing: "ease-out", fill: "forwards" },
        )
      }
    },
    [refs.markerRef],
  )

  const findPoi = useCallback((id: string) => S.current.scene.pois.find((p) => p.id === id), [])

  // ---- Foco de cámara (zoom in / out sutil) ---------------------
  const setFocus = useCallback((poi: { x: number; y: number } | null, mult = 1) => {
    S.current.focus = poi && !reducedMotion ? { x: poi.x, y: poi.y, mult } : null
  }, [reducedMotion])

  // ---- Overlays / estaciones ------------------------------------
  const openSpace = useCallback(
    (id: string) => {
      const st = S.current
      st.path = []
      st.pendingActivateId = null
      setMenuOpen(false)
      setActiveStationId(null)
      setActiveSpaceId(id)
      const space = getSpace(id)
      setFocus(space?.interactionPoint ?? null, FOCUS_ZOOM_OVERLAY)
    },
    [setFocus],
  )

  const closeOverlay = useCallback(() => {
    setActiveSpaceId(null)
    setFocus(null)
  }, [setFocus])

  const openStation = useCallback(
    (id: string) => {
      const st = S.current
      st.path = []
      st.pendingActivateId = null
      setActiveSpaceId(null)
      setActiveStationId(id)
      const poi = findPoi(id)
      setFocus(poi ?? null, FOCUS_ZOOM_STATION)
    },
    [findPoi, setFocus],
  )

  const closeStation = useCallback(() => {
    setActiveStationId(null)
    setFocus(null)
  }, [setFocus])

  // ---- Escenas ----------------------------------------------------
  /**
   * Cambia de escena con un fundido corto. `arriveAt` coloca al
   * visitante en un punto concreto (p. ej. la puerta del taller al
   * volver al patio); si no se da, usa el spawn de la escena.
   */
  const enterScene = useCallback(
    (targetId: string, arriveAt?: Point, after?: () => void) => {
      const st = S.current
      if (st.scene.id === targetId && !arriveAt) return
      const next = targetId === OVERWORLD_ID ? OVERWORLD : SCENES[targetId] ? buildRoom(SCENES[targetId]) : null
      if (!next) return
      setActiveSpaceId(null)
      setActiveStationId(null)
      setMenuOpen(false)
      setFocus(null)
      setTransitioning(true)
      st.afterTransition = after ?? null
      const fade = reducedMotion ? 60 : SCENE_FADE_MS
      window.setTimeout(() => {
        st.scene = next
        const point = arriveAt ? findNearestWalkablePoint(arriveAt, next.geo) : next.spawn
        st.pos = { ...point }
        st.path = []
        st.pendingActivateId = null
        st.baseZoom = computeBaseZoom(st.viewport.width, st.viewport.height, next)
        st.camera.zoom = st.baseZoom
        const c = clampCamera(st.pos.x, st.pos.y, st.baseZoom, st.viewport, next.width, next.height)
        st.camera.x = c.x
        st.camera.y = c.y
        st.depthIndex = -1
        nearbyRef.current = null
        setNearbyPoiId(null)
        setSceneId(next.id)
        window.setTimeout(() => {
          setTransitioning(false)
          const cb = st.afterTransition
          st.afterTransition = null
          cb?.()
        }, fade)
      }, fade)
    },
    [reducedMotion, setFocus],
  )

  const exitScene = useCallback(() => {
    const st = S.current
    const def = st.scene.def
    const space = def ? getSpace(def.spaceId) : undefined
    enterScene(OVERWORLD_ID, space?.interactionPoint)
  }, [enterScene])

  // ---- Activación de puntos de interés -----------------------------
  const activatePoi = useCallback(
    (id: string) => {
      const poi = findPoi(id)
      if (!poi) return
      if (poi.kind === "space") openSpace(id)
      else if (poi.kind === "station") openStation(id)
      else if (poi.kind === "exit") exitScene()
    },
    [exitScene, findPoi, openSpace, openStation],
  )

  /**
   * Camina hacia un punto de interés y lo activa al llegar.
   * `fast` = fast travel del menú (más veloz).
   */
  const goToPoi = useCallback(
    (id: string, opts?: { fast?: boolean }) => {
      const st = S.current
      const poi = findPoi(id)
      if (!poi) return
      setMenuOpen(false)
      setActiveSpaceId(null)
      setActiveStationId(null)
      setFocus(null)
      if (dist(st.pos.x, st.pos.y, poi.x, poi.y) <= poi.radius) {
        activatePoi(id)
        return
      }
      const target = findNearestWalkablePoint({ x: poi.x, y: poi.y }, st.scene.geo)
      st.path = findPath(st.pos, target, st.scene.geo)
      st.speedMult = opts?.fast ? FAST_TRAVEL_MULT : 1
      st.pendingActivateId = id
      markCommandIssued()
      showMarker(target.x, target.y)
    },
    [activatePoi, findPoi, markCommandIssued, setFocus, showMarker],
  )

  /** Compatibilidad: ir a un espacio del patio (desde cualquier escena). */
  const goToSpace = useCallback(
    (id: string, opts?: { fast?: boolean }) => {
      const space = getSpace(id)
      if (!space) return
      if (!space.interactionPoint) {
        setMenuOpen(false)
        setActiveStationId(null)
        setActiveSpaceId(id)
        setFocus(null)
        return
      }
      if (S.current.scene.id !== OVERWORLD_ID) {
        enterScene(OVERWORLD_ID, undefined, () => goToPoi(id, opts))
        return
      }
      goToPoi(id, opts)
    },
    [enterScene, goToPoi, setFocus],
  )

  const resetToSpawn = useCallback(() => {
    const st = S.current
    if (st.scene.id !== OVERWORLD_ID) {
      enterScene(OVERWORLD_ID)
      return
    }
    setActiveSpaceId(null)
    setActiveStationId(null)
    setMenuOpen(false)
    setFocus(null)
    st.pendingActivateId = null
    st.path = findPath(st.pos, SPAWN_POINT, st.scene.geo)
    st.speedMult = FAST_TRAVEL_MULT
  }, [enterScene, setFocus])

  // ---- Entrada por puntero -----------------------------------------
  const onWorldPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      if (pausedRef.current) return
      const st = S.current
      const world = screenToWorldCoordinates(e.clientX, e.clientY, st.camera, st.viewport)
      if (!isPointInsideWalkableArea(world.x, world.y, st.scene.geo)) return
      st.path = findPath(st.pos, world, st.scene.geo)
      st.speedMult = 1
      st.pendingActivateId = null
      markCommandIssued()
      showMarker(world.x, world.y)
    },
    [markCommandIssued, showMarker],
  )

  const onWorldPointerMove = useCallback((e: React.PointerEvent) => {
    S.current.mouseScreen = { x: e.clientX, y: e.clientY }
  }, [])

  const onWorldContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!debugEnabled) return
      e.preventDefault()
      const st = S.current
      const world = screenToWorldCoordinates(e.clientX, e.clientY, st.camera, st.viewport)
      const point = { x: Math.round(world.x), y: Math.round(world.y) }
      st.lastLogged = point
      // eslint-disable-next-line no-console
      console.log(`[LA BOR] ${st.scene.id} → x: ${point.x}, y: ${point.y}`)
    },
    [debugEnabled],
  )

  // ---- Teclado -------------------------------------------------
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === "escape") {
        if (activeSpaceId !== null) closeOverlay()
        else if (activeStationId !== null) closeStation()
        else setMenuOpen(false)
        return
      }
      if (key === "e") {
        if (!pausedRef.current && nearbyRef.current) activatePoi(nearbyRef.current)
        return
      }
      if (MOVE_KEYS[key]) {
        S.current.keys.add(key)
        e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => {
      S.current.keys.delete(e.key.toLowerCase())
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [activatePoi, activeSpaceId, activeStationId, closeOverlay, closeStation])

  // ---- Viewport / resize --------------------------------------
  useEffect(() => {
    const st = S.current
    const measure = () => {
      st.viewport = { width: window.innerWidth, height: window.innerHeight }
      st.baseZoom = computeBaseZoom(st.viewport.width, st.viewport.height, st.scene)
    }
    measure()
    if (reducedMotion) {
      st.camera = { x: st.pos.x, y: st.pos.y, zoom: st.baseZoom }
    } else {
      st.camera = {
        x: REVEAL_FROM.x,
        y: REVEAL_FROM.y,
        zoom: Math.max(
          st.baseZoom * 0.92,
          Math.max(st.viewport.width / WORLD_WIDTH, st.viewport.height / WORLD_HEIGHT),
        ),
      }
    }
    window.addEventListener("resize", measure)
    window.addEventListener("orientationchange", measure)
    return () => {
      window.removeEventListener("resize", measure)
      window.removeEventListener("orientationchange", measure)
    }
  }, [reducedMotion])

  // ---- Loop principal -----------------------------------------
  useEffect(() => {
    const st = S.current
    const lerpBoost = reducedMotion ? 3 : 1

    const frame = (time: number) => {
      st.raf = requestAnimationFrame(frame)
      if (st.lastTime === 0) {
        st.lastTime = time
        return
      }
      const dt = Math.min((time - st.lastTime) / 1000, 0.05)
      st.lastTime = time
      if (dt > 0) st.fps = st.fps * 0.9 + (1 / dt) * 0.1

      const scene = st.scene
      const geo = scene.geo
      let walkedThisFrame = false

      if (!pausedRef.current) {
        // 1) Teclado (secundario): anula la ruta activa
        let kx = 0
        let ky = 0
        st.keys.forEach((k) => {
          const v = MOVE_KEYS[k]
          if (v) {
            kx += v[0]
            ky += v[1]
          }
        })
        if (kx !== 0 || ky !== 0) {
          const len = Math.hypot(kx, ky)
          const step = PLAYER_SPEED * dt
          const nx = st.pos.x + (kx / len) * step
          const ny = st.pos.y + (ky / len) * step
          st.path = []
          st.pendingActivateId = null
          if (isPointInsideWalkableArea(nx, ny, geo)) {
            st.pos = { x: nx, y: ny }
            walkedThisFrame = true
          } else if (isPointInsideWalkableArea(nx, st.pos.y, geo)) {
            st.pos = { x: nx, y: st.pos.y }
            walkedThisFrame = true
          } else if (isPointInsideWalkableArea(st.pos.x, ny, geo)) {
            st.pos = { x: st.pos.x, y: ny }
            walkedThisFrame = true
          }
          if (kx !== 0) st.facing = kx > 0 ? 1 : -1
          if (walkedThisFrame) markCommandIssued()
        } else if (st.path.length > 0) {
          // 2) Ruta activa (clic / tap / fast travel)
          const wp = st.path[0]
          const d = dist(st.pos.x, st.pos.y, wp.x, wp.y)
          const step = PLAYER_SPEED * st.speedMult * dt
          if (d <= Math.max(step, ARRIVE_EPSILON)) {
            st.pos = { x: wp.x, y: wp.y }
            st.path.shift()
            if (st.path.length === 0) {
              st.speedMult = 1
              if (st.pendingActivateId) {
                const id = st.pendingActivateId
                st.pendingActivateId = null
                const poi = scene.pois.find((p) => p.id === id)
                if (poi && dist(st.pos.x, st.pos.y, poi.x, poi.y) <= poi.radius * 1.3) {
                  activatePoi(id)
                }
              }
            }
          } else {
            const dx = wp.x - st.pos.x
            const dy = wp.y - st.pos.y
            st.pos = { x: st.pos.x + (dx / d) * step, y: st.pos.y + (dy / d) * step }
            if (Math.abs(dx) > 1) st.facing = dx > 0 ? 1 : -1
            walkedThisFrame = true
          }
        }

        // 3) Punto de interés cercano (el más próximo dentro de su radio)
        let nearest: string | null = null
        let nearestDist = Infinity
        for (const poi of scene.pois) {
          const d = dist(st.pos.x, st.pos.y, poi.x, poi.y)
          if (d <= poi.radius && d < nearestDist) {
            nearest = poi.id
            nearestDist = d
          }
        }
        if (nearest !== nearbyRef.current) {
          nearbyRef.current = nearest
          setNearbyPoiId(nearest)
        }
      }

      if (walkedThisFrame !== st.walking) {
        st.walking = walkedThisFrame
        refs.figureRef.current?.classList.toggle("is-walking", walkedThisFrame)
      }

      // 4) Profundidad: índice del visitante entre las anclas de props
      let idx = 0
      const anchors = scene.depthAnchors
      while (idx < anchors.length && anchors[idx] <= st.pos.y) idx++
      if (idx !== st.depthIndex) {
        st.depthIndex = idx
        setPlayerDepthIndex(idx)
      }

      // 5) Cámara: sigue al visitante (o al foco) con amortiguación
      const focus = st.focus
      const targetX = focus ? lerp(st.pos.x, focus.x, FOCUS_BIAS) : st.pos.x
      const targetY = focus ? lerp(st.pos.y, focus.y, FOCUS_BIAS) : st.pos.y
      const targetZoom = st.baseZoom * (focus ? focus.mult : 1)
      const clamped = clampCamera(targetX, targetY, st.camera.zoom, st.viewport, scene.width, scene.height)
      st.camera.x = damp(st.camera.x, clamped.x, Math.min(CAMERA_LERP * lerpBoost, 0.5), dt)
      st.camera.y = damp(st.camera.y, clamped.y, Math.min(CAMERA_LERP * lerpBoost, 0.5), dt)
      st.camera.zoom = damp(st.camera.zoom, targetZoom, Math.min(ZOOM_LERP * lerpBoost, 0.5), dt)

      // 6) Escritura al DOM (sin re-render de React)
      if (refs.worldRef.current) {
        refs.worldRef.current.style.transform = cameraTransform(st.camera, st.viewport)
      }
      if (refs.playerRef.current) {
        refs.playerRef.current.setAttribute("transform", `translate(${st.pos.x}, ${st.pos.y})`)
      }
      if (refs.figureRef.current) {
        const { far, near } = scene.depthRange
        const t = clamp((st.pos.y - far) / Math.max(1, near - far), 0, 1)
        const scale = PLAYER_SCALE_MIN + (PLAYER_SCALE_MAX - PLAYER_SCALE_MIN) * t
        refs.figureRef.current.setAttribute("transform", `scale(${scale * st.facing}, ${scale})`)
      }
      if (refs.labelRef.current && nearbyRef.current) {
        const poi = scene.pois.find((p) => p.id === nearbyRef.current)
        if (poi) {
          const s = worldToScreenCoordinates(poi.x, poi.y, st.camera, st.viewport)
          refs.labelRef.current.style.transform = `translate3d(${s.x}px, ${s.y - 40 * st.camera.zoom}px, 0)`
        }
      }

      // 7) Debug (throttled)
      if (debugEnabled && time - st.lastDebugPush > 150) {
        st.lastDebugPush = time
        setDebug({
          scene: scene.id,
          player: { x: Math.round(st.pos.x), y: Math.round(st.pos.y) },
          target: st.path.length
            ? { x: Math.round(st.path[st.path.length - 1].x), y: Math.round(st.path[st.path.length - 1].y) }
            : null,
          camera: {
            x: Math.round(st.camera.x),
            y: Math.round(st.camera.y),
            zoom: Math.round(st.camera.zoom * 1000) / 1000,
          },
          mouseWorld: st.mouseScreen
            ? (() => {
                const w = screenToWorldCoordinates(st.mouseScreen.x, st.mouseScreen.y, st.camera, st.viewport)
                return { x: Math.round(w.x), y: Math.round(w.y) }
              })()
            : null,
          fps: Math.round(st.fps),
          depthIndex: st.depthIndex,
          nearby: nearbyRef.current,
          lastLogged: st.lastLogged,
        })
      }
    }

    st.raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(st.raf)
      st.lastTime = 0
    }
  }, [activatePoi, debugEnabled, markCommandIssued, reducedMotion, refs.figureRef, refs.labelRef, refs.playerRef, refs.worldRef])

  // Acceso para pruebas automatizadas / calibración
  useEffect(() => {
    const st = S.current
    ;(window as unknown as Record<string, unknown>).__LABOR__ = {
      getPlayer: () => ({ ...st.pos }),
      getCamera: () => ({ ...st.camera }),
      getScene: () => st.scene.id,
      getSave: () => game.get(),
      isWalkable: (x: number, y: number) => isPointInsideWalkableArea(x, y, st.scene.geo),
    }
  }, [])

  return {
    sceneId,
    runtime: S.current.scene,
    transitioning,
    nearbyPoiId,
    nearbyPoi: nearbyPoiId ? findPoi(nearbyPoiId) ?? null : null,
    activeSpaceId,
    activeStationId,
    menuOpen,
    setMenuOpen,
    hasMoved,
    playerDepthIndex,
    debug,
    debugEnabled,
    openSpace,
    closeOverlay,
    closeStation,
    activatePoi,
    goToPoi,
    goToSpace,
    enterScene,
    exitScene,
    resetToSpawn,
    onWorldPointerDown,
    onWorldPointerMove,
    onWorldContextMenu,
  }
}
