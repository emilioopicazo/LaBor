// ============================================================
// LA BOR — props del patio (overworld)
// Cada prop es un sprite con un ancla de suelo (x, y = base). El
// orden de dibujo se resuelve por `y` (regla de profundidad):
// el visitante se dibuja detrás de un prop cuando está más al
// norte que su ancla y delante cuando está más al sur.
// ============================================================

import { ASSETS, type SpriteAsset } from "./assets"

export interface WorldProp {
  id: string
  asset: SpriteAsset
  /** centro horizontal del sprite (mundo) */
  x: number
  /** ancla de suelo = borde inferior del sprite (mundo) */
  y: number
  /** tamaño de dibujo en px de mundo */
  w: number
  h: number
  /** obstáculo circular (centro relativo al ancla: dy negativo = arriba) */
  obstacle?: { radius: number; dy?: number }
  /** copa separada (árboles / palmas): se dibuja encima con vaivén */
  canopy?: { asset: SpriteAsset; dy: number; sway: "slow" | "fast" }
  /** clase CSS opcional para vida ambiental */
  className?: string
  /** desplazamiento de dibujo respecto al ancla (ordena por y, dibuja en y+dyDraw) */
  dyDraw?: number
}

// Escalas de referencia (px de mundo por px lógico)
const TREE = 8.3
const PALM = 7
const PROP = 7
const SMALL = 5

export const OVERWORLD_PROPS: WorldProp[] = [
  // ---- vegetación -------------------------------------------
  {
    id: "tree-main",
    asset: ASSETS.treeMainBase,
    x: 1195,
    y: 470,
    w: 40 * TREE,
    h: 40 * TREE,
    obstacle: { radius: 30, dy: -6 },
    canopy: { asset: ASSETS.treeMainCanopy, dy: -50, sway: "slow" },
  },
  {
    id: "shrub-01",
    asset: ASSETS.shrub01,
    x: 1085,
    y: 505,
    w: 16 * PROP,
    h: 14 * PROP,
    obstacle: { radius: 30, dy: -14 },
  },
  {
    id: "shrub-02",
    asset: ASSETS.shrub02,
    x: 1305,
    y: 262,
    w: 16 * PROP,
    h: 14 * PROP,
  },
  {
    id: "palm-01",
    asset: ASSETS.palmBase,
    x: 560,
    y: 640,
    w: 30 * PALM,
    h: 30 * PALM,
    obstacle: { radius: 22, dy: -10 },
    canopy: { asset: ASSETS.palmCanopy, dy: -30, sway: "fast" },
  },
  {
    id: "palm-02",
    asset: ASSETS.palmBase,
    x: 1520,
    y: 900,
    w: 30 * PALM,
    h: 30 * PALM,
    obstacle: { radius: 22, dy: -10 },
    canopy: { asset: ASSETS.palmCanopy, dy: -30, sway: "fast" },
  },
  {
    id: "tree-sidewalk",
    asset: ASSETS.treeSidewalkBase,
    x: 2064,
    y: 700,
    w: 30 * PALM,
    h: 30 * PALM,
    canopy: { asset: ASSETS.treeSidewalkCanopy, dy: -26, sway: "slow" },
  },

  // ---- instalación central -------------------------------------
  {
    id: "installation-base",
    asset: ASSETS.installationBase,
    x: 860,
    y: 730,
    w: 44 * 6,
    h: 44 * 6,
    obstacle: { radius: 46, dy: -40 },
  },

  // ---- objetos del patio --------------------------------------
  {
    id: "events-board",
    asset: ASSETS.eventsBoard,
    x: 1100,
    y: 762,
    w: 40 * PROP,
    h: 30 * PROP,
    obstacle: { radius: 34, dy: -12 },
  },
  {
    id: "info-totem",
    asset: ASSETS.infoTotem,
    x: 640,
    y: 900,
    w: 14 * PROP,
    h: 30 * PROP,
    obstacle: { radius: 18, dy: -12 },
  },
  {
    id: "worktable",
    asset: ASSETS.worktable,
    x: 520,
    y: 900,
    w: 36 * PROP,
    h: 24 * PROP,
    obstacle: { radius: 42, dy: -22 },
  },
  {
    id: "wood-stack",
    asset: ASSETS.woodStack,
    x: 455,
    y: 600,
    w: 30 * SMALL,
    h: 20 * SMALL,
    obstacle: { radius: 34, dy: -20 },
  },
  {
    id: "planter-01",
    asset: ASSETS.planter,
    x: 600,
    y: 1040,
    w: 16 * PROP,
    h: 18 * PROP,
    obstacle: { radius: 24, dy: -16 },
  },
  {
    id: "planter-02",
    asset: ASSETS.planter,
    x: 1300,
    y: 1062,
    w: 16 * PROP,
    h: 18 * PROP,
    obstacle: { radius: 24, dy: -16 },
  },
  {
    id: "water-tank",
    asset: ASSETS.waterTank,
    x: 1560,
    y: 1040,
    w: 18 * PROP,
    h: 18 * PROP,
    obstacle: { radius: 30, dy: -30 },
  },
  {
    id: "pallets",
    asset: ASSETS.palletStack,
    x: 1780,
    y: 1114,
    w: 26 * SMALL,
    h: 20 * SMALL,
  },
]

/**
 * Cambios de mundo: props que aparecen cuando la quest avanza.
 * La base de madera instalada se dibuja sobre el pedestal (ordena
 * justo después de él en profundidad).
 */
export function worldChangeProps(flags: Record<string, boolean>): WorldProp[] {
  const out: WorldProp[] = []
  if (flags["pieza.baseInstalled"]) {
    out.push({
      id: "pieza-base",
      asset: ASSETS.woodStack,
      x: 860,
      y: 731,
      w: 30 * 4.5,
      h: 20 * 4.5,
      dyDraw: -92,
    })
  }
  return out
}

/** Obstáculos derivados de los props (para el motor). */
export function propObstacles(props: WorldProp[]) {
  return props
    .filter((p) => p.obstacle)
    .map((p) => ({
      id: p.id,
      x: p.x,
      y: p.y + (p.obstacle!.dy ?? 0),
      radius: p.obstacle!.radius,
    }))
}
