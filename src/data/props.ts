// ============================================================
// LA BOR — props del patio (overworld)
// Cada prop es un sprite con un ancla de suelo (x, y = base). El
// orden de dibujo se resuelve por `y` (regla de profundidad):
// el visitante se dibuja detrás de un prop cuando está más al
// norte que su ancla y delante cuando está más al sur.
// Vegetación: solo la del plano medido (árbol principal + 2 plantas).
// ============================================================

import { ASSETS, type SpriteAsset } from "./assets"

export interface WorldProp {
  id: string
  asset?: SpriteAsset
  /** forma vectorial en lugar de sprite (componentes de la pieza) */
  shape?: "metal-frame" | "silver-detail"
  /** centro horizontal del sprite (mundo) */
  x: number
  /** ancla de suelo = borde inferior del sprite (mundo) */
  y: number
  /** tamaño de dibujo en px de mundo */
  w: number
  h: number
  /** obstáculo circular (centro relativo al ancla: dy negativo = arriba) */
  obstacle?: { radius: number; dy?: number }
  /** copa separada (árboles): se dibuja encima con vaivén */
  canopy?: { asset: SpriteAsset; dy: number; sway: "slow" | "fast" }
  /** clase CSS opcional para vida ambiental */
  className?: string
  /** desplazamiento de dibujo respecto al ancla (ordena por y, dibuja en y+dyDraw) */
  dyDraw?: number
}

// Escalas de referencia (px de mundo por px lógico)
const TREE = 12.5
const PROP = 9
const SMALL = 7

export const OVERWORLD_PROPS: WorldProp[] = [
  // ---- vegetación (la del plano) ------------------------------
  {
    id: "tree-main",
    asset: ASSETS.treeMainBase,
    x: 1712,
    y: 800,
    w: 40 * TREE,
    h: 40 * TREE,
    obstacle: { radius: 66, dy: -46 },
    canopy: { asset: ASSETS.treeMainCanopy, dy: -70, sway: "slow" },
  },
  {
    id: "shrub-01",
    asset: ASSETS.shrub01,
    x: 1540,
    y: 900,
    w: 16 * PROP,
    h: 14 * PROP,
    obstacle: { radius: 44, dy: -24 },
  },
  {
    id: "shrub-02",
    asset: ASSETS.shrub02,
    x: 1900,
    y: 920,
    w: 16 * PROP,
    h: 14 * PROP,
    obstacle: { radius: 44, dy: -24 },
  },

  // ---- instalación central -------------------------------------
  {
    id: "installation-base",
    asset: ASSETS.installationBase,
    x: 1820,
    y: 1390,
    w: 44 * 10,
    h: 44 * 10,
    obstacle: { radius: 130, dy: -218 },
  },

  // ---- objetos del patio --------------------------------------
  {
    id: "events-board",
    asset: ASSETS.eventsBoard,
    x: 2330,
    y: 1720,
    w: 40 * PROP,
    h: 30 * PROP,
    obstacle: { radius: 62, dy: -30 },
  },
  {
    id: "info-totem",
    asset: ASSETS.infoTotem,
    x: 900,
    y: 1700,
    w: 14 * PROP,
    h: 30 * PROP,
    obstacle: { radius: 34, dy: -22 },
  },
  {
    id: "worktable",
    asset: ASSETS.worktable,
    x: 700,
    y: 1500,
    w: 36 * PROP,
    h: 24 * PROP,
    obstacle: { radius: 100, dy: -70 },
  },
  {
    id: "wood-stack",
    asset: ASSETS.woodStack,
    x: 640,
    y: 1100,
    w: 30 * SMALL,
    h: 20 * SMALL,
    obstacle: { radius: 62, dy: -44 },
  },
  {
    id: "planter-01",
    asset: ASSETS.planter,
    x: 1300,
    y: 1500,
    w: 16 * 8,
    h: 18 * 8,
    obstacle: { radius: 44, dy: -30 },
  },
  {
    id: "planter-02",
    asset: ASSETS.planter,
    x: 2300,
    y: 1900,
    w: 16 * 8,
    h: 18 * 8,
    obstacle: { radius: 44, dy: -30 },
  },
  {
    id: "water-tank",
    asset: ASSETS.waterTank,
    x: 1450,
    y: 1250,
    w: 18 * PROP,
    h: 18 * PROP,
    obstacle: { radius: 62, dy: -62 },
  },
  {
    id: "pallets",
    asset: ASSETS.palletStack,
    x: 2400,
    y: 1950,
    w: 26 * SMALL,
    h: 20 * SMALL,
    obstacle: { radius: 58, dy: -42 },
  },
]

/**
 * Cambios de mundo: props que aparecen cuando la quest avanza.
 * Los componentes se apilan sobre el pedestal (ordenan justo
 * después de él en profundidad).
 */
export function worldChangeProps(flags: Record<string, boolean>): WorldProp[] {
  const out: WorldProp[] = []
  if (flags["pieza.baseInstalled"]) {
    out.push({ id: "pieza-base", asset: ASSETS.woodStack, x: 1820, y: 1391, w: 30 * 6, h: 20 * 6, dyDraw: -140 })
  }
  if (flags["pieza.metalInstalled"]) {
    out.push({ id: "pieza-metal", shape: "metal-frame", x: 1820, y: 1392, w: 150, h: 170, dyDraw: -250 })
  }
  if (flags["pieza.plataInstalled"]) {
    out.push({ id: "pieza-plata", shape: "silver-detail", x: 1820, y: 1393, w: 60, h: 60, dyDraw: -420 })
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
