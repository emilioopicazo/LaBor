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

  /** balizas de interacción: rombo (pendiente), rombo grande (objetivo), círculo con palomita (hecho) */
  private makeBeaconTextures() {
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    // pendiente: rombo papel con borde tinta
    g.clear()
    g.fillStyle(0x181411, 1)
    g.fillPoints([new Phaser.Math.Vector2(8, 0), new Phaser.Math.Vector2(16, 8), new Phaser.Math.Vector2(8, 16), new Phaser.Math.Vector2(0, 8)], true)
    g.fillStyle(0xf4efe4, 1)
    g.fillPoints([new Phaser.Math.Vector2(8, 3), new Phaser.Math.Vector2(13, 8), new Phaser.Math.Vector2(8, 13), new Phaser.Math.Vector2(3, 8)], true)
    g.generateTexture("beacon-todo", 16, 16)
    // objetivo: rombo ocre
    g.clear()
    g.fillStyle(0x181411, 1)
    g.fillPoints([new Phaser.Math.Vector2(8, 0), new Phaser.Math.Vector2(16, 8), new Phaser.Math.Vector2(8, 16), new Phaser.Math.Vector2(0, 8)], true)
    g.fillStyle(0xe08a3c, 1)
    g.fillPoints([new Phaser.Math.Vector2(8, 3), new Phaser.Math.Vector2(13, 8), new Phaser.Math.Vector2(8, 13), new Phaser.Math.Vector2(3, 8)], true)
    g.generateTexture("beacon-target", 16, 16)
    // hecho: círculo teal con palomita
    g.clear()
    g.fillStyle(0x181411, 1)
    g.fillCircle(8, 8, 8)
    g.fillStyle(0x3f9c96, 1)
    g.fillCircle(8, 8, 6.5)
    g.lineStyle(2, 0xf4efe4, 1)
    g.beginPath()
    g.moveTo(4.5, 8.2)
    g.lineTo(7, 10.8)
    g.lineTo(11.6, 5.6)
    g.strokePath()
    g.generateTexture("beacon-done", 16, 16)
    g.destroy()
  }

  create() {
    this.makeBeaconTextures()
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
