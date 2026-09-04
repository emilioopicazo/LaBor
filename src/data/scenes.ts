// ============================================================
// LA BOR — escenas de taller (cuartos jugables)
// Todos los talleres y naves se pueden recorrer por dentro. Los
// residentes tienen una estación de oficio; los espacios
// disponibles son cuartos vacíos con su ficha. Agregar / cambiar
// un taller = editar su entrada aquí; el motor no cambia.
// ============================================================

import { ASSETS } from "./assets"
import type { Obstacle, Point, Rect } from "./map"
import { propObstacles, type WorldProp } from "./props"
import { SPACES, type WorkshopSpace } from "./spaces"

export type MaterialId = "madera" | "metal" | "plata"
export type RoomStyle = "wood" | "concrete-dark" | "concrete-light" | "empty"

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
  style: RoomStyle
  accent?: string
  width: number
  height: number
  spawnPoint: Point
  exit: { position: Point; radius: number; label: string }
  /** punto de información (cuartos disponibles) que abre la ficha */
  info?: { position: Point; radius: number; label: string }
  sign?: string
  walkable: Array<[number, number]>
  blocked: Rect[]
  extraObstacles: Obstacle[]
  waypoints: Point[]
  stations: WorkshopStation[]
  props: WorldProp[]
}

// ---- constructor genérico de cuarto -------------------------------
function roomBase(
  space: WorkshopSpace,
  width: number,
  height: number,
  style: RoomStyle,
  accent?: string,
): WorkshopSceneDef {
  const exitX = width / 2
  return {
    id: `${space.id}-room`,
    name: `${space.name.replace(" ATELIER", "")} · ${style === "empty" ? "ESPACIO" : "TALLER"}`,
    spaceId: space.id,
    style,
    accent,
    width,
    height,
    spawnPoint: { x: exitX, y: height - 100 },
    exit: { position: { x: exitX, y: height - 60 }, radius: 110, label: "SALIR AL PATIO" },
    walkable: [
      [70, 230],
      [width - 70, 230],
      [width - 70, height - 30],
      [70, height - 30],
    ],
    blocked: [],
    extraObstacles: [],
    waypoints: [
      { x: 300, y: 330 },
      { x: width - 300, y: 330 },
      { x: 300, y: height - 200 },
      { x: width - 300, y: height - 200 },
      { x: width / 2, y: height / 2 },
    ],
    stations: [],
    props: [],
  }
}

const S = (id: string) => SPACES.find((s) => s.id === id)!

// ---- VETA · carpintería -------------------------------------------
const VETA_ROOM: WorkshopSceneDef = {
  ...roomBase(S("veta"), 1400, 960, "wood", "#c98f42"),
  stations: [
    {
      id: "veta-bench",
      name: "BANCO DE TRABAJO",
      verb: "LIJAR",
      hint: "Mantén presionado para lijar la base de madera.",
      position: { x: 700, y: 580 },
      interactionRadius: 140,
      holdMs: 2200,
      craft: { componentId: "base-madera", label: "BASE DE MADERA", oficio: 10 },
      once: true,
      doneFlag: "pieza.baseCrafted",
    },
  ],
  props: [
    { id: "veta-bench", asset: ASSETS.worktable, x: 700, y: 560, w: 36 * 8, h: 24 * 8, obstacle: { radius: 70, dy: -44 } },
    { id: "veta-wood-1", asset: ASSETS.woodStack, x: 170, y: 330, w: 30 * 6, h: 20 * 6, obstacle: { radius: 44, dy: -30 } },
    { id: "veta-wood-2", asset: ASSETS.woodStack, x: 170, y: 470, w: 30 * 6, h: 20 * 6, obstacle: { radius: 44, dy: -30 } },
    { id: "veta-wood-3", asset: ASSETS.woodStack, x: 170, y: 610, w: 30 * 6, h: 20 * 6, obstacle: { radius: 44, dy: -30 } },
    { id: "veta-pallets", asset: ASSETS.palletStack, x: 1230, y: 380, w: 26 * 6, h: 20 * 6, obstacle: { radius: 44, dy: -28 } },
    { id: "veta-planter", asset: ASSETS.planter, x: 1240, y: 760, w: 16 * 6, h: 18 * 6, obstacle: { radius: 24, dy: -16 } },
    { id: "veta-table-2", asset: ASSETS.worktable, x: 1000, y: 300, w: 36 * 5, h: 24 * 5, obstacle: { radius: 48, dy: -26 } },
  ],
}

// ---- MANNINO · herrería --------------------------------------------
const MANNINO_ROOM: WorkshopSceneDef = {
  ...roomBase(S("mannino"), 1400, 960, "concrete-dark", "#8e9299"),
  stations: [
    {
      id: "mannino-forge",
      name: "FRAGUA",
      verb: "FORJAR",
      hint: "Mantén presionado para forjar el componente de metal.",
      position: { x: 700, y: 600 },
      interactionRadius: 140,
      holdMs: 2600,
      craft: { componentId: "componente-metal", label: "COMPONENTE DE METAL", oficio: 15 },
      once: true,
      doneFlag: "pieza.metalCrafted",
    },
  ],
  props: [
    { id: "mannino-anvil", asset: ASSETS.worktable, x: 700, y: 570, w: 36 * 7, h: 24 * 7, obstacle: { radius: 62, dy: -40 }, className: "forge" },
    { id: "mannino-quench", asset: ASSETS.waterTank, x: 1180, y: 520, w: 18 * 8, h: 18 * 8, obstacle: { radius: 50, dy: -50 } },
    { id: "mannino-pallets", asset: ASSETS.palletStack, x: 220, y: 380, w: 26 * 6, h: 20 * 6, obstacle: { radius: 44, dy: -28 } },
    { id: "mannino-pallets-2", asset: ASSETS.palletStack, x: 220, y: 560, w: 26 * 6, h: 20 * 6, obstacle: { radius: 44, dy: -28 } },
    { id: "mannino-table", asset: ASSETS.worktable, x: 1100, y: 800, w: 36 * 5, h: 24 * 5, obstacle: { radius: 48, dy: -26 } },
  ],
}

// ---- CONTRASTE · joyería -------------------------------------------
const CONTRASTE_ROOM: WorkshopSceneDef = {
  ...roomBase(S("contraste"), 1300, 900, "concrete-light", "#3f9c96"),
  stations: [
    {
      id: "contraste-bench",
      name: "BANCO DE JOYERO",
      verb: "PULIR",
      hint: "Mantén presionado para pulir el detalle en plata.",
      position: { x: 650, y: 560 },
      interactionRadius: 140,
      holdMs: 2400,
      craft: { componentId: "detalle-plata", label: "DETALLE EN PLATA", oficio: 20 },
      once: true,
      doneFlag: "pieza.plataCrafted",
    },
  ],
  props: [
    { id: "contraste-bench", asset: ASSETS.worktable, x: 650, y: 530, w: 36 * 6, h: 24 * 6, obstacle: { radius: 56, dy: -36 } },
    { id: "contraste-planter", asset: ASSETS.planter, x: 1140, y: 380, w: 16 * 6, h: 18 * 6, obstacle: { radius: 24, dy: -16 } },
    { id: "contraste-planter-2", asset: ASSETS.planter, x: 160, y: 760, w: 16 * 6, h: 18 * 6, obstacle: { radius: 24, dy: -16 } },
    { id: "contraste-table-2", asset: ASSETS.worktable, x: 1060, y: 720, w: 36 * 5, h: 24 * 5, obstacle: { radius: 48, dy: -26 } },
    { id: "contraste-table-3", asset: ASSETS.worktable, x: 240, y: 330, w: 36 * 5, h: 24 * 5, obstacle: { radius: 48, dy: -26 } },
  ],
}

// ---- espacios disponibles: cuartos vacíos con su ficha ------------
function emptyRoom(spaceId: string, width: number, height: number): WorkshopSceneDef {
  const space = S(spaceId)
  const base = roomBase(space, width, height, "empty")
  return {
    ...base,
    sign: `ESPACIO DISPONIBLE · ${space.areaM2} M²`,
    info: { position: { x: width / 2, y: height / 2 - 40 }, radius: 150, label: space.name },
    props: [
      { id: `${spaceId}-pallets`, asset: ASSETS.palletStack, x: width - 200, y: 400, w: 26 * 6, h: 20 * 6, obstacle: { radius: 44, dy: -28 } },
    ],
  }
}

export const SCENES: Record<string, WorkshopSceneDef> = Object.fromEntries(
  [
    VETA_ROOM,
    MANNINO_ROOM,
    CONTRASTE_ROOM,
    emptyRoom("pabellon-04", 1240, 920),
    emptyRoom("pabellon-01", 1500, 960),
    emptyRoom("pabellon-02", 1500, 960),
    emptyRoom("pabellon-03", 1240, 920),
    emptyRoom("nave-03", 1600, 1060),
    emptyRoom("nave-02", 1800, 1100),
    emptyRoom("nave-01", 1800, 1100),
  ].map((s) => [s.id, s]),
)

export function sceneObstacles(scene: WorkshopSceneDef): Obstacle[] {
  return [...propObstacles(scene.props), ...scene.extraObstacles]
}
