import { OBSTACLES, WALKABLE_AREA, WAYPOINTS, type Point } from "../data/map"

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

export function insideObstacle(x: number, y: number): boolean {
  for (const o of OBSTACLES) {
    if (dist(x, y, o.x, o.y) < o.radius) return true
  }
  return false
}

/** Validación principal: dentro del patio y fuera de obstáculos. */
export function isPointInsideWalkableArea(x: number, y: number): boolean {
  return pointInPolygon(x, y, WALKABLE_AREA) && !insideObstacle(x, y)
}

/** Un segmento es caminable si todos sus muestreos lo son. */
export function isSegmentWalkable(a: Point, b: Point, step = 14): boolean {
  const d = dist(a.x, a.y, b.x, b.y)
  const n = Math.max(1, Math.ceil(d / step))
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const x = a.x + (b.x - a.x) * t
    const y = a.y + (b.y - a.y) * t
    if (!isPointInsideWalkableArea(x, y)) return false
  }
  return true
}

function clearOfObstacles(x: number, y: number, clearance: number): boolean {
  for (const o of OBSTACLES) {
    if (dist(x, y, o.x, o.y) < o.radius + clearance) return false
  }
  return true
}

/**
 * Punto caminable más cercano a p (búsqueda radial por anillos).
 * Se usa para acercarse a puntos de interacción que quedan justo
 * fuera del polígono (umbral de puerta, borde de edificio) o
 * dentro de un objeto físico. Se prefiere un punto con holgura
 * respecto a los obstáculos para no dejar al visitante acuñado.
 */
export function findNearestWalkablePoint(p: Point, maxRadius = 170): Point {
  if (isPointInsideWalkableArea(p.x, p.y) && clearOfObstacles(p.x, p.y, 8)) return p
  const directions = 24
  let fallback: Point | null = null
  for (let r = 6; r <= maxRadius; r += 6) {
    for (let i = 0; i < directions; i++) {
      const a = (i / directions) * Math.PI * 2
      const x = p.x + Math.cos(a) * r
      const y = p.y + Math.sin(a) * r
      if (!isPointInsideWalkableArea(x, y)) continue
      if (clearOfObstacles(x, y, 8)) return { x, y }
      if (!fallback) fallback = { x, y }
    }
  }
  return fallback ?? p
}

/**
 * Ruta de start a target. Si la línea recta es caminable, la ruta
 * es directa. Si no, se busca la ruta más corta a través del grafo
 * de WAYPOINTS (Dijkstra sobre ~8 nodos). Si nada conecta, se
 * devuelve la recta como último recurso.
 */
export function findPath(start: Point, target: Point): Point[] {
  if (isSegmentWalkable(start, target)) return [target]

  const nodes: Point[] = [start, ...WAYPOINTS, target]
  const n = nodes.length
  const START = 0
  const TARGET = n - 1

  // Matriz de adyacencia con distancias (Infinity = no conectado)
  const edges: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity))
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isSegmentWalkable(nodes[i], nodes[j])) {
        const d = dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y)
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
