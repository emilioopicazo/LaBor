// ============================================================
// LA BOR — configuración de la capa React (intro, entorno)
// La geometría vive en public/maps/labor-overworld.tmj y las constantes
// del motor en src/game/phaser/config.ts.
// ============================================================

export const INTRO_TITLE_MS = 2400
export const INTRO_TEXT_MS = 9500
export const ENTRANCE_GATE_MS = 950

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
