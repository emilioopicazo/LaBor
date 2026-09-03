// ============================================================
// LA BOR — configuración global del mundo
// Todas las constantes de dimensión, movimiento, cámara y debug
// viven aquí. La geometría del mapa vive en src/data/map.ts y el
// contenido de los espacios en src/data/spaces.ts.
// ============================================================

export const WORLD_WIDTH = 2400
export const WORLD_HEIGHT = 1600

// --- Movimiento del visitante ---------------------------------
export const PLAYER_SPEED = 300 // world px / segundo
export const FAST_TRAVEL_MULT = 3 // multiplicador al usar el menú (fast travel)
export const ARRIVE_EPSILON = 3 // distancia para considerar "llegó"

// --- Profundidad 2.5D -----------------------------------------
export const PLAYER_SCALE_MIN = 0.68
export const PLAYER_SCALE_MAX = 1.0
export const DEPTH_Y_NEAR = 1100 // y donde el visitante se ve más grande
export const DEPTH_Y_FAR = 400 // y donde el visitante se ve más chico

// --- Cámara ----------------------------------------------------
// CAMERA_LERP es el factor por frame a 60fps (se convierte a una
// constante independiente del framerate dentro del motor).
export const CAMERA_LERP = 0.08
export const ZOOM_LERP = 0.06

// Zoom mínimo preferido (el motor nunca baja del zoom que cubre
// el viewport completo para no mostrar vacío fuera del mundo).
export const ZOOM_DESKTOP_MIN = 0.78
export const ZOOM_MOBILE_MIN = 0.7
export const MOBILE_BREAKPOINT = 820

// --- Interacción ----------------------------------------------
export const INTERACTION_RADIUS_DEFAULT = 110

// --- Reveal de entrada ----------------------------------------
export const ENTRANCE_GATE_MS = 950 // duración de la transición de portón
export const REVEAL_FROM = { x: 1150, y: 800 } // la cámara arranca viendo el patio

// --- Sonido (arquitectura mínima, apagado por defecto) --------
export const SOUND_ENABLED = false

// --- Debug -----------------------------------------------------
// También se puede activar con ?debug en la URL.
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

// --- Metadata real (solo metadata en V0, no geometría) --------
// Punto oficial de Google Maps de La Bor. Reservado para futuro
// "CÓMO LLEGAR" / deep link / SEO. No usar para el mapa interno.
export const LOCATION = {
  name: "La Bor",
  lat: 20.2061954,
  lng: -87.4752482,
  place: "Tulum, Quintana Roo, México",
}
