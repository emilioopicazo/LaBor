import type { Point, Rect, SceneGeometry } from "../data/map"

export function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax
  const dy = by - ay
  return Math.hypot(dx, dy)
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v
}

/** Punto dentro de polígono (ray casting). */
export function pointInPolygon(x: number, y: number, polygon: Array<[number, number]>): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

export function pointInRect(x: number, y: number, r: Rect): boolean {
  return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height
}

export function insideBlocked(x: number, y: number, geo: SceneGeometry): boolean {
  for (const r of geo.blocked) if (pointInRect(x, y, r)) return true
  return false
}

export function insideObstacle(x: number, y: number, geo: SceneGeometry): boolean {
  for (const o of geo.obstacles) {
    if (dist(x, y, o.x, o.y) < o.radius) return true
  }
  return false
}

/** Validación principal: dentro del área, fuera de edificios y obstáculos. */
export function isPointInsideWalkableArea(x: number, y: number, geo: SceneGeometry): boolean {
  return pointInPolygon(x, y, geo.walkable) && !insideBlocked(x, y, geo) && !insideObstacle(x, y, geo)
}

/** Un segmento es caminable si todos sus muestreos lo son. */
export function isSegmentWalkable(a: Point, b: Point, geo: SceneGeometry, step = 16): boolean {
  const d = dist(a.x, a.y, b.x, b.y)
  const n = Math.max(1, Math.ceil(d / step))
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const x = a.x + (b.x - a.x) * t
    const y = a.y + (b.y - a.y) * t
    if (!isPointInsideWalkableArea(x, y, geo)) return false
  }
  return true
}

function clearOfObstacles(x: number, y: number, clearance: number, geo: SceneGeometry): boolean {
  for (const o of geo.obstacles) {
    if (dist(x, y, o.x, o.y) < o.radius + clearance) return false
  }
  return true
}

/**
 * Punto caminable más cercano a p (búsqueda radial por anillos).
 * Se usa para acercarse a puntos de interacción que quedan justo
 * fuera de la zona caminable (umbral de puerta, borde de edificio)
 * o dentro de un objeto físico. Se prefiere un punto con holgura
 * respecto a los obstáculos para no dejar al visitante acuñado.
 */
export function findNearestWalkablePoint(p: Point, geo: SceneGeometry, maxRadius = 260): Point {
  if (isPointInsideWalkableArea(p.x, p.y, geo) && clearOfObstacles(p.x, p.y, 10, geo)) return p
  const directions = 24
  let fallback: Point | null = null
  for (let r = 8; r <= maxRadius; r += 8) {
    for (let i = 0; i < directions; i++) {
      const a = (i / directions) * Math.PI * 2
      const x = p.x + Math.cos(a) * r
      const y = p.y + Math.sin(a) * r
      if (!isPointInsideWalkableArea(x, y, geo)) continue
      if (clearOfObstacles(x, y, 10, geo)) return { x, y }
      if (!fallback) fallback = { x, y }
    }
  }
  return fallback ?? p
}

/**
 * Ruta de start a target. Si la línea recta es caminable, la ruta
 * es directa. Si no, se busca la ruta más corta a través del grafo
 * de waypoints (Dijkstra). Si nada conecta, se devuelve la recta.
 */
export function findPath(start: Point, target: Point, geo: SceneGeometry): Point[] {
  if (isSegmentWalkable(start, target, geo)) return [target]

  const nodes: Point[] = [start, ...geo.waypoints, target]
  const n = nodes.length
  const START = 0
  const TARGET = n - 1

  const edges: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity))
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y)
      if (d > 1800) continue
      if (isSegmentWalkable(nodes[i], nodes[j], geo)) {
        edges[i][j] = d
        edges[j][i] = d
      }
    }
  }

  const distTo = Array(n).fill(Infinity)
  const prev = Array(n).fill(-1)
  const visited = Array(n).fill(false)
  distTo[START] = 0

  for (let iter = 0; iter < n; iter++) {
    let u = -1
    let best = Infinity
    for (let i = 0; i < n; i++) {
      if (!visited[i] && distTo[i] < best) {
        best = distTo[i]
        u = i
      }
    }
    if (u === -1) break
    visited[u] = true
    if (u === TARGET) break
    for (let v = 0; v < n; v++) {
      if (edges[u][v] < Infinity && distTo[u] + edges[u][v] < distTo[v]) {
        distTo[v] = distTo[u] + edges[u][v]
        prev[v] = u
      }
    }
  }

  if (distTo[TARGET] === Infinity) return [target]

  const path: Point[] = []
  let cur = TARGET
  while (cur !== START && cur !== -1) {
    path.unshift(nodes[cur])
    cur = prev[cur]
  }
  return path
}
