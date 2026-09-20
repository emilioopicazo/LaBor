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
    // chispas (partículas): papel y ocre
    g.clear()
    g.fillStyle(0xf4efe4, 1)
    g.fillRect(0, 0, 4, 4)
    g.generateTexture("spark-paper", 4, 4)
    g.clear()
    g.fillStyle(0xe08a3c, 1)
    g.fillRect(0, 0, 4, 4)
    g.generateTexture("spark-ochre", 4, 4)
    // caja de madera (la gente que monta el bazar la carga y la apila)
    g.clear()
    g.fillStyle(0x6e4a28, 1)
    g.fillRect(0, 0, 14, 11)
    g.fillStyle(0xa5713f, 1)
    g.fillRect(1, 1, 12, 9)
    g.fillStyle(0x6e4a28, 1)
    g.fillRect(1, 5, 12, 1)
    g.fillRect(4, 1, 1, 9)
    g.fillRect(9, 1, 1, 9)
    g.generateTexture("crate", 14, 11)
    // puestos del bazar (genéricos: toldo, mesa y objetos) en dos variantes
    ;[["stall-a", 0xe08a3c, [0xc47a3f, 0x3f9c96, 0xf4efe4]], ["stall-b", 0x3f9c96, [0x181411, 0xe08a3c, 0xe9dcc6]]].forEach(([key, trim, objs]) => {
      g.clear()
      g.fillStyle(0xe9dcc6, 1)
      g.fillRect(0, 0, 40, 9)
      g.fillStyle(trim as number, 1)
      g.fillRect(0, 9, 40, 2)
      for (let x = 2; x < 40; x += 8) g.fillRect(x, 11, 4, 2)
      g.fillStyle(0x3a332b, 1)
      g.fillRect(2, 11, 2, 18)
      g.fillRect(36, 11, 2, 18)
      g.fillStyle(0xa5713f, 1)
      g.fillRect(3, 20, 34, 3)
      g.fillStyle(0x6e4a28, 1)
      g.fillRect(3, 23, 34, 3)
      g.fillStyle(0x4e3a24, 1)
      g.fillRect(5, 26, 2, 8)
      g.fillRect(33, 26, 2, 8)
      const colors = objs as number[]
      g.fillStyle(colors[0], 1)
      g.fillRect(8, 16, 5, 4)
      g.fillStyle(colors[1], 1)
      g.fillRect(16, 15, 6, 5)
      g.fillStyle(colors[2], 1)
      g.fillRect(26, 17, 6, 3)
      g.generateTexture(key as string, 40, 34)
    })
    // focos de las series de luces
    ;[["bulb-paper", 0xf4efe4], ["bulb-ochre", 0xf2a058]].forEach(([key, color]) => {
      g.clear()
      g.fillStyle(color as number, 1)
      g.fillRect(1, 0, 2, 4)
      g.fillRect(0, 1, 4, 2)
      g.generateTexture(key as string, 4, 4)
    })
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
