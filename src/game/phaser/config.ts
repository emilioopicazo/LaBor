// ============================================================
// LA BOR — constantes del motor (48 px = 1 m)
// ============================================================

export const PX_PER_M = 48

/** velocidad del visitante (px/s) ≈ 3.5 m/s: caminar con ganas */
export const PLAYER_SPEED = 170
export const FAST_TRAVEL_MULT = 2.6
/** radio del colisionador de pies (≈ 0.33 m) */
export const PLAYER_RADIUS = 16
export const PLAYER_SCALE = 3
export const WALK_FPS = 8

/** cámara */
export const CAM_LERP = 0.09
export const DEADZONE_W = 0.34
export const DEADZONE_H = 0.24
/** margen visible alrededor del predio (m) */
export const WORLD_MARGIN_M = 2.2
export const ROOM_MARGIN = 96
export const ROOM_ZOOM_MULT = 1.2
export const FOCUS_ZOOM_MULT = 1.1

/** tap: máximo desplazamiento y duración para contar como toque */
export const TAP_MAX_MOVE = 14
export const TAP_MAX_MS = 420
/** zona del joystick: mitad izquierda, debajo del HUD superior */
export const JOY_ZONE_X = 0.5
export const JOY_ZONE_TOP = 0.2

export const ZOOM_MIN = 0.72
export const ZOOM_MAX = 2.4

/** zoom base según viewport: un teléfono ve ~9.5 m de ancho, no todo el predio */
export function baseZoomFor(width: number, height: number): number {
  const portrait = height > width
  const targetMeters = width < 600 ? (portrait ? 9.5 : 18) : width < 1000 ? 16 : 22
  const z = width / (targetMeters * PX_PER_M)
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z))
}

export function isMapDebug(): boolean {
  if (typeof window === "undefined") return false
  const q = new URLSearchParams(window.location.search)
  return q.get("mapdebug") === "1" || q.has("debug")
}
