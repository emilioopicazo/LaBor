// ============================================================
// LA BOR — carga: mapa Tiled, sprites, sheets de avatar, animaciones.
// ============================================================

import Phaser from "phaser"
import { ASSETS } from "../../data/assets"
import { AVATARS, FRAME_H, FRAME_W } from "../../data/avatars"
import { parseTiledMap, type TiledMapJson } from "../map/tiled"
import { isMapDebug } from "./config"
import { createAvatarAnimations } from "./WorldScene"

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot")
  }

  preload() {
    this.load.json("map", "/maps/labor-overworld.tmj")
    Object.entries(ASSETS).forEach(([key, value]) => {
      if (key === "roofs") {
        Object.entries(value as Record<string, { src: string }>).forEach(([id, a]) => this.load.image(`roof-${id}`, a.src))
        return
      }
      const a = value as { src?: string }
      if (a.src) this.load.image(key, a.src)
    })
    AVATARS.forEach((a) => this.load.spritesheet(`avatar-${a.id}`, a.sheet, { frameWidth: FRAME_W, frameHeight: FRAME_H }))
    if (isMapDebug()) this.load.image("ref-plan", "/assets/reference/labor-plan-48px.png")
  }

  create() {
    const json = this.cache.json.get("map") as TiledMapJson
    this.registry.set("map", parseTiledMap(json))
    createAvatarAnimations(this.anims)
    const start = () => this.scene.start("overworld", { spawnId: (this.registry.get("startSpawn") as string) ?? "main-ingreso" })
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    if (fonts?.load) {
      let done = false
      const go = () => {
        if (done) return
        done = true
        start()
      }
      fonts.load('800 18px "Archivo"').then(go, go)
      this.time.delayedCall(1200, go)
    } else start()
  }
}
