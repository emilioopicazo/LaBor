// ============================================================
// LA BOR — cuartos de taller (interiores jugables)
// El exterior es fiel al plano; el interior es escala de juego
// (más generoso que los m² reales, a propósito). Cada cuarto se
// describe aquí en px de mundo (48 px = 1 m lógico) y Phaser lo
// construye: piso, muros, salida, letrero, estaciones y props.
// ============================================================

import type { Facing, Vec } from "../game/map/tiled"
import type { MinigameId } from "../game/minigames/contract"
import { SPACES, type WorkshopSpace } from "./spaces"

export type RoomStyle = "wood" | "concrete-dark" | "concrete-light" | "empty"

export interface RoomProp {
  id: string
  /** clave en ASSETS */
  sprite: string
  x: number
  y: number
  scale: number
  /** radio de obstáculo (0 = decorativo) y desplazamiento vertical del centro */
  obstacleR?: number
  obstacleDy?: number
  tint?: number
}

export interface RoomStation {
  id: string
  x: number
  y: number
  radius: number
  label: string
  minigameId: MinigameId
}

export interface RoomDef {
  id: string
  spaceId: string
  name: string
  style: RoomStyle
  accent: string
  width: number
  height: number
  /** margen de muro: el área caminable es el rectángulo interior */
  wall: number
  spawn: Vec
  spawnFacing: Facing
  exit: { x: number; y: number; radius: number; label: string }
  sign: { x: number; y: number; radius: number; label: string; action: string }
  stations: RoomStation[]
  props: RoomProp[]
}

const S = (id: string): WorkshopSpace => SPACES.find((s) => s.id === id)!

function room(spaceId: string, width: number, height: number, style: RoomStyle, accent: string, extra: Partial<RoomDef> = {}): RoomDef {
  const space = S(spaceId)
  const wall = 20
  return {
    id: `${spaceId}-room`,
    spaceId,
    name: space.shortName ?? space.name,
    style,
    accent,
    width,
    height,
    wall,
    spawn: { x: width / 2, y: height - 70 },
    spawnFacing: "up",
    exit: { x: width / 2, y: height - 24, radius: 70, label: "SALIR AL PATIO" },
    sign: { x: width - 80, y: height - 60, radius: 64, label: space.name, action: "VER" },
    stations: [],
    props: [],
    ...extra,
  }
}

export const ROOMS: Record<string, RoomDef> = Object.fromEntries(
  [
    room("veta", 720, 480, "wood", "#c98f42", {
      stations: [{ id: "veta-bench", x: 360, y: 236, radius: 84, label: "BANCO DE CARPINTERO", minigameId: "gato" }],
      props: [
        { id: "veta-bench", sprite: "worktable", x: 360, y: 232, scale: 3, obstacleR: 46, obstacleDy: -26 },
        { id: "veta-wood-1", sprite: "woodStack", x: 96, y: 150, scale: 3, obstacleR: 34, obstacleDy: -20 },
        { id: "veta-wood-2", sprite: "woodStack", x: 96, y: 236, scale: 3, obstacleR: 34, obstacleDy: -20 },
        { id: "veta-wood-3", sprite: "woodStack", x: 96, y: 322, scale: 3, obstacleR: 34, obstacleDy: -20 },
        { id: "veta-pallets", sprite: "palletStack", x: 630, y: 150, scale: 3, obstacleR: 34, obstacleDy: -20 },
        { id: "veta-table-2", sprite: "worktable", x: 560, y: 330, scale: 2, obstacleR: 32, obstacleDy: -18 },
        { id: "veta-planter", sprite: "planter", x: 640, y: 330, scale: 3 },
      ],
    }),
    room("mannno", 720, 480, "concrete-dark", "#8e9299", {
      stations: [{ id: "mannno-forge", x: 360, y: 236, radius: 84, label: "FRAGUA", minigameId: "conecta4" }],
      props: [
        { id: "mannno-anvil", sprite: "worktable", x: 360, y: 232, scale: 3, obstacleR: 46, obstacleDy: -26, tint: 0x6f7378 },
        { id: "mannno-quench", sprite: "waterTank", x: 600, y: 210, scale: 3, obstacleR: 30, obstacleDy: -26 },
        { id: "mannno-pallets", sprite: "palletStack", x: 110, y: 170, scale: 3, obstacleR: 34, obstacleDy: -20 },
        { id: "mannno-pallets-2", sprite: "palletStack", x: 110, y: 300, scale: 3, obstacleR: 34, obstacleDy: -20 },
        { id: "mannno-table", sprite: "worktable", x: 580, y: 340, scale: 2, obstacleR: 32, obstacleDy: -18, tint: 0x6f7378 },
      ],
    }),
    room("contraste", 640, 440, "concrete-light", "#3f9c96", {
      stations: [{ id: "contraste-bench", x: 320, y: 216, radius: 84, label: "BANCO DE JOYERO", minigameId: "memoria" }],
      props: [
        { id: "contraste-bench", sprite: "worktable", x: 320, y: 212, scale: 3, obstacleR: 46, obstacleDy: -26 },
        { id: "contraste-planter", sprite: "planter", x: 560, y: 150, scale: 3 },
        { id: "contraste-planter-2", sprite: "planter", x: 90, y: 380, scale: 3 },
        { id: "contraste-table-2", sprite: "worktable", x: 520, y: 320, scale: 2, obstacleR: 32, obstacleDy: -18 },
        { id: "contraste-table-3", sprite: "worktable", x: 120, y: 160, scale: 2, obstacleR: 32, obstacleDy: -18 },
      ],
    }),
    ...["pabellon-04", "pabellon-03"].map((id) =>
      room(id, 600, 400, "empty", "#b8a98c", {
        sign: { x: 300, y: 170, radius: 96, label: S(id).name, action: "VER" },
        props: [{ id: `${id}-pallets`, sprite: "palletStack", x: 500, y: 150, scale: 3, obstacleR: 34, obstacleDy: -20 }],
      }),
    ),
    ...["pabellon-01", "pabellon-02"].map((id) =>
      room(id, 720, 440, "empty", "#b8a98c", {
        sign: { x: 360, y: 180, radius: 96, label: S(id).name, action: "VER" },
        props: [
          { id: `${id}-pallets`, sprite: "palletStack", x: 600, y: 150, scale: 3, obstacleR: 34, obstacleDy: -20 },
          { id: `${id}-planter`, sprite: "planter", x: 100, y: 150, scale: 3 },
        ],
      }),
    ),
    ...["nave-03", "nave-02", "nave-01"].map((id) =>
      room(id, 800, 480, "empty", "#b8a98c", {
        sign: { x: 400, y: 200, radius: 96, label: S(id).name, action: "VER" },
        props: [
          { id: `${id}-pallets`, sprite: "palletStack", x: 680, y: 150, scale: 3, obstacleR: 34, obstacleDy: -20 },
          { id: `${id}-pallets-2`, sprite: "palletStack", x: 110, y: 150, scale: 3, obstacleR: 34, obstacleDy: -20 },
        ],
      }),
    ),
  ].map((r) => [r.id, r]),
)

export function getRoom(id: string): RoomDef | undefined {
  return ROOMS[id]
}
