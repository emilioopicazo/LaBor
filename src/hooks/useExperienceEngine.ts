import { useCallback, useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import {
  ARRIVE_EPSILON,
  CAMERA_LERP,
  DEPTH_Y_FAR,
  DEPTH_Y_NEAR,
  FAST_TRAVEL_MULT,
  INTERACTION_RADIUS_DEFAULT,
  MOBILE_BREAKPOINT,
  PLAYER_SCALE_MAX,
  PLAYER_SCALE_MIN,
  PLAYER_SPEED,
  REVEAL_FROM,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  ZOOM_DESKTOP_MIN,
  ZOOM_LERP,
  ZOOM_MOBILE_MIN,
  isDebugEnabled,
  prefersReducedMotion,
} from "../config/world"
import { SPAWN_POINT, type Point } from "../data/map"
import { WORLD_SPACES, getSpace } from "../data/spaces"
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
import { damp } from "../utils/interpolation"

export interface DebugInfo {
  player: Point
  target: Point | null
  camera: { x: number; y: number; zoom: number }
  mouseWorld: Point | null
  fps: number
  lastLogged: Point | null
}

export interface EngineRefs {
  worldRef: RefObject<HTMLDivElement>
  playerRef: RefObject<SVGGElement>
  figureRef: RefObject<SVGGElement>
  labelRef: RefObject<HTMLDivElement>
  markerRef: RefObject<SVGGElement>
}

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

function computeTargetZoom(vw: number, vh: number): number {
  const cover = Math.max(vw / WORLD_WIDTH, vh / WORLD_HEIGHT)
  const floor = vw < MOBILE_BREAKPOINT ? ZOOM_MOBILE_MIN : ZOOM_DESKTOP_MIN
  return Math.max(cover, floor)
}

export function useExperienceEngine(refs: EngineRefs) {
  const debugEnabled = isDebugEnabled()
  const reducedMotion = prefersReducedMotion()

  const [nearbySpaceId, setNearbySpaceId] = useState<string | null>(null)
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const [isWalking, setIsWalking] = useState(false)
  const [debug, setDebug] = useState<DebugInfo | null>(null)

  // Estado mutable del motor (no dispara renders)
  const S = useRef({
    pos: { ...SPAWN_POINT },
    path: [] as Point[],
    speedMult: 1,
    pendingOpenId: null as string | null,
    facing: 1,
    walking: false,
    keys: new Set<string>(),
    camera: { x: REVEAL_FROM.x, y: REVEAL_FROM.y, zoom: 0.8 },
    targetZoom: 0.8,
    viewport: { width: 1280, height: 720 },
    mouseScreen: null as Point | null,
    lastLogged: null as Point | null,
    fps: 60,
    lastDebugPush: 0,
    raf: 0,
    lastTime: 0,
  })

  // Espejos para leer estado de React dentro del loop
  const pausedRef = useRef(false)
  pausedRef.current = activeSpaceId !== null || menuOpen
  const nearbyRef = useRef<string | null>(null)
  nearbyRef.current = nearbySpaceId

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
            { opacity: 0.9, transform: "scale(0.45)" },
            { opacity: 0.7, transform: "scale(1)", offset: 0.35 },
            { opacity: 0, transform: "scale(1.05)" },
          ],
          { duration: 650, easing: "ease-out", fill: "forwards" },
        )
      }
    },
    [refs.markerRef],
  )

  const openSpace = useCallback((id: string) => {
    const st = S.current
    st.path = []
    st.pendingOpenId = null
    setMenuOpen(false)
    setActiveSpaceId(id)
  }, [])

  const closeOverlay = useCallback(() => {
    setActiveSpaceId(null)
  }, [])

  /**
   * Camina hacia el punto de interacción de un espacio y abre su
   * overlay al llegar. `fast` = fast travel del menú (más veloz).
   * Los espacios sin punto físico abren su overlay directamente.
   */
  const goToSpace = useCallback(
    (id: string, opts?: { fast?: boolean }) => {
      const space = getSpace(id)
      if (!space) return
      setMenuOpen(false)
      setActiveSpaceId(null)
      if (!space.interactionPoint) {
        setActiveSpaceId(id)
        return
      }
      const st = S.current
      const point = space.interactionPoint
      // Si ya estamos dentro del radio, abre de una vez.
      if (dist(st.pos.x, st.pos.y, point.x, point.y) <= space.interactionRadius) {
        setActiveSpaceId(id)
        return
      }
      const target = findNearestWalkablePoint(point)
      st.path = findPath(st.pos, target)
      st.speedMult = opts?.fast ? FAST_TRAVEL_MULT : 1
      st.pendingOpenId = id
      markCommandIssued()
      showMarker(target.x, target.y)
    },
    [markCommandIssued, showMarker],
  )

  const resetToSpawn = useCallback(() => {
    const st = S.current
    setActiveSpaceId(null)
    setMenuOpen(false)
    st.pendingOpenId = null
    st.path = findPath(st.pos, SPAWN_POINT)
    st.speedMult = FAST_TRAVEL_MULT
  }, [])

  const onWorldPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      if (pausedRef.current) return
      const st = S.current
      const world = screenToWorldCoordinates(e.clientX, e.clientY, st.camera, st.viewport)
      if (!isPointInsideWalkableArea(world.x, world.y)) return // clic inválido: se ignora (V0)
      st.path = findPath(st.pos, world)
      st.speedMult = 1
      st.pendingOpenId = null
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
      console.log(`[LA BOR] world coordinate → x: ${point.x}, y: ${point.y}`)
    },
    [debugEnabled],
  )

  // ---- Teclado -------------------------------------------------
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === "escape") {
        setActiveSpaceId((cur) => {
          if (cur !== null) return null
          setMenuOpen(false)
          return cur
        })
        return
      }
      if (key === "e") {
        if (!pausedRef.current && nearbyRef.current) {
          openSpace(nearbyRef.current)
        }
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
  }, [openSpace])

  // ---- Viewport / resize --------------------------------------
  useEffect(() => {
    const st = S.current
    const measure = () => {
      st.viewport = { width: window.innerWidth, height: window.innerHeight }
      st.targetZoom = computeTargetZoom(st.viewport.width, st.viewport.height)
    }
    measure()
    // Reveal inicial: la cámara arranca viendo el patio, un poco
    // más abierta, y se asienta sobre el visitante (~1s).
    if (reducedMotion) {
      st.camera = { x: st.pos.x, y: st.pos.y, zoom: st.targetZoom }
    } else {
      st.camera = {
        x: REVEAL_FROM.x,
        y: REVEAL_FROM.y,
        zoom: Math.max(
          st.targetZoom * 0.92,
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
          st.pendingOpenId = null
          if (isPointInsideWalkableArea(nx, ny)) {
            st.pos = { x: nx, y: ny }
            walkedThisFrame = true
          } else if (isPointInsideWalkableArea(nx, st.pos.y)) {
            st.pos = { x: nx, y: st.pos.y }
            walkedThisFrame = true
          } else if (isPointInsideWalkableArea(st.pos.x, ny)) {
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
              if (st.pendingOpenId) {
                const space = getSpace(st.pendingOpenId)
                st.pendingOpenId = null
                if (
                  space?.interactionPoint &&
                  dist(st.pos.x, st.pos.y, space.interactionPoint.x, space.interactionPoint.y) <=
                    space.interactionRadius * 1.3
                ) {
                  setActiveSpaceId(space.id)
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

        // 3) Hotspot cercano (el más próximo dentro de su radio)
        let nearest: string | null = null
        let nearestDist = Infinity
        for (const space of WORLD_SPACES) {
          const p = space.interactionPoint
          if (!p) continue
          const d = dist(st.pos.x, st.pos.y, p.x, p.y)
          if (d <= (space.interactionRadius || INTERACTION_RADIUS_DEFAULT) && d < nearestDist) {
            nearest = space.id
            nearestDist = d
          }
        }
        if (nearest !== nearbyRef.current) {
          nearbyRef.current = nearest
          setNearbySpaceId(nearest)
        }
      }

      if (walkedThisFrame !== st.walking) {
        st.walking = walkedThisFrame
        setIsWalking(walkedThisFrame)
        refs.figureRef.current?.classList.toggle("is-walking", walkedThisFrame)
      }

      // 4) Cámara: sigue al visitante con amortiguación
      const clamped = clampCamera(
        st.pos.x,
        st.pos.y,
        st.camera.zoom,
        st.viewport,
        WORLD_WIDTH,
        WORLD_HEIGHT,
      )
      st.camera.x = damp(st.camera.x, clamped.x, Math.min(CAMERA_LERP * lerpBoost, 0.5), dt)
      st.camera.y = damp(st.camera.y, clamped.y, Math.min(CAMERA_LERP * lerpBoost, 0.5), dt)
      st.camera.zoom = damp(st.camera.zoom, st.targetZoom, Math.min(ZOOM_LERP * lerpBoost, 0.5), dt)

      // 5) Escritura al DOM (sin re-render de React)
      if (refs.worldRef.current) {
        refs.worldRef.current.style.transform = cameraTransform(st.camera, st.viewport)
      }
      if (refs.playerRef.current) {
        refs.playerRef.current.setAttribute(
          "transform",
          `translate(${st.pos.x}, ${st.pos.y})`,
        )
      }
      if (refs.figureRef.current) {
        const t = clamp((st.pos.y - DEPTH_Y_FAR) / (DEPTH_Y_NEAR - DEPTH_Y_FAR), 0, 1)
        const scale = PLAYER_SCALE_MIN + (PLAYER_SCALE_MAX - PLAYER_SCALE_MIN) * t
        refs.figureRef.current.setAttribute(
          "transform",
          `scale(${scale * st.facing}, ${scale})`,
        )
      }
      if (refs.labelRef.current && nearbyRef.current) {
        const space = getSpace(nearbyRef.current)
        if (space?.interactionPoint) {
          const s = worldToScreenCoordinates(
            space.interactionPoint.x,
            space.interactionPoint.y,
            st.camera,
            st.viewport,
          )
          refs.labelRef.current.style.transform = `translate3d(${s.x}px, ${s.y - 34 * st.camera.zoom}px, 0)`
        }
      }

      // 6) Debug (throttled)
      if (debugEnabled && time - st.lastDebugPush > 150) {
        st.lastDebugPush = time
        setDebug({
          player: { x: Math.round(st.pos.x), y: Math.round(st.pos.y) },
          target: st.path.length
            ? {
                x: Math.round(st.path[st.path.length - 1].x),
                y: Math.round(st.path[st.path.length - 1].y),
              }
            : null,
          camera: {
            x: Math.round(st.camera.x),
            y: Math.round(st.camera.y),
            zoom: Math.round(st.camera.zoom * 1000) / 1000,
          },
          mouseWorld: st.mouseScreen
            ? (() => {
                const w = screenToWorldCoordinates(
                  st.mouseScreen.x,
                  st.mouseScreen.y,
                  st.camera,
                  st.viewport,
                )
                return { x: Math.round(w.x), y: Math.round(w.y) }
              })()
            : null,
          fps: Math.round(st.fps),
          lastLogged: st.lastLogged,
        })
      }
    }

    st.raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(st.raf)
      st.lastTime = 0
    }
  }, [debugEnabled, markCommandIssued, reducedMotion, refs.figureRef, refs.labelRef, refs.playerRef, refs.worldRef])

  // Pequeño acceso para pruebas automatizadas / calibración
  useEffect(() => {
    const st = S.current
    ;(window as unknown as Record<string, unknown>).__LABOR__ = {
      getPlayer: () => ({ ...st.pos }),
      getCamera: () => ({ ...st.camera }),
      isWalkable: (x: number, y: number) => isPointInsideWalkableArea(x, y),
    }
  }, [])

  return {
    nearbySpaceId,
    activeSpaceId,
    menuOpen,
    setMenuOpen,
    hasMoved,
    isWalking,
    debug,
    debugEnabled,
    openSpace,
    closeOverlay,
    goToSpace,
    resetToSpawn,
    onWorldPointerDown,
    onWorldPointerMove,
    onWorldContextMenu,
  }
}
