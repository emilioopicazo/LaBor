// ============================================================
// LA BOR — escenas de taller (cuartos jugables)
// Cada taller residente puede convertirse en una escena 2D propia:
// el visitante entra desde el patio, camina dentro, interactúa con
// estaciones y sale. Agregar un taller nuevo = agregar una entrada
// aquí (geometría + estaciones + props); el motor no cambia.
// ============================================================

import { ASSETS } from "./assets"
import type { Obstacle, Point } from "./map"
import { propObstacles, type WorldProp } from "./props"

export type MaterialId = "madera" | "metal" | "plata"

export interface CraftResult {
  /** id del componente que produce (va al inventario) */
  componentId: string
  /** etiqueta editorial del componente */
  label: string
  oficio: number
}

export interface WorkshopStation {
  id: string
  name: string
  /** verbo de la interacción (LIJAR, FORJAR, PULIR…) */
  verb: string
  /** instrucción corta para el panel */
  hint: string
  position: Point
  interactionRadius: number
  /** duración del "mantener presionado" en ms */
  holdMs: number
  craft: CraftResult
  /** el resultado solo se produce una vez (piezas únicas de quest) */
  once?: boolean
  /** bandera que marca la estación como completada */
  doneFlag?: string
}

export interface WorkshopSceneDef {
  id: string
  name: string
  /** espacio del patio al que pertenece (para volver a su puerta) */
  spaceId: string
  width: number
  height: number
  spawnPoint: Point
  exit: { position: Point; radius: number; label: string }
  walkable: Array<[number, number]>
  extraObstacles: Obstacle[]
  waypoints: Point[]
  stations: WorkshopStation[]
  props: WorldProp[]
}

// ---- VETA · carpintería -------------------------------------------
const VETA_PROPS: WorldProp[] = [
  // estación: banco de trabajo grande al centro
  {
    id: "veta-bench",
    asset: ASSETS.worktable,
    x: 700,
    y: 560,
    w: 36 * 8,
    h: 24 * 8,
    obstacle: { radius: 70, dy: -44 },
  },
  // racks de madera contra el muro poniente
  { id: "veta-wood-1", asset: ASSETS.woodStack, x: 170, y: 330, w: 30 * 6, h: 20 * 6, obstacle: { radius: 44, dy: -30 } },
  { id: "veta-wood-2", asset: ASSETS.woodStack, x: 170, y: 470, w: 30 * 6, h: 20 * 6, obstacle: { radius: 44, dy: -30 } },
  { id: "veta-wood-3", asset: ASSETS.woodStack, x: 170, y: 610, w: 30 * 6, h: 20 * 6, obstacle: { radius: 44, dy: -30 } },
  // tarimas y planta junto al muro oriente
  { id: "veta-pallets", asset: ASSETS.palletStack, x: 1230, y: 380, w: 26 * 6, h: 20 * 6, obstacle: { radius: 44, dy: -28 } },
  { id: "veta-planter", asset: ASSETS.planter, x: 1240, y: 760, w: 16 * 6, h: 18 * 6, obstacle: { radius: 24, dy: -16 } },
  // mesa auxiliar al fondo
  { id: "veta-table-2", asset: ASSETS.worktable, x: 1000, y: 300, w: 36 * 5, h: 24 * 5, obstacle: { radius: 48, dy: -26 } },
]

export const VETA_ROOM: WorkshopSceneDef = {
  id: "veta-room",
  name: "VETA · TALLER",
  spaceId: "veta",
  width: 1400,
  height: 960,
  spawnPoint: { x: 700, y: 860 },
  exit: { position: { x: 700, y: 900 }, radius: 100, label: "SALIR AL PATIO" },
  walkable: [
    [70, 230],
    [1330, 230],
    [1330, 930],
    [70, 930],
  ],
  extraObstacles: [],
  waypoints: [
    { x: 420, y: 700 },
    { x: 980, y: 700 },
    { x: 420, y: 330 },
    { x: 980, y: 470 },
  ],
  stations: [
    {
      id: "veta-bench",
      name: "BANCO DE TRABAJO",
      verb: "LIJAR",
      hint: "Mantén presionado para lijar la base de madera.",
      position: { x: 700, y: 580 },
      interactionRadius: 130,
      holdMs: 2200,
      craft: { componentId: "base-madera", label: "BASE DE MADERA", oficio: 10 },
      once: true,
      doneFlag: "pieza.baseCrafted",
    },
  ],
  props: VETA_PROPS,
}

export const SCENES: Record<string, WorkshopSceneDef> = {
  [VETA_ROOM.id]: VETA_ROOM,
}

export function sceneObstacles(scene: WorkshopSceneDef): Obstacle[] {
  return [...propObstacles(scene.props), ...scene.extraObstacles]
}
