import { useCallback, useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import {
  ARRIVE_EPSILON,
  CAMERA_LERP,
  ENTER_ZOOM,
  EXIT_ZOOM,
  FAST_TRAVEL_MULT,
  FOCUS_BIAS,
  FOCUS_ZOOM_STATION,
  INTERACTION_RADIUS_DEFAULT,
  MOBILE_BREAKPOINT,
  PLAYER_SCALE_MAX,
  PLAYER_SCALE_MIN,
  PLAYER_SPEED,
  ROOM_ZOOM_DESKTOP_MIN,
  ROOM_ZOOM_MOBILE_MIN,
  SCENE_FADE_MS,
  STICK_RADIUS,
  TAP_MAX_MOVE,
  TAP_MAX_MS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  ZOOM_DESKTOP_MIN,
  ZOOM_LERP,
  ZOOM_MOBILE_MIN,
  isDebugEnabled,
  prefersReducedMotion,
} from "../config/world"
import {
  EXTRA_WAYPOINTS,
  PROPERTY_INNER,
  SPAWN_POINT,
  WALKABLE_AREA,
  cornerWaypoints,
  type Point,
  type SceneGeometry,
} from "../data/map"
import { OVERWORLD_PROPS, propObstacles } from "../data/props"
import { SCENES, sceneObstacles, type WorkshopSceneDef } from "../data/scenes"
import { BUILDINGS, WORLD_SPACES, getSpace, type WorkshopSpace } from "../data/spaces"
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

export type PoiKind = "space" | "station" | "exit" | "info"

/** Punto de interés genérico: espacio, estación, salida o ficha. */
export interface Poi {
  id: string
  kind: PoiKind
  x: number
  y: number
  radius: number
  name: string
  action: string
  /** espacio asociado (kind info) */
  spaceId?: string
}

export interface SceneRuntime {
  id: string
  width: number
  height: number
  geo: SceneGeometry
  pois: Poi[]
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
  stick: Point | null
  lastLogged: Point | null
}

export interface EngineRefs {
  worldRef: RefObject<HTMLDivElement>
  playerRef: RefObject<SVGGElement>
  figureRef: RefObject<SVGGElement>
  labelRef: RefObject<HTMLDivElement>
  markerRef: RefObject<SVGGElement>
  stickRingRef: RefObject<HTMLDivElement>
  stickKnobRef: RefObject<HTMLDivElement>
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
  if (space.cta?.enterSceneId) return "ENTRAR"
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
  const blocked = [
    ...BUILDINGS.map((s) => s.buildingRect!),
    ...OVERWORLD_PROPS.filter((p) => p.blockRect).map((p) => p.blockRect!),
  ]
  const geo: SceneGeometry = {
    walkable: WALKABLE_AREA,
    blocked,
    obstacles: propObstacles(OVERWORLD_PROPS),
    waypoints: [...EXTRA_WAYPOINTS, ...cornerWaypoints(blocked, 90, PROPERTY_INNER)],
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
    blocked: def.blocked,
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
  if (def.info) {
    pois.push({
      id: `${def.id}-info`,
      kind: "info",
      x: def.info.position.x,
      y: def.info.position.y,
      radius: def.info.radius,
      name: def.info.label,
      action: "INFORMACIÓN",
      spaceId: def.spaceId,
    })
  }
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
  const mobile = vw < MOBILE_BREAKPOINT
  const floor =
    scene.id === OVERWORLD_ID
      ? mobile
        ? ZOOM_MOBILE_MIN
        : ZOOM_DESKTOP_MIN
      : mobile
        ? ROOM_ZOOM_MOBILE_MIN
        : ROOM_ZOOM_DESKTOP_MIN
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
    stick: null as Point | null,
    pointer: null as { id: number; x: number; y: number; t: number; stick: boolean } | null,
    camera: { x: SPAWN_POINT.x, y: SPAWN_POINT.y, zoom: 0.7 },
    baseZoom: 0.7,
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

  const setFocus = useCallback(
    (poi: { x: number; y: number } | null, mult = 1) => {
      S.current.focus = poi && !reducedMotion ? { x: poi.x, y: poi.y, mult } : null
    },
    [reducedMotion],
  )

  // ---- Overlays / estaciones ------------------------------------
  const openSpace = useCallback((id: string) => {
    const st = S.current
    st.path = []
    st.pendingActivateId = null
    st.stick = null
    setMenuOpen(false)
    setActiveStationId(null)
    setActiveSpaceId(id)
  }, [])

  const closeOverlay = useCallback(() => {
    setActiveSpaceId(null)
  }, [])

  const openStation = useCallback(
    (id: string) => {
      const st = S.current
      st.path = []
      st.pendingActivateId = null
      st.stick = null
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
   * Cambia de escena con un fundido corto y zoom de énfasis: al
   * entrar a un taller la cámara se acerca a su puerta; al volver al
   * patio aparece un poco cerrada y se abre. `arriveAt` coloca al
   * visitante en un punto concreto (la puerta del taller al volver).
   */
  const enterScene = useCallback(
    (targetId: string, arriveAt?: Point, after?: () => void) => {
      const st = S.current
      if (st.scene.id === targetId && !arriveAt) return
      const next =
        targetId === OVERWORLD_ID ? OVERWORLD : SCENES[targetId] ? buildRoom(SCENES[targetId]) : null
      if (!next) return
      setActiveSpaceId(null)
      setActiveStationId(null)
      setMenuOpen(false)
      st.stick = null
      st.path = []
      // zoom hacia la puerta del taller mientras funde
      if (targetId !== OVERWORLD_ID) {
        const def = SCENES[targetId]
        const door = getSpace(def.spaceId)?.interactionPoint ?? st.pos
        setFocus(door, ENTER_ZOOM)
      } else {
        setFocus(null)
      }
      setTransitioning(true)
      st.afterTransition = after ?? null
      const fade = reducedMotion ? 60 : SCENE_FADE_MS
      window.setTimeout(() => {
        st.scene = next
        st.focus = null
        const point = arriveAt ? findNearestWalkablePoint(arriveAt, next.geo) : next.spawn
        st.pos = { ...point }
        st.path = []
        st.pendingActivateId = null
        st.baseZoom = computeBaseZoom(st.viewport.width, st.viewport.height, next)
        st.camera.zoom = targetId === OVERWORLD_ID && !reducedMotion ? st.baseZoom * EXIT_ZOOM : st.baseZoom
        const c = clampCamera(st.pos.x, st.pos.y, st.camera.zoom, st.viewport, next.width, next.height)
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
      else if (poi.kind === "info" && poi.spaceId) openSpace(poi.spaceId)
    },
    [exitScene, findPoi, openSpace, openStation],
  )

  const goToPoi = useCallback(
    (id: string, opts?: { fast?: boolean }) => {
      const st = S.current
      const poi = findPoi(id)
      if (!poi) return
      setMenuOpen(false)
      setActiveSpaceId(null)
      setActiveStationId(null)
      st.stick = null
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
    [activatePoi, findPoi, markCommandIssued, showMarker],
  )

  const goToSpace = useCallback(
    (id: string, opts?: { fast?: boolean }) => {
      const space = getSpace(id)
      if (!space) return
      if (!space.interactionPoint) {
        setMenuOpen(false)
        setActiveStationId(null)
        setActiveSpaceId(id)
        return
      }
      if (S.current.scene.id !== OVERWORLD_ID) {
        const def = S.current.scene.def
        const door = def ? getSpace(def.spaceId)?.interactionPoint : undefined
        enterScene(OVERWORLD_ID, door, () => goToPoi(id, opts))
        return
      }
      goToPoi(id, opts)
    },
    [enterScene, goToPoi],
  )

  /** Botón ENTRAR (táctil): va al punto de interés más cercano. */
  const goToNearest = useCallback(() => {
    const st = S.current
    let best: Poi | null = null
    let bestD = Infinity
    for (const poi of st.scene.pois) {
      const d = dist(st.pos.x, st.pos.y, poi.x, poi.y)
      if (d < bestD) {
        bestD = d
        best = poi
      }
    }
    if (best) goToPoi(best.id)
  }, [goToPoi])

  const resetToSpawn = useCallback(() => {
    const st = S.current
    if (st.scene.id !== OVERWORLD_ID) {
      enterScene(OVERWORLD_ID)
      return
    }
    setActiveSpaceId(null)
    setActiveStationId(null)
    setMenuOpen(false)
    st.stick = null
    st.pendingActivateId = null
    st.path = findPath(st.pos, SPAWN_POINT, st.scene.geo)
    st.speedMult = FAST_TRAVEL_MULT
  }, [enterScene])

  // ---- Puntero: tap = caminar · arrastrar = stick flotante ----------
  const hideStick = useCallback(() => {
    const ring = refs.stickRingRef.current
    if (ring) ring.classList.remove("is-active")
    S.current.stick = null
  }, [refs.stickRingRef])

  const onWorldPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    if (pausedRef.current) return
    S.current.pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), stick: false }
  }, [])

  const onWorldPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const st = S.current
      st.mouseScreen = { x: e.clientX, y: e.clientY }
      const p = st.pointer
      if (!p || p.id !== e.pointerId) return
      const dx = e.clientX - p.x
      const dy = e.clientY - p.y
      if (!p.stick) {
        if (Math.hypot(dx, dy) < TAP_MAX_MOVE) return
        p.stick = true
        st.path = []
        st.pendingActivateId = null
        const ring = refs.stickRingRef.current
        if (ring) {
          ring.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
          ring.classList.add("is-active")
        }
        markCommandIssued()
      }
      const len = Math.hypot(dx, dy)
      const k = len > STICK_RADIUS ? STICK_RADIUS / len : 1
      const kx = dx * k
      const ky = dy * k
      st.stick = { x: kx / STICK_RADIUS, y: ky / STICK_RADIUS }
      const knob = refs.stickKnobRef.current
      if (knob) knob.style.transform = `translate3d(${kx}px, ${ky}px, 0)`
    },
    [markCommandIssued, refs.stickKnobRef, refs.stickRingRef],
  )

  const onWorldPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const st = S.current
      const p = st.pointer
      if (!p || p.id !== e.pointerId) return
      st.pointer = null
      if (p.stick) {
        hideStick()
        return
      }
      if (performance.now() - p.t > TAP_MAX_MS) return
      if (pausedRef.current) return
      const world = screenToWorldCoordinates(e.clientX, e.clientY, st.camera, st.viewport)
      if (!isPointInsideWalkableArea(world.x, world.y, st.scene.geo)) return
      st.path = findPath(st.pos, world, st.scene.geo)
      st.speedMult = 1
      st.pendingActivateId = null
      markCommandIssued()
      showMarker(world.x, world.y)
    },
    [hideStick, markCommandIssued, showMarker],
  )

  const onWorldPointerCancel = useCallback(() => {
    S.current.pointer = null
    hideStick()
  }, [hideStick])

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
      if (key === "e" || key === "enter") {
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
    // llegada: la cámara arranca un poco cerrada sobre el portón y se abre
    st.camera = { x: st.pos.x, y: st.pos.y, zoom: reducedMotion ? st.baseZoom : st.baseZoom * 1.18 }
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
        // 1) Entrada directa: teclado o stick flotante (anulan la ruta)
        let kx = 0
        let ky = 0
        st.keys.forEach((k) => {
          const v = MOVE_KEYS[k]
          if (v) {
            kx += v[0]
            ky += v[1]
          }
        })
        let mag = 1
        if (kx === 0 && ky === 0 && st.stick) {
          kx = st.stick.x
          ky = st.stick.y
          mag = Math.min(1, Math.hypot(kx, ky))
        }
        if (kx !== 0 || ky !== 0) {
          const len = Math.hypot(kx, ky)
          const step = PLAYER_SPEED * dt * (mag < 0.25 ? 0.25 : mag)
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
          if (Math.abs(kx) > 0.05) st.facing = kx > 0 ? 1 : -1
          if (walkedThisFrame) markCommandIssued()
        } else if (st.path.length > 0) {
          // 2) Ruta activa (tap / clic / fast travel)
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

      // 4) Profundidad
      let idx = 0
      const anchors = scene.depthAnchors
      while (idx < anchors.length && anchors[idx] <= st.pos.y) idx++
      if (idx !== st.depthIndex) {
        st.depthIndex = idx
        setPlayerDepthIndex(idx)
      }

      // 5) Cámara
      const focus = st.focus
      const targetX = focus ? lerp(st.pos.x, focus.x, FOCUS_BIAS) : st.pos.x
      const targetY = focus ? lerp(st.pos.y, focus.y, FOCUS_BIAS) : st.pos.y
      const targetZoom = st.baseZoom * (focus ? focus.mult : 1)
      const clamped = clampCamera(targetX, targetY, st.camera.zoom, st.viewport, scene.width, scene.height)
      st.camera.x = damp(st.camera.x, clamped.x, Math.min(CAMERA_LERP * lerpBoost, 0.5), dt)
      st.camera.y = damp(st.camera.y, clamped.y, Math.min(CAMERA_LERP * lerpBoost, 0.5), dt)
      st.camera.zoom = damp(st.camera.zoom, targetZoom, Math.min(ZOOM_LERP * lerpBoost, 0.5), dt)

      // 6) DOM
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
          refs.labelRef.current.style.transform = `translate3d(${s.x}px, ${s.y - 36 * st.camera.zoom}px, 0)`
        }
      }

      // 7) Debug
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
          stick: st.stick ? { x: Math.round(st.stick.x * 100) / 100, y: Math.round(st.stick.y * 100) / 100 } : null,
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

  useEffect(() => {
    const st = S.current
    ;(window as unknown as Record<string, unknown>).__LABOR__ = {
      getPlayer: () => ({ ...st.pos }),
      getCamera: () => ({ ...st.camera }),
      getScene: () => st.scene.id,
      getSave: () => game.get(),
      getStick: () => st.stick,
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
    goToNearest,
    enterScene,
    exitScene,
    resetToSpawn,
    onWorldPointerDown,
    onWorldPointerMove,
    onWorldPointerUp,
    onWorldPointerCancel,
    onWorldContextMenu,
  }
}
