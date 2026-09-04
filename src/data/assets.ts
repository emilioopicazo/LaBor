// ============================================================
// LA BOR — manifiesto de assets
// Sprites pixel-art del sistema de diseño (docs/LABOR_ART_DIRECTION_
// ASSETS.md). Cada pieza es un PNG transparente a resolución lógica;
// el mundo los escala con `image-rendering: pixelated`.
// Para reemplazar una pieza: sustituir el archivo en public/assets/
// (mismo nombre) — no hace falta tocar código. Si cambia el tamaño
// lógico, actualizar w/h aquí.
// ============================================================

export interface SpriteAsset {
  src: string
  /** tamaño lógico en píxeles de arte */
  w: number
  h: number
}

const A = "/assets"

const sprite = (src: string, w: number, h: number): SpriteAsset => ({ src: `${A}/${src}`, w, h })

export const ASSETS = {
  // --- mundo ---------------------------------------------------
  floorPatio: sprite("world/floor/world-floor-patio-v1.png", 320, 180),
  wallH: sprite("world/walls/wall-h-v1.png", 256, 8),
  wallV: sprite("world/walls/wall-v-v1.png", 8, 232),

  // --- techumbres (una por estructura) --------------------------
  roofs: {
    "nave-01": sprite("world/roofs/roof-nave-01-v1.png", 72, 52),
    "nave-02": sprite("world/roofs/roof-nave-02-v1.png", 72, 52),
    "nave-03": sprite("world/roofs/roof-nave-03-v1.png", 60, 48),
    "pabellon-01": sprite("world/roofs/roof-pabellon-01-v1.png", 70, 38),
    "pabellon-02": sprite("world/roofs/roof-pabellon-02-v1.png", 70, 38),
    "pabellon-03": sprite("world/roofs/roof-pabellon-03-v1.png", 40, 35),
    "pabellon-04": sprite("world/roofs/roof-pabellon-04-v1.png", 46, 38),
    contraste: sprite("world/roofs/roof-contraste-v1.png", 39, 39),
    veta: sprite("world/roofs/roof-veta-v1.png", 32, 72),
    "veta-sur": sprite("world/roofs/roof-veta-sur-v1.png", 36, 80),
    mannino: sprite("world/roofs/roof-mannino-v1.png", 32, 80),
  } as Record<string, SpriteAsset>,

  // --- vegetación (separada en base / copa para profundidad) ----
  treeMainBase: sprite("world/vegetation/tree-main-base-v1.png", 40, 40),
  treeMainCanopy: sprite("world/vegetation/tree-main-canopy-v1.png", 40, 40),
  treeSidewalkBase: sprite("world/vegetation/tree-sidewalk-base-v1.png", 30, 30),
  treeSidewalkCanopy: sprite("world/vegetation/tree-sidewalk-canopy-v1.png", 30, 30),
  palmBase: sprite("world/vegetation/palm-base-v1.png", 30, 30),
  palmCanopy: sprite("world/vegetation/palm-canopy-v1.png", 30, 30),
  shrub01: sprite("world/vegetation/shrub-01-v1.png", 16, 14),
  shrub02: sprite("world/vegetation/shrub-02-v1.png", 16, 14),

  // --- props ---------------------------------------------------
  eventsBoard: sprite("world/props/prop-events-board-v1.png", 40, 30),
  infoTotem: sprite("world/props/prop-info-totem-v1.png", 14, 30),
  worktable: sprite("world/props/prop-worktable-v1.png", 36, 24),
  woodStack: sprite("world/props/prop-wood-stack-v1.png", 30, 20),
  palletStack: sprite("world/props/prop-pallet-stack-v1.png", 26, 20),
  gateMain: sprite("world/props/prop-gate-main-v1.png", 60, 14),
  planter: sprite("world/props/prop-planter-v1.png", 16, 18),
  waterTank: sprite("world/props/prop-water-tank-v1.png", 18, 18),
  installationBase: sprite("world/installations/installation-base-v1.png", 44, 44),

  // --- personajes ----------------------------------------------
  visitorIdle: sprite("characters/visitor/visitor-idle-front-v1.png", 16, 28),
  visitorWalk1: sprite("characters/visitor/visitor-walk-01-v1.png", 16, 28),
  visitorWalk2: sprite("characters/visitor/visitor-walk-02-v1.png", 16, 28),
  cat1: sprite("characters/fauna/cat-walk-01-v1.png", 20, 14),
  cat2: sprite("characters/fauna/cat-walk-02-v1.png", 20, 14),
  bird1: sprite("characters/fauna/bird-fly-01-v1.png", 14, 10),
  bird2: sprite("characters/fauna/bird-fly-02-v1.png", 14, 10),
}

/** Todos los sprites, para precargar antes de ENTRAR. */
export function allSpriteSrcs(): string[] {
  const out: string[] = []
  const walk = (v: unknown) => {
    if (!v || typeof v !== "object") return
    if ("src" in (v as SpriteAsset) && typeof (v as SpriteAsset).src === "string") {
      out.push((v as SpriteAsset).src)
      return
    }
    Object.values(v as Record<string, unknown>).forEach(walk)
  }
  walk(ASSETS)
  return out
}
