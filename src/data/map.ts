// ============================================================
// LA BOR — geometría del patio (overworld)
// Interpretación del plano medido (public/assets/reference/
// labor-master-plan.png) con la geometría del prototipo de diseño
// (docs/LABOR_MOBILE_WORLD_DESIGN_HANDOFF.md §2) escalada ×2.5.
// Regla: TODO el terreno dentro del muro es caminable, salvo las
// huellas de los edificios y los obstáculos de props. Los waypoints
// se generan en las esquinas de los edificios.
// ============================================================

import { WALL, WORLD_HEIGHT, WORLD_WIDTH } from "../config/world"

export type Point = { x: number; y: number }

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Obstacle {
  id: string
  x: number
  y: number
  radius: number
}

/** Geometría que el motor necesita de cualquier escena. */
export interface SceneGeometry {
  /** región caminable (interior del muro / del cuarto) */
  walkable: Array<[number, number]>
  /** huellas bloqueadas (edificios, muebles grandes) */
  blocked: Rect[]
  obstacles: Obstacle[]
  waypoints: Point[]
}

// Interior del muro perimetral
export const PROPERTY_INNER: Rect = {
  x: WALL,
  y: WALL,
  width: WORLD_WIDTH - WALL * 2,
  height: WORLD_HEIGHT - WALL * 2,
}

export const WALKABLE_AREA: Array<[number, number]> = [
  [PROPERTY_INNER.x, PROPERTY_INNER.y],
  [PROPERTY_INNER.x + PROPERTY_INNER.width, PROPERTY_INNER.y],
  [PROPERTY_INNER.x + PROPERTY_INNER.width, PROPERTY_INNER.y + PROPERTY_INNER.height],
  [PROPERTY_INNER.x, PROPERTY_INNER.y + PROPERTY_INNER.height],
]

/** Portón principal: apertura en el muro sur (Calle Cobá). */
export const GATE = { x: 465, width: 310, y: WORLD_HEIGHT - WALL }

/** El visitante entra por el portón de Cobá. */
export const SPAWN_POINT: Point = { x: 620, y: 2700 }

/** Waypoints fijos además de los generados por edificios. */
export const EXTRA_WAYPOINTS: Point[] = [
  { x: 620, y: 2350 }, // corredor de entrada
  { x: 1500, y: 1600 }, // centro del patio
  { x: 2350, y: 1850 }, // frente a las naves (oriente)
  { x: 1750, y: 980 }, // bajo el árbol
  { x: 1560, y: 720 }, // costado poniente del tronco (para pasar detrás)
  { x: 1870, y: 720 }, // costado oriente del tronco
  { x: 1712, y: 480 }, // detrás del árbol
]

/**
 * Genera waypoints en las esquinas exteriores de cada rectángulo
 * bloqueado (con margen), descartando los que caen dentro de otro
 * bloqueado o fuera de la región caminable.
 */
export function cornerWaypoints(blocked: Rect[], margin: number, bounds: Rect): Point[] {
  const out: Point[] = []
  const inside = (p: Point) =>
    p.x >= bounds.x + 8 &&
    p.x <= bounds.x + bounds.width - 8 &&
    p.y >= bounds.y + 8 &&
    p.y <= bounds.y + bounds.height - 8
  const inBlocked = (p: Point) =>
    blocked.some((r) => p.x > r.x && p.x < r.x + r.width && p.y > r.y && p.y < r.y + r.height)
  for (const r of blocked) {
    const corners: Point[] = [
      { x: r.x - margin, y: r.y - margin },
      { x: r.x + r.width + margin, y: r.y - margin },
      { x: r.x - margin, y: r.y + r.height + margin },
      { x: r.x + r.width + margin, y: r.y + r.height + margin },
    ]
    for (const c of corners) {
      if (inside(c) && !inBlocked(c)) out.push(c)
    }
  }
  return out
}
