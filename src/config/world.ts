// ============================================================
// LA BOR — configuración global del mundo
// Todas las constantes de dimensión, movimiento, cámara, gameplay
// y debug viven aquí. La geometría del mapa vive en src/data/map.ts,
// el contenido de los espacios en src/data/spaces.ts, los props en
// src/data/props.ts y las escenas de taller en src/data/scenes.ts.
// ============================================================

// El mundo = el predio completo con sus muros (geometría del
// prototipo de diseño 1280×1160 escalada ×2.5 para dar espacio).
export const WORLD_WIDTH = 3200
export const WORLD_HEIGHT = 2900
export const WALL = 100 // espesor del muro perimetral

// --- Movimiento del visitante ---------------------------------
export const PLAYER_SPEED = 340 // world px / segundo
export const FAST_TRAVEL_MULT = 3 // multiplicador al usar el menú (fast travel)
export const ARRIVE_EPSILON = 3 // distancia para considerar "llegó"

// --- Sprite del visitante ------------------------------------
// px de mundo por px lógico del sprite (16×28 lógico → 64×112)
export const PLAYER_SPRITE_SCALE = 4
export const WALK_FRAME_MS = 170

// --- Profundidad 2.5D -----------------------------------------
export const PLAYER_SCALE_MIN = 0.8
export const PLAYER_SCALE_MAX = 1.0

// --- Cámara ----------------------------------------------------
export const CAMERA_LERP = 0.08
export const ZOOM_LERP = 0.06

// Zoom del patio (fijo: en el patio no hay zoom de interacción).
// El motor nunca baja del zoom que cubre el viewport completo.
export const ZOOM_DESKTOP_MIN = 0.62
export const ZOOM_MOBILE_MIN = 0.55
export const MOBILE_BREAKPOINT = 820

// Zoom dentro de los talleres (más cerca que el patio).
export const ROOM_ZOOM_DESKTOP_MIN = 0.92
export const ROOM_ZOOM_MOBILE_MIN = 0.72

// Énfasis al entrar/salir de un taller (zoom in hacia la puerta,
// zoom out al volver al patio).
export const ENTER_ZOOM = 1.35
export const EXIT_ZOOM = 1.25
export const FOCUS_ZOOM_STATION = 1.15
export const FOCUS_BIAS = 0.55

// --- Interacción ----------------------------------------------
export const INTERACTION_RADIUS_DEFAULT = 160

// --- Control táctil (stick flotante) --------------------------
export const STICK_RADIUS = 46 // px de pantalla
export const TAP_MAX_MS = 600
export const TAP_MAX_MOVE = 12

// --- Escenas / talleres --------------------------------------
export const SCENE_FADE_MS = 320

// --- Intro -----------------------------------------------------
export const INTRO_TITLE_MS = 2400
export const INTRO_TEXT_MS = 6200
export const ENTRANCE_GATE_MS = 950

// --- Sonido (arquitectura mínima, apagado por defecto) --------
export const SOUND_ENABLED = false

// --- Debug -----------------------------------------------------
export const DEBUG_WORLD = false

export function isDebugEnabled(): boolean {
  if (DEBUG_WORLD) return true
  if (typeof window === "undefined") return false
  return new URLSearchParams(window.location.search).has("debug")
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(pointer: coarse)").matches
}

// --- Metadata real (solo metadata, no geometría) --------------
export const LOCATION = {
  name: "La Bor",
  lat: 20.2061954,
  lng: -87.4752482,
  place: "Tulum, Quintana Roo, México",
}
