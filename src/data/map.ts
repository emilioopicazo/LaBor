// ============================================================
// LA BOR — geometría del mapa
// Referencias maestras (public/assets/reference/):
//   · 260823_TRAMA-layout.pdf  (plano TRAMA con cotas reales)
//   · labor-master-plan.png    (interpretación con diseño)
// Datos reales del plano: predio ~34.90 × 37.31 m, INGRESO
// principal por CALLE 12 SUR (oriente), Calle Cobá al sur,
// Mala Casa al norte, esquina noroeste en diagonal.
// Aquí se define qué zonas son caminables, los obstáculos y los
// waypoints que evitan cruzar edificios en línea recta.
// ============================================================

export type Point = { x: number; y: number }

// Polígono caminable del patio central (coordenadas de mundo).
// Sigue el sitio real:
// - banqueta frente a PABELLÓN 04 / CONTRASTE (norte)
// - escalón bajo el jardín central
// - corredor entre el jardín y PABELLÓN 01
// - franja frente a PABELLÓN 02 / 03
// - explanada frente a las naves (sur)
// - corredor de INGRESO hacia Calle 12 sur (oriente)
export const WALKABLE_AREA: Array<[number, number]> = [
  [380, 470],
  [1030, 470],
  [1030, 560],
  [1355, 560],
  [1355, 465],
  [1445, 465],
  [1445, 790],
  [1680, 790],
  [1680, 1072],
  [2036, 1072],
  [2036, 1100],
  [380, 1100],
]

// Obstáculos circulares (objetos físicos dentro del patio).
export interface Obstacle {
  id: string
  x: number
  y: number
  radius: number
}

export const OBSTACLES: Obstacle[] = [
  { id: "eventos-board", x: 1100, y: 758, radius: 30 },
  { id: "talleres-bench", x: 760, y: 940, radius: 32 },
  { id: "contacto-sign", x: 1660, y: 1035, radius: 22 },
  { id: "veta-lumber", x: 402, y: 572, radius: 26 },
]

// Waypoints interiores para rodear esquinas cóncavas del patio.
// El motor busca la ruta más corta start → waypoints → destino
// cuando la línea recta no es caminable. No es pathfinding
// complejo: es un grafo diminuto de puntos fijos.
export const WAYPOINTS: Point[] = [
  { x: 990, y: 615 }, // bajo la esquina izquierda del jardín
  { x: 1400, y: 615 }, // boca del corredor junto al jardín
  { x: 1400, y: 845 }, // esquina inferior-izquierda de PABELLÓN 02
  { x: 1620, y: 1040 }, // junto a PABELLÓN 03
  { x: 1240, y: 1000 }, // centro-abajo del patio (hub general)
  { x: 700, y: 1000 }, // explanada frente a NAVE 03
  { x: 1700, y: 1086 }, // boca del corredor de INGRESO (Calle 12 sur)
]

// El visitante entra por el INGRESO de CALLE 12 SUR (oriente).
export const SPAWN_POINT: Point = { x: 2010, y: 1086 }
