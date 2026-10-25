// ============================================================
// LA BOR — configuración de la capa React (intro, entorno)
// La geometría vive en public/maps/labor-overworld.tmj y las constantes
// del motor en src/game/phaser/config.ts.
// ============================================================

/** intro: el plano se dibuja y, si no se toca, el portón se abre solo */
export const INTRO_AUTO_MS = 7000
/** visitante que ya entró antes: el plano apenas se asienta y entra */
export const INTRO_RETURN_MS = 2600
export const ENTRANCE_GATE_MS = 950
/** llave en localStorage: ya vio el intro completo */
export const INTRO_SEEN_KEY = "labor.intro.v2"

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
