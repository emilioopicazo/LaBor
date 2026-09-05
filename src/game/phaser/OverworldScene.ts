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

    this.renderSculpture()

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
    const size = b.bounds.width < 300 ? 15 : 19
    const name = this.add.text(cx, cy - (space?.status === "available" ? 8 : 0), b.label, { ...TEXT_STYLE, fontSize: `${size}px`, color: style.text, letterSpacing: 2, align: "center" })
    name.setOrigin(0.5).setDepth(-3).setResolution(2)
    if (space?.status === "available") {
      const meta = this.add.text(cx, cy + 14, `DISPONIBLE · ${space.areaM2} M²`, { ...TEXT_STYLE, fontSize: "11px", color: "#5b554a", letterSpacing: 1 })
      meta.setOrigin(0.5).setDepth(-3).setResolution(2)
    }
  }

  /** etapas de LA PIEZA CENTRAL sobre el pedestal (banderas de la corrida) */
  private renderSculpture() {
    this.sculpture.forEach((o) => o.destroy())
    this.sculpture = []
    const p = this.pedestal
    if (!p) return
    const flags = this.worldFlags
    const top = p.y - 44
    if (flags.includes("pieza.baseInstalled")) {
      const base = this.add.image(p.x, top + 4, "woodStack").setOrigin(0.5, 1).setScale(2.4).setDepth(p.y + 1)
      this.sculpture.push(base)
    }
    if (flags.includes("pieza.metalInstalled")) {
      const g = this.add.graphics()
      g.lineStyle(6, 0x5b5f66, 1)
      g.strokeRect(p.x - 26, top - 84, 52, 44)
      g.lineBetween(p.x - 26, top - 62, p.x + 26, top - 62)
      g.lineStyle(6, 0x8e9299, 1)
      g.lineBetween(p.x, top - 40, p.x, top - 6)
      g.setDepth(p.y + 2)
      this.sculpture.push(g)
    }
    if (flags.includes("pieza.detailInstalled")) {
      const g = this.add.graphics()
      g.fillStyle(0xe8e6e1, 1)
      g.fillPoints([new Phaser.Math.Vector2(p.x, top - 112), new Phaser.Math.Vector2(p.x + 12, top - 96), new Phaser.Math.Vector2(p.x, top - 80), new Phaser.Math.Vector2(p.x - 12, top - 96)], true)
      g.setDepth(p.y + 3)
      this.sculpture.push(g)
      this.tweens.add({ targets: g, alpha: { from: 0.75, to: 1 }, duration: 900, yoyo: true, repeat: -1 })
    }
    if (flags.includes("pieza.complete")) {
      const glow = this.add.ellipse(p.x, p.y - 10, 200, 90, 0xc98f42, 0.16).setDepth(p.y - 0.8)
      this.sculpture.push(glow)
      this.tweens.add({ targets: glow, scaleX: 1.08, scaleY: 1.08, duration: 1600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" })
    }
  }

  protected onWorldFlags() {
    this.renderSculpture()
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
