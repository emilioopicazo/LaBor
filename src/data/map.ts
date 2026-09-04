// ============================================================
// LA BOR — geometría del patio (overworld)
// Referencias maestras (public/assets/reference/):
//   · labor-master-plan.png    (plano medido, base del mundo)
//   · 260823_TRAMA-layout.pdf  (plano TRAMA con cotas)
// Predio ~34.90 × 37.31 m. Portón principal por CALLE COBÁ (sur),
// Calle 12 sur al oriente, Mala Casa al norte, esquina NW en
// diagonal. Aquí se define qué zonas son caminables, los
// obstáculos fijos y los waypoints que evitan cruzar edificios.
// Los obstáculos de props (árbol, tablero, pedestal…) se derivan
// de src/data/props.ts y se suman en el motor.
// ============================================================

export type Point = { x: number; y: number }

export interface Obstacle {
  id: string
  x: number
  y: number
  radius: number
}

/** Geometría que el motor necesita de cualquier escena. */
export interface SceneGeometry {
  walkable: Array<[number, number]>
  obstacles: Obstacle[]
  waypoints: Point[]
}

// Polígono caminable del patio central (coordenadas de mundo).
// - banqueta frente a PABELLÓN 04 / CONTRASTE (norte)
// - el jardín central es transitable: se puede pasar detrás del
//   árbol (profundidad) rodeando su tronco
// - corredor entre el jardín y PABELLÓN 01
// - franja frente a PABELLÓN 02 / 03
// - explanada frente a las naves (sur), con el portón de Cobá
export const WALKABLE_AREA: Array<[number, number]> = [
  [380, 470],
  [1030, 470],
  [1030, 310],
  [1355, 310],
  [1355, 465],
  [1445, 465],
  [1445, 790],
  [1680, 790],
  [1680, 1100],
  [380, 1100],
]

// Obstáculos fijos que no son props (vacío hoy; los props aportan
// los suyos). Se conserva para muros interiores o zonas cerradas.
export const STATIC_OBSTACLES: Obstacle[] = []

// Waypoints interiores para rodear esquinas cóncavas del patio.
export const WAYPOINTS: Point[] = [
  { x: 990, y: 615 }, // bajo la esquina izquierda del jardín
  { x: 1400, y: 615 }, // boca del corredor junto al jardín
  { x: 1400, y: 845 }, // esquina inferior-izquierda de PABELLÓN 02
  { x: 1620, y: 1040 }, // junto a PABELLÓN 03
  { x: 1240, y: 1000 }, // centro-abajo del patio (hub general)
  { x: 700, y: 1000 }, // explanada frente a NAVE 03
  { x: 1080, y: 400 }, // jardín: lado poniente del árbol
  { x: 1310, y: 400 }, // jardín: lado oriente del árbol
  { x: 960, y: 820 }, // junto al pedestal (sur)
]

// El visitante entra por el portón de CALLE COBÁ (sur-poniente).
export const SPAWN_POINT: Point = { x: 470, y: 1060 }

/** Portón principal (apertura en el muro sur). */
export const GATE = { x: 372, width: 88, y: 1512 }
