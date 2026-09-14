// ============================================================
// LA BOR — patio (overworld) construido desde Tiled
// La geometría viene del mapa; el contenido (nombres, estados) de
// spaces.ts. Arte: versión limpia "de obra" — piso, muros, huellas de
// edificios con su nombre, árbol, props y la escultura de la misión.
// ============================================================

import Phaser from "phaser"
import { getSpace } from "../../data/spaces"
import type { Interactable } from "../bridge"
import { boundsOf, type BuildingDef, type OverworldMap, type PropDef, type Rect, type Vec } from "../map/tiled"
import { nearestStandable } from "../world/collision"
import { SHADOW_MAX_DEG, sundialReading } from "../world/sundial"
import { PLAYER_RADIUS, WORLD_MARGIN_M } from "./config"
import { WorldScene, type WorldBuild } from "./WorldScene"

const INK = 0x181411
const PAPER = 0xf4efe4
const OUTSIDE = 0x262119
const FLOOR = 0xcdc5b3
const WALL = 0x2b2622
const SIDEWALK = 0x7d766a

interface RoofStyle {
  fill: number
  edge: number
  text: string
}

function roofStyle(b: BuildingDef): RoofStyle {
  switch (b.spaceId) {
    case "veta":
      return { fill: 0xc98f42, edge: 0x8f6229, text: "#181411" }
    case "mannno":
      return { fill: 0x8e9299, edge: 0x5b5f66, text: "#181411" }
    case "contraste":
      return { fill: 0x3f9c96, edge: 0x2b6d69, text: "#f4efe4" }
    case "franja-sur":
      return { fill: 0x6b655b, edge: 0x3f3b35, text: "#f4efe4" }
    default:
      return { fill: 0xe3dccd, edge: 0x9a9283, text: "#181411" }
  }
}

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Archivo", "Helvetica Neue", Arial, sans-serif',
  fontStyle: "800",
  color: "#181411",
}

export class OverworldScene extends WorldScene {
  private map!: OverworldMap
  private sculpture: Phaser.GameObjects.GameObject[] = []
  private pedestal: PropDef | null = null
  private shadowSprite: Phaser.GameObjects.Image | null = null
  private previousFlags: string[] = []

  constructor() {
    super("overworld")
  }

  init(data: Record<string, unknown>) {
    super.init(data)
    this.sceneId = "overworld"
    this.spaceId = null
  }

  protected buildWorld(data: Record<string, unknown>): WorldBuild {
    const map = this.registry.get("map") as OverworldMap
    this.map = map
    const walkable = map.walkable[0]
    const geo = {
      walkable,
      obstacles: map.obstacles.map((o) => ({ ...o })),
      blocked: map.obstacleRects,
    }

    // límites de cámara: predio + banqueta del ingreso + margen de calle
    const bb = boundsOf(map.boundary)
    const wb = boundsOf(walkable)
    const margin = WORLD_MARGIN_M * map.pxPerMeter
    const minX = Math.min(bb.x, wb.x) - margin
    const minY = Math.min(bb.y, wb.y) - margin
    const maxX = Math.max(bb.x + bb.width, wb.x + wb.width) + margin
    const maxY = Math.max(bb.y + bb.height, wb.y + wb.height) + margin
    const bounds: Rect = { x: minX, y: minY, width: maxX - minX, height: maxY - minY }

    // interactuables: puertas y POIs (nunca el centro del edificio)
    const interactables: Interactable[] = []
    const approach: Record<string, Vec> = {}
    map.doors.forEach((d) => {
      const space = getSpace(d.spaceId)
      interactables.push({
        id: d.id,
        kind: "door",
        action: d.action,
        label: space?.shortName ?? space?.name ?? d.spaceId.toUpperCase(),
        x: d.x,
        y: d.y,
        radius: d.radius,
        spaceId: d.spaceId,
        sceneId: d.sceneId,
      })
      const ret = map.spawns.find((s) => s.id === `return-${d.spaceId}`)
      if (ret) approach[d.id] = { x: ret.x, y: ret.y }
    })
    map.pois.forEach((p) => {
      interactables.push({ id: p.id, kind: "poi", action: p.action, label: p.label, x: p.x, y: p.y, radius: p.radius })
      approach[p.id] = nearestStandable(p.x, p.y + 30, PLAYER_RADIUS, geo, p.radius + 60)
    })
    this.registry.set("approach", approach)

    const spawnId = (data.spawnId as string | undefined) ?? "main-ingreso"
    const spawn = map.spawns.find((s) => s.id === spawnId) ?? map.spawns.find((s) => s.id === "main-ingreso")
    const spawnPoint = spawn ? { x: spawn.x, y: spawn.y } : { x: walkable[0].x + 60, y: walkable[0].y + 60 }

    this.render(bounds)
    return { geo, interactables, spawn: spawnPoint, facing: spawn?.facing ?? "down", bounds, zoomMult: 1 }
  }

  // ---- arte del patio ---------------------------------------------------------
  private render(bounds: Rect) {
    const map = this.map
    this.cameras.main.setBackgroundColor(OUTSIDE)

    // calle / exterior
    const outside = this.add.graphics()
    outside.fillStyle(OUTSIDE, 1)
    outside.fillRect(bounds.x, bounds.y, bounds.width, bounds.height)
    outside.setDepth(-20)

    // calle: asfalto + banqueta (1.7 m) pegada a los muros este y sur
    const bbAll = boundsOf(map.boundary)
    const sidewalk = 1.7 * map.pxPerMeter
    const road = this.add.graphics()
    road.fillStyle(SIDEWALK, 1)
    road.fillRect(bbAll.x + bbAll.width, bbAll.y, sidewalk, bbAll.height + sidewalk)
    road.fillRect(bbAll.x, bbAll.y + bbAll.height, bbAll.width, sidewalk)
    road.lineStyle(2, 0x6b6459, 1)
    road.lineBetween(bbAll.x + bbAll.width + sidewalk, bbAll.y, bbAll.x + bbAll.width + sidewalk, bbAll.y + bbAll.height + sidewalk)
    road.lineBetween(bbAll.x, bbAll.y + bbAll.height + sidewalk, bbAll.x + bbAll.width + sidewalk, bbAll.y + bbAll.height + sidewalk)
    road.setDepth(-12)

    // piso del predio (polígono real)
    const ground = this.add.graphics()
    ground.fillStyle(FLOOR, 1)
    ground.fillPoints(map.boundary.map((p) => new Phaser.Math.Vector2(p.x, p.y)), true)
    ground.setDepth(-10)

    // textura del patio (tapiz enmascarado por el predio)
    const bb = boundsOf(map.boundary)
    const tile = this.add.tileSprite(bb.x, bb.y, bb.width, bb.height, "floorPatio")
    tile.setOrigin(0, 0)
    tile.setTileScale(2, 2)
    tile.setAlpha(0.55)
    tile.setDepth(-9)
    const maskGfx = this.make.graphics({ x: 0, y: 0 }, false)
    maskGfx.fillStyle(0xffffff, 1)
    maskGfx.fillPoints(map.boundary.map((p) => new Phaser.Math.Vector2(p.x, p.y)), true)
    tile.setMask(maskGfx.createGeometryMask())

    // edificios: huella real + nombre
    map.buildings.forEach((b) => this.renderBuilding(b))

    // muros perimetrales (con la abertura del INGRESO)
    const walls = this.add.graphics()
    walls.lineStyle(10, WALL, 1)
    walls.strokePoints(map.boundary.map((p) => new Phaser.Math.Vector2(p.x, p.y)), true)
    walls.setDepth(-2)
    map.openings.forEach((o) => {
      // borrar el muro en la abertura y marcar el umbral
      const erase = this.add.graphics()
      erase.fillStyle(SIDEWALK, 1)
      erase.fillRect(o.x, o.y, o.width, o.height)
      erase.fillStyle(0xb9b1a0, 1)
      erase.fillRect(o.x, o.y, o.width, 6)
      erase.fillRect(o.x, o.y + o.height - 6, o.width, 6)
      erase.setDepth(-1)
      const label = this.add.text(o.x + o.width / 2, o.y + o.height / 2, "INGRESO", { ...TEXT_STYLE, fontSize: "13px", color: "#f4efe4" })
      label.setOrigin(0.5).setAngle(-90).setAlpha(0.9).setDepth(-1).setResolution(2)
    })

    // calles / vecino (orientación)
    const street = (x: number, y: number, text: string, angle = 0) => {
      const t = this.add.text(x, y, text, { ...TEXT_STYLE, fontSize: "22px", color: "#f4efe4", letterSpacing: 6 })
      t.setOrigin(0.5).setAlpha(0.35).setAngle(angle).setDepth(-15).setResolution(2)
    }
    if (map.labels.streetSouth) street(bb.x + bb.width / 2, bb.y + bb.height + 70, map.labels.streetSouth)
    if (map.labels.streetEast) street(bb.x + bb.width + 110, bb.y + bb.height * 0.4, map.labels.streetEast, 90)
    if (map.labels.neighborNorth) street(bb.x + bb.width * 0.6, bb.y + 150, map.labels.neighborNorth)

    // puertas: umbral en el muro + tapete en el piso
    map.doors.forEach((d) => {
      const g = this.add.graphics()
      const along = d.facing === "n" || d.facing === "s"
      const w = along ? 44 : 12
      const h = along ? 12 : 44
      const ox = d.facing === "e" ? -22 : d.facing === "w" ? 10 : -w / 2
      const oy = d.facing === "s" ? -22 : d.facing === "n" ? 10 : -h / 2
      g.fillStyle(PAPER, 0.95)
      g.fillRect(d.x + ox, d.y + oy, w, h)
      g.fillStyle(INK, 0.18)
      g.fillEllipse(d.x, d.y, along ? 46 : 26, along ? 18 : 40)
      g.setDepth(-1)
    })

    // POIs: anillo sutil en el piso
    map.pois.forEach((p) => {
      const g = this.add.graphics()
      g.lineStyle(2, INK, 0.22)
      g.strokeCircle(p.x, p.y, Math.min(p.radius, 60))
      g.setDepth(-1)
    })

    // props (sprites desde datos del mapa)
    const anchors = new Map(map.depthAnchors.map((a) => [a.for, a]))
    map.props.forEach((p) => {
      if (!this.textures.exists(p.sprite)) return
      const s = this.add.image(p.x, p.y, p.sprite)
      s.setOrigin(0.5, 1).setScale(p.scale)
      const anchor = anchors.get(p.id)
      if (p.canopy) {
        s.setDepth((anchor ? anchor.y + anchor.offset : p.y + 40))
        this.tweens.add({ targets: s, angle: { from: -1.2, to: 1.2 }, duration: 3200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" })
      } else {
        s.setDepth(anchor ? anchor.y + anchor.offset : p.y)
      }
      if (p.missionAnchor) this.pedestal = p
    })

    this.previousFlags = this.worldFlags
    this.renderSculpture()
    this.time.addEvent({ delay: 60000, loop: true, callback: () => this.updateSundial() })

    if (this.mapDebug && this.textures.exists("ref-plan")) {
      const ref = this.add.image(0, 0, "ref-plan").setOrigin(0).setAlpha(0.45).setDepth(8500)
      ref.setPipeline("TextureTintPipeline")
    }
  }

  private renderBuilding(b: BuildingDef) {
    const style = roofStyle(b)
    const pts = b.points.map((p) => new Phaser.Math.Vector2(p.x, p.y))
    const g = this.add.graphics()
    g.fillStyle(style.fill, 1)
    g.fillPoints(pts, true)
    g.lineStyle(6, WALL, 1)
    g.strokePoints(pts, true)
    // sombra/cara sur dentro de la huella
    g.fillStyle(style.edge, 0.5)
    g.fillRect(b.bounds.x + 3, b.bounds.y + b.bounds.height - 16, b.bounds.width - 6, 13)
    g.setDepth(-5)
    if (this.textures.exists(`roof-${b.spaceId}`) && b.bounds.width > 120) {
      const roof = this.add.image(b.bounds.x + b.bounds.width / 2, b.bounds.y + b.bounds.height / 2, `roof-${b.spaceId}`)
      roof.setDisplaySize(b.bounds.width - 12, b.bounds.height - 12).setAlpha(0.35).setDepth(-4)
    }
    if (!b.label) return
    const space = getSpace(b.spaceId)
    const cx = b.bounds.x + b.bounds.width / 2
    const cy = b.bounds.y + b.bounds.height / 2
    if (!space) {
      // bloque sin ficha (franja sur): aviso "PRÓXIMAMENTE", discreto y con respiración lenta
      const soon = this.add.text(cx, cy, b.label, { ...TEXT_STYLE, fontSize: "13px", color: "#f4efe4", letterSpacing: 3, backgroundColor: "#2a2620" })
      soon.setOrigin(0.5).setPadding(12, 6, 12, 6).setAlpha(0.95).setDepth(-3).setResolution(2)
      if (!this.reducedMotion) this.tweens.add({ targets: soon, alpha: { from: 0.95, to: 0.55 }, duration: 2400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" })
      return
    }
    const size = b.bounds.width < 300 ? 15 : 19
    const commercial = space?.type === "available"
    const name = this.add.text(cx, cy - (commercial ? 8 : 0), b.label, { ...TEXT_STYLE, fontSize: `${size}px`, color: style.text, letterSpacing: 2, align: "center" })
    name.setOrigin(0.5).setDepth(-3).setResolution(2)
    if (space && commercial) {
      const reserved = space.status === "reserved"
      const meta = this.add.text(cx, cy + 14, `${reserved ? "RESERVADO" : "DISPONIBLE"} · ${space.areaM2} M²`, { ...TEXT_STYLE, fontSize: "11px", color: reserved ? "#f4efe4" : "#5b554a", letterSpacing: 1 })
      meta.setOrigin(0.5).setDepth(-3).setResolution(2)
      if (reserved) {
        // sello RESERVADO: fondo óxido y pulso que llama la atención
        meta.setPadding(8, 3, 8, 3).setBackgroundColor("#b8663d")
        if (!this.reducedMotion) this.tweens.add({ targets: meta, alpha: { from: 1, to: 0.45 }, scaleX: { from: 1, to: 1.08 }, scaleY: { from: 1, to: 1.08 }, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" })
      }
    }
  }

  /**
   * LA HORA sobre el pedestal (banderas de la corrida): disco de madera,
   * aguja con su sombra (marca la hora real de Tulum), marcas de plata y
   * destello al completar. Anclaje: centro de la cara superior del plinto.
   */
  private renderSculpture(justInstalled: string[] = []) {
    this.sculpture.forEach((o) => o.destroy())
    this.sculpture = []
    this.shadowSprite = null
    const p = this.pedestal
    if (!p) return
    const flags = this.worldFlags
    const S = p.scale
    const top = p.y - 23 * S

    const add = (key: string, x: number, y: number, depth: number, ox = 0.5, oy = 0.5, flag?: string) => {
      if (!this.textures.exists(key)) return null
      const img = this.add.image(x, y, key).setOrigin(ox, oy).setScale(S).setDepth(depth)
      this.sculpture.push(img)
      if (flag && justInstalled.includes(flag)) {
        // instalar: el componente baja 12 px con rebote corto
        img.y = y - 12
        this.tweens.add({ targets: img, y, duration: 260, ease: "Back.easeOut" })
      }
      return img
    }

    // 01 · disco de madera — VETA
    if (!flags.includes("pieza.baseInstalled")) return
    add("piezaBaseMadera", p.x, top, p.y + 1, 0.5, 0.43, "pieza.baseInstalled")

    // 02 · aguja forjada — MANNNO, con la sombra que da la hora
    if (flags.includes("pieza.metalInstalled")) {
      const shadow = add("piezaSombra", p.x, top, p.y + 0.5)
      if (shadow) {
        this.shadowSprite = shadow
        const reading = sundialReading()
        shadow.setAlpha(reading.daylight ? 1 : 0)
        if (justInstalled.includes("pieza.metalInstalled")) {
          // al instalar, la sombra barre desde el amanecer hasta la hora real
          shadow.setAngle(-SHADOW_MAX_DEG)
          this.tweens.add({ targets: shadow, angle: reading.angle, duration: 2600, ease: "Sine.easeInOut" })
        } else {
          shadow.setAngle(reading.angle)
        }
      }
      add("piezaAgujaMetal", p.x, top, p.y + 2, 0.5, 1, "pieza.metalInstalled")
    }

    // 03 · marcas de plata — CONTRASTE
    if (flags.includes("pieza.detailInstalled")) {
      add("piezaMarcasPlata", p.x, top, p.y + 3, 0.5, 0.43, "pieza.detailInstalled")
    }

    // destello de la punta pulida: solo con la pieza completa
    if (flags.includes("pieza.complete")) {
      const glint = add("piezaDestello", p.x - 5 * S, top - 26 * S, p.y + 4)
      if (glint) {
        glint.setAlpha(0)
        this.tweens.add({ targets: glint, alpha: { from: 0, to: 1 }, duration: 150, hold: 100, yoyo: true, repeat: -1, repeatDelay: 5600 })
      }
    }
  }

  /** cada minuto la sombra sigue al sol real */
  private updateSundial() {
    const shadow = this.shadowSprite
    if (!shadow || !shadow.active) return
    const reading = sundialReading()
    if (this.tweens.getTweensOf(shadow).length > 0) return
    shadow.setAngle(reading.angle)
    shadow.setAlpha(reading.daylight ? 1 : 0)
  }

  protected onWorldFlags(flags: string[]) {
    const fresh = flags.filter((f) => !this.previousFlags.includes(f))
    this.previousFlags = flags
    this.renderSculpture(fresh)
    const p = this.pedestal
    if (!p || fresh.length === 0) return
    const top = p.y - 23 * p.scale
    if (fresh.some((f) => f.endsWith("Installed"))) {
      // instalar: anillo + chispas sobre el disco
      this.ringPulse(p.x, top, 46, 0xe08a3c, 750)
      this.burst(p.x, top - 10, 22)
    }
    if (fresh.includes("pieza.complete")) this.celebrate(p.x, top)
  }

  /** LA HORA completa: tres anillos, lluvia de chispas desde la punta y un acercamiento breve */
  private celebrate(x: number, y: number) {
    const tip = { x: x - 5 * (this.pedestal?.scale ?? 3), y: y - 26 * (this.pedestal?.scale ?? 3) }
    ;[0, 260, 520].forEach((delay, i) => {
      this.time.delayedCall(delay, () => {
        this.ringPulse(x, y, 40 + i * 24, i % 2 ? 0xf4efe4 : 0xe08a3c, 900)
        this.burst(tip.x, tip.y, 26, i % 2 === 0)
      })
    })
    this.time.delayedCall(900, () => this.burst(x, y - 20, 30, true))
    const cam = this.cameras.main
    cam.zoomTo(this.baseZoom * 1.22, 700, "Sine.easeInOut", true)
    this.time.delayedCall(2200, () => cam.zoomTo(this.restZoom(), 900, "Sine.easeInOut", true))
  }

  protected drawExtraDebug(g: Phaser.GameObjects.Graphics) {
    g.lineStyle(2, 0xff2200, 0.9)
    this.map.buildings.forEach((b) => g.strokePoints(b.points.map((p) => new Phaser.Math.Vector2(p.x, p.y)), true))
    g.lineStyle(2, 0x4477ff, 0.9)
    g.strokePoints(this.map.boundary.map((p) => new Phaser.Math.Vector2(p.x, p.y)), true)
    g.fillStyle(0xff00ff, 1)
    this.map.spawns.forEach((s) => g.fillCircle(s.x, s.y, 5))
    g.fillStyle(0x00aaff, 1)
    this.map.doors.forEach((d) => g.fillCircle(d.x, d.y, 5))
  }
}
