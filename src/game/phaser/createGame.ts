// ============================================================
// LA BOR — instancia de Phaser (montada por React en GameStage)
// ============================================================

import Phaser from "phaser"
import { BootScene } from "./BootScene"
import { OverworldScene } from "./OverworldScene"
import { RoomScene } from "./RoomScene"
import type { WorldScene } from "./WorldScene"

export interface CreateGameOptions {
  parent: HTMLElement
  avatarId: string
  worldFlags: string[]
}

export function createGame({ parent, avatarId, worldFlags }: CreateGameOptions): Phaser.Game {
  // ?renderer=canvas fuerza Canvas 2D (pruebas sin GPU / equipos muy viejos)
  const forceCanvas = new URLSearchParams(window.location.search).get("renderer") === "canvas"
  const game = new Phaser.Game({
    type: forceCanvas ? Phaser.CANVAS : Phaser.AUTO,
    parent,
    backgroundColor: "#262119",
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    disableContextMenu: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
      autoRound: true,
    },
    input: { activePointers: 3, keyboard: true, mouse: { preventDefaultWheel: false } },
    fps: { target: 60, min: 30 },
    scene: [BootScene, OverworldScene, RoomScene],
  })
  game.registry.set("avatarId", avatarId)
  game.registry.set("worldFlags", worldFlags)

  // hooks de prueba (Playwright)
  const active = (): WorldScene | null => {
    const scenes = game.scene.getScenes(true) as Phaser.Scene[]
    const world = scenes.find((s) => s.scene.key === "overworld" || s.scene.key === "room") as WorldScene | undefined
    return world ?? null
  }
  ;(window as unknown as { __LABOR__: unknown }).__LABOR__ = {
    getState: () => active()?.debugState() ?? null,
    canStand: (x: number, y: number) => active()?.debugCanStand(x, y) ?? false,
    game,
  }
  return game
}
