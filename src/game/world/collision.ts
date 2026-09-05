// ============================================================
// LA BOR — geometría de movimiento
// El visitante es un círculo pequeño a la altura de los pies (r ≈ 0.35 m).
// Se puede parar donde el círculo cabe dentro del polígono caminable y
// no toca obstáculos. El movimiento resuelve por ejes (deslizamiento
// por muros) sin física: directo, sin inercia, sin esquinas pegajosas.
// ============================================================

import type { Circle, Rect, Vec } from "../map/tiled"

export interface Geometry {
  /** un solo polígono caminable por escena (sin huecos) */
  walkable: Vec[]
  obstacles: Circle[]
  blocked: Rect[]
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay)
}

export function pointInPolygon(x: number, y: number, poly: Vec[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x
    const yi = poly[i].y
    const xj = poly[j].x
    const yj = poly[j].y
    const crosses = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (crosses) inside = !inside
  }
  return inside
}

export function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2
  t = t < 0 ? 0 : t > 1 ? 1 : t
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t))
}

function minEdgeDistance(x: number, y: number, poly: Vec[]): number {
  let best = Infinity
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const d = distToSegment(x, y, poly[j].x, poly[j].y, poly[i].x, poly[i].y)
    if (d < best) best = d
  }
  return best
}

/** ¿Cabe un círculo de radio r centrado en (x, y)? */
export function canStand(x: number, y: number, r: number, geo: Geometry): boolean {
  if (!pointInPolygon(x, y, geo.walkable)) return false
  if (minEdgeDistance(x, y, geo.walkable) < r) return false
  for (const o of geo.obstacles) {
    if (dist(x, y, o.x, o.y) < o.r + r) return false
  }
  for (const b of geo.blocked) {
    if (x > b.x - r && x < b.x + b.width + r && y > b.y - r && y < b.y + b.height + r) return false
  }
  return true
}

/**
 * Mueve (x, y) por (dx, dy) deslizando por muros y obstáculos: si el paso
 * completo no cabe se intenta solo X, solo Y y, si tampoco (esquinas,
 * círculos), el mismo paso girado ±25°/±50°/±75° con menos magnitud.
 * Así el visitante nunca se queda "pegado" mientras haya piso libre.
 * Pasos largos se subdividen para no atravesar obstáculos delgados.
 */
const SLIDE_ANGLES = [25, -25, 50, -50, 75, -75].map((a) => (a * Math.PI) / 180)

export function moveWithSliding(x: number, y: number, dx: number, dy: number, r: number, geo: Geometry): Vec {
  const maxStep = Math.max(2, r * 0.6)
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / maxStep))
  const sx = dx / steps
  const sy = dy / steps
  let cx = x
  let cy = y
  for (let i = 0; i < steps; i++) {
    if (canStand(cx + sx, cy + sy, r, geo)) {
      cx += sx
      cy += sy
      continue
    }
    let moved = false
    if (sx !== 0 && canStand(cx + sx, cy, r, geo)) {
      cx += sx
      moved = true
    }
    if (sy !== 0 && canStand(cx, cy + sy, r, geo)) {
      cy += sy
      moved = true
    }
    if (moved) continue
    for (const a of SLIDE_ANGLES) {
      const cos = Math.cos(a)
      const sin = Math.sin(a)
      const rx = (sx * cos - sy * sin) * cos
      const ry = (sx * sin + sy * cos) * cos
      if (canStand(cx + rx, cy + ry, r, geo)) {
        cx += rx
        cy += ry
        moved = true
        break
      }
    }
    if (!moved) break
  }
  return { x: cx, y: cy }
}

/** Punto donde sí cabe el visitante, más cercano a (x, y). */
export function nearestStandable(x: number, y: number, r: number, geo: Geometry, maxRadius = 240): Vec {
  if (canStand(x, y, r, geo)) return { x, y }
  const dirs = 24
  for (let rad = 6; rad <= maxRadius; rad += 6) {
    for (let i = 0; i < dirs; i++) {
      const a = (i / dirs) * Math.PI * 2
      const px = x + Math.cos(a) * rad
      const py = y + Math.sin(a) * rad
      if (canStand(px, py, r, geo)) return { x: px, y: py }
    }
  }
  return { x, y }
}

export function segmentFree(a: Vec, b: Vec, r: number, geo: Geometry, step = 10): boolean {
  const d = dist(a.x, a.y, b.x, b.y)
  const n = Math.max(1, Math.ceil(d / step))
  for (let i = 0; i <= n; i++) {
    const t = i / n
    if (!canStand(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, r, geo)) return false
  }
  return true
}

// ---- navegación ligera para tap-to-walk -------------------------------
// Nodos: esquinas del polígono desplazadas en diagonal + anillos alrededor
// de obstáculos. Aristas: visibilidad muestreada. El grafo se construye
// una vez por escena; cada consulta solo conecta origen y destino.

export interface NavGraph {
  nodes: Vec[]
  edges: number[][] // matriz de costos (Infinity = sin conexión)
}

export function buildNavGraph(geo: Geometry, r: number): NavGraph {
  const off = r + 8
  const candidates: Vec[] = []
  geo.walkable.forEach((p) => {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) candidates.push({ x: p.x + sx * off, y: p.y + sy * off })
  })
  geo.obstacles.forEach((o) => {
    const rr = o.r + off
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      candidates.push({ x: o.x + Math.cos(a) * rr, y: o.y + Math.sin(a) * rr })
    }
  })
  geo.blocked.forEach((b) => {
    candidates.push({ x: b.x - off, y: b.y - off }, { x: b.x + b.width + off, y: b.y - off })
    candidates.push({ x: b.x - off, y: b.y + b.height + off }, { x: b.x + b.width + off, y: b.y + b.height + off })
  })
  const nodes = candidates.filter((c) => canStand(c.x, c.y, r, geo))
  const n = nodes.length
  const edges: number[][] = Array.from({ length: n }, () => Array<number>(n).fill(Infinity))
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y)
      if (d > 1400) continue
      if (segmentFree(nodes[i], nodes[j], r, geo, 14)) {
        edges[i][j] = d
        edges[j][i] = d
      }
    }
  }
  return { nodes, edges }
}

export function findPath(start: Vec, target: Vec, r: number, geo: Geometry, graph: NavGraph): Vec[] {
  if (segmentFree(start, target, r, geo)) return [target]
  const nodes = [start, ...graph.nodes, target]
  const n = nodes.length
  const T = n - 1
  const cost = (i: number, j: number): number => {
    if (i > 0 && i < T && j > 0 && j < T) return graph.edges[i - 1][j - 1]
    const d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y)
    return segmentFree(nodes[i], nodes[j], r, geo, 12) ? d : Infinity
  }
  const distTo = Array<number>(n).fill(Infinity)
  const prev = Array<number>(n).fill(-1)
  const done = Array<boolean>(n).fill(false)
  distTo[0] = 0
  for (let it = 0; it < n; it++) {
    let u = -1
    let best = Infinity
    for (let i = 0; i < n; i++) if (!done[i] && distTo[i] < best) (best = distTo[i]), (u = i)
    if (u === -1 || u === T) break
    done[u] = true
    for (let v = 0; v < n; v++) {
      if (done[v]) continue
      const c = cost(u, v)
      if (c < Infinity && distTo[u] + c < distTo[v]) {
        distTo[v] = distTo[u] + c
        prev[v] = u
      }
    }
  }
  if (distTo[T] === Infinity) return []
  const path: Vec[] = []
  let cur = T
  while (cur !== 0 && cur !== -1) {
    path.unshift(nodes[cur])
    cur = prev[cur]
  }
  return path
}
