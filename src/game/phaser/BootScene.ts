// ============================================================
// LA BOR — carga: mapa Tiled, sprites, sheets de avatar, animaciones.
// ============================================================

import Phaser from "phaser"
import { ASSETS } from "../../data/assets"
import { AVATARS, FRAME_H, FRAME_W } from "../../data/avatars"
import { parseTiledMap, type TiledMapJson } from "../map/tiled"
import { isMapDebug } from "./config"
import { PALETTE, createAvatarAnimations } from "./WorldScene"

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
    g.fillStyle(PALETTE.ink, 1)
    g.fillPoints([new Phaser.Math.Vector2(8, 0), new Phaser.Math.Vector2(16, 8), new Phaser.Math.Vector2(8, 16), new Phaser.Math.Vector2(0, 8)], true)
    g.fillStyle(PALETTE.paper, 1)
    g.fillPoints([new Phaser.Math.Vector2(8, 3), new Phaser.Math.Vector2(13, 8), new Phaser.Math.Vector2(8, 13), new Phaser.Math.Vector2(3, 8)], true)
    g.generateTexture("beacon-todo", 16, 16)
    // objetivo: rombo con el acento (rosa tenue)
    g.clear()
    g.fillStyle(PALETTE.ink, 1)
    g.fillPoints([new Phaser.Math.Vector2(8, 0), new Phaser.Math.Vector2(16, 8), new Phaser.Math.Vector2(8, 16), new Phaser.Math.Vector2(0, 8)], true)
    g.fillStyle(PALETTE.accent, 1)
    g.fillPoints([new Phaser.Math.Vector2(8, 3), new Phaser.Math.Vector2(13, 8), new Phaser.Math.Vector2(8, 13), new Phaser.Math.Vector2(3, 8)], true)
    g.generateTexture("beacon-target", 16, 16)
    // hecho: círculo gris con palomita
    g.clear()
    g.fillStyle(PALETTE.ink, 1)
    g.fillCircle(8, 8, 8)
    g.fillStyle(PALETTE.gray, 1)
    g.fillCircle(8, 8, 6.5)
    g.lineStyle(2, PALETTE.ink, 1)
    g.beginPath()
    g.moveTo(4.5, 8.2)
    g.lineTo(7, 10.8)
    g.lineTo(11.6, 5.6)
    g.strokePath()
    g.generateTexture("beacon-done", 16, 16)
    // chispas (partículas): papel y acento
    g.clear()
    g.fillStyle(PALETTE.paper, 1)
    g.fillRect(0, 0, 4, 4)
    g.generateTexture("spark-paper", 4, 4)
    g.clear()
    g.fillStyle(PALETTE.accent, 1)
    g.fillRect(0, 0, 4, 4)
    g.generateTexture("spark-accent", 4, 4)
    this.makeSiteTextures(g)
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
    ;[["stall-a", PALETTE.accent2, [0x6b6970, PALETTE.gray, PALETTE.paper]], ["stall-b", PALETTE.gray, [PALETTE.ink, PALETTE.accent, 0xd9d7d4]]].forEach(([key, trim, objs]) => {
      g.clear()
      g.fillStyle(0xd9d7d4, 1)
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
    ;[["bulb-paper", PALETTE.paper], ["bulb-accent", PALETTE.accent3]].forEach(([key, color]) => {
      g.clear()
      g.fillStyle(color as number, 1)
      g.fillRect(1, 0, 2, 4)
      g.fillRect(0, 1, 4, 2)
      g.generateTexture(key as string, 4, 4)
    })
    g.destroy()
  }

  /** obra del Pabellón 01: casco, chaleco, bloque, costal, cono, martillo y letrero */
  private makeSiteTextures(g: Phaser.GameObjects.Graphics) {
    // casco (el detalle lila: la única nota de color de la obra)
    g.clear()
    g.fillStyle(PALETTE.ink, 1)
    g.fillRect(0, 5, 12, 2)
    g.fillStyle(PALETTE.accent2, 1)
    g.fillRect(2, 1, 8, 4)
    g.fillRect(3, 0, 6, 1)
    g.fillStyle(PALETTE.accent3, 1)
    g.fillRect(3, 1, 2, 2)
    g.generateTexture("helmet", 12, 7)
    // chaleco reflejante (gris con dos franjas claras)
    g.clear()
    g.fillStyle(0x5c5a60, 1)
    g.fillRect(0, 0, 10, 9)
    g.fillStyle(PALETTE.paper, 1)
    g.fillRect(0, 2, 10, 1)
    g.fillRect(0, 6, 10, 1)
    g.fillStyle(PALETTE.ink, 1)
    g.fillRect(4, 0, 2, 9)
    g.generateTexture("vest", 10, 9)
    // bloque de concreto (lo que cargan)
    g.clear()
    g.fillStyle(0x6f6d72, 1)
    g.fillRect(0, 0, 14, 9)
    g.fillStyle(0x9a979e, 1)
    g.fillRect(1, 1, 12, 7)
    g.fillStyle(0x6f6d72, 1)
    g.fillRect(4, 2, 2, 5)
    g.fillRect(8, 2, 2, 5)
    g.generateTexture("block", 14, 9)
    // costal de cemento
    g.clear()
    g.fillStyle(0x3c3a3f, 1)
    g.fillRect(0, 1, 16, 9)
    g.fillStyle(0xb5b2b8, 1)
    g.fillRect(1, 2, 14, 7)
    g.fillStyle(0x3c3a3f, 1)
    g.fillRect(1, 5, 14, 1)
    g.fillStyle(PALETTE.accent2, 1)
    g.fillRect(6, 3, 4, 1)
    g.generateTexture("sack", 16, 10)
    // cono (gris con franja clara: sin naranja)
    g.clear()
    g.fillStyle(0x3c3a3f, 1)
    g.fillRect(0, 10, 10, 2)
    g.fillStyle(0x7d7a82, 1)
    g.fillPoints([new Phaser.Math.Vector2(5, 0), new Phaser.Math.Vector2(9, 10), new Phaser.Math.Vector2(1, 10)], true)
    g.fillStyle(PALETTE.paper, 1)
    g.fillRect(2, 5, 6, 2)
    g.generateTexture("cone", 10, 12)
    // martillo
    g.clear()
    g.fillStyle(0x8a6b45, 1)
    g.fillRect(3, 3, 2, 9)
    g.fillStyle(0x3c3a3f, 1)
    g.fillRect(0, 0, 8, 4)
    g.generateTexture("hammer", 8, 12)
    // letrero de obra (tablón sobre dos patas)
    g.clear()
    g.fillStyle(0x4e4a44, 1)
    g.fillRect(2, 8, 2, 12)
    g.fillRect(22, 8, 2, 12)
    g.fillStyle(0xd9d7d4, 1)
    g.fillRect(0, 0, 26, 10)
    g.fillStyle(PALETTE.ink, 1)
    for (let x = 0; x < 26; x += 6) g.fillPoints([new Phaser.Math.Vector2(x, 10), new Phaser.Math.Vector2(x + 3, 10), new Phaser.Math.Vector2(x + 6, 7), new Phaser.Math.Vector2(x + 3, 7)], true)
    g.generateTexture("site-sign", 26, 20)
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
