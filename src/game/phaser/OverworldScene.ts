// ============================================================
// LA BOR — patio (overworld) construido desde Tiled
// La geometría viene del mapa; el contenido (nombres, estados) de
// spaces.ts. Arte: versión limpia "de obra" — piso, muros, huellas de
// edificios con su nombre, árbol, props y la escultura de la misión.
// ============================================================

import Phaser from "phaser"
import { AVATARS } from "../../data/avatars"
import { eventSoonLabel, eventTimeLabel, isEventMounted, nextEvent, type LaborEvent } from "../../data/events"
import { getSpace } from "../../data/spaces"
import { gameEvents, type Interactable } from "../bridge"
import { boundsOf, type BuildingDef, type OverworldMap, type PropDef, type Rect, type Vec } from "../map/tiled"
import { nearestStandable, pointInPolygon } from "../world/collision"
import { SHADOW_MAX_DEG, sundialReading } from "../world/sundial"
import { PLAYER_RADIUS, PLAYER_SCALE, ROOF_FADE_MS, ROOF_INSIDE_ALPHA, WORLD_MARGIN_M } from "./config"
import { PALETTE, WorldScene, type WorldBuild } from "./WorldScene"

// paleta del patio: grises (concreto, asfalto, lámina) + el acento solo en detalles
const INK = PALETTE.ink
const PAPER = PALETTE.paper
const OUTSIDE = 0x1d1c1f
const FLOOR = 0xc4c1bc
/** piso de los interiores (losa pulida, un paso más claro que el patio) */
const FLOOR_IN = 0xd8d5d0
const WALL = 0x2a292c
const SIDEWALK = 0x7a787c
const ASPHALT = 0x3b3a3e
const CURB = 0x9a979e

/** techo visible sobre el visitante: por encima de todo lo que camina, debajo de balizas y efectos */
const ROOF_DEPTH = 5000
const TENT_DEPTH = 4990

interface RoofStyle {
  fill: number
  edge: number
  text: string
}

function roofStyle(b: BuildingDef): RoofStyle {
  if (b.construction) return { fill: 0x8d8a85, edge: 0x5e5b57, text: "#ecebe9" }
  switch (b.spaceId) {
    case "veta":
      return { fill: 0x9b9590, edge: 0x6c6762, text: "#141315" }
    case "mannno":
      return { fill: 0x7f8187, edge: 0x56585d, text: "#ecebe9" }
    case "contraste":
      // el acento de la casa: lámina roja apagada sobre el taller de joyería
      return { fill: 0xa65a53, edge: 0x74403b, text: "#ecebe9" }
    case "franja-sur":
      return { fill: 0x55535a, edge: 0x3a383e, text: "#ecebe9" }
    default:
      return b.group === "nave" ? { fill: 0xcfccc7, edge: 0x8f8c87, text: "#141315" } : { fill: 0xd7d4cf, edge: 0x9d9994, text: "#141315" }
  }
}

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Archivo", "Helvetica Neue", Arial, sans-serif',
  fontStyle: "800",
  color: "#141315",
}

/** carpa beduina en el centro de la Nave 02: doble techo (lona bajo la lámina de 7 m) */
const TENT = {
  cx: 970,
  cy: 1727,
  /** lona en planta (octágono irregular, relativo al centro) */
  canvas: [[-150, -84], [-104, -126], [104, -126], [150, -84], [150, 84], [104, 126], [-104, 126], [-150, 84]] as Array<[number, number]>,
  /** postes (bloquean): cuatro esquinas interiores */
  poles: [[-112, -70], [112, -70], [112, 70], [-112, 70]] as Array<[number, number]>,
  poleR: 7,
}

/** obra del Pabellón 01 (pasillo del árbol, frente a su puerta oeste) */
const SITE = {
  pile: { x: 883, y: 509 },
  door: { x: 1052, y: 392 },
  hammer: { x: 1058, y: 312 },
  nap: { x: 1036, y: 470 },
  cones: [[1010, 262], [1078, 410]] as Array<[number, number]>,
  sign: { x: 968, y: 548 },
}

interface NpcRoute {
  from: Vec
  to: Vec
  /** px/s (más lento que el visitante) */
  speed: number
  /** cargan cajas de ida (montaje) o solo pasean (bazar montado) */
  carry: boolean
}

interface Npc {
  avatarId: string
  route: NpcRoute
  sprite: Phaser.GameObjects.Sprite
  shadow: Phaser.GameObjects.Ellipse
  crate: Phaser.GameObjects.Image
  /** uniforme de obra (casco y chaleco) que viaja con la persona */
  gear?: { helmet: Phaser.GameObjects.Image; vest: Phaser.GameObjects.Image }
  x: number
  y: number
  target: Vec
  phase: "walk" | "wait"
  wait: number
  carrying: boolean
  facing: "up" | "down" | "left" | "right"
  /** px caminados desde la última parada a curiosear (solo paseantes) */
  walked: number
}

/** Montaje del bazar: de la madera y las tarimas al centro del patio (rutas verificadas como pisables). */
const NPC_ROUTES: NpcRoute[] = [
  { from: { x: 415, y: 800 }, to: { x: 585, y: 1085 }, speed: 78, carry: true },
  { from: { x: 410, y: 1305 }, to: { x: 770, y: 1100 }, speed: 84, carry: true },
]

/** Bazar montado: paseantes por los pasillos entre las dos filas de puestos. */
const VISITOR_ROUTES: NpcRoute[] = [
  { from: { x: 430, y: 1160 }, to: { x: 950, y: 1160 }, speed: 46, carry: false },
  { from: { x: 950, y: 1010 }, to: { x: 430, y: 1010 }, speed: 52, carry: false },
  { from: { x: 440, y: 1340 }, to: { x: 940, y: 1340 }, speed: 40, carry: false },
]

/** Puestos genéricos (interpretación, sin marcas): dos filas al sur del reloj. */
const STALL_ROWS = [1090, 1250]
const STALL_XS = [450, 600, 750, 900]
const STALL_SCALE = 2.5

export class OverworldScene extends WorldScene {
  private map!: OverworldMap
  private sculpture: Phaser.GameObjects.GameObject[] = []
  private pedestal: PropDef | null = null
  private npcs: Npc[] = []
  /** leyenda del montaje ("MONTANDO EL BAZAR · PRÓXIMO DOMINGO") o del bazar ("BAZAR PATIO · HOY") */
  private bazaarCaption: Phaser.GameObjects.Text | null = null
  private bazaarStage: "none" | "setup" | "mounted" = "none"
  private stalls: Vec[] = []
  private shadowSprite: Phaser.GameObjects.Image | null = null
  private previousFlags: string[] = []
  /** techos por clave (spaceId o grupo): se vuelven transparentes al entrar */
  private roofs = new Map<string, Phaser.GameObjects.Container>()
  private insideKey: string | null = null
  private insideSpaceId: string | null = null
  private tent: Phaser.GameObjects.Container | null = null
  private underTent = false
  private workers: Npc[] = []

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
      blocked: [...map.obstacleRects],
    }
    // postes de la carpa beduina (Nave 02): se camina alrededor
    TENT.poles.forEach(([dx, dy], i) => geo.obstacles.push({ id: `tent-pole-${i}`, x: TENT.cx + dx, y: TENT.cy + dy, r: TENT.poleR }))
    // bazar montado: los puestos bloquean el paso (la mesa, no el toldo)
    this.stalls = []
    const ev = nextEvent()
    if (ev && isEventMounted(ev)) {
      STALL_ROWS.forEach((y) => STALL_XS.forEach((x) => {
        this.stalls.push({ x, y })
        geo.blocked.push({ x: x - 44, y: y - 26, width: 88, height: 26 })
      }))
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
    const buildingOf = (spaceId: string) => map.buildings.find((b) => b.spaceId === spaceId)
    map.doors.forEach((d) => {
      const space = getSpace(d.spaceId)
      const b = buildingOf(d.spaceId)
      // interiores: la puerta es solo un hueco, se entra caminando (sin botón); el viaje rápido llega al hueco
      const ret = map.spawns.find((s) => s.id === `return-${d.spaceId}`)
      if (b?.interior) {
        if (ret) approach[d.id] = { x: ret.x, y: ret.y }
        return
      }
      interactables.push({
        id: d.id,
        kind: "door",
        action: b?.construction ? "VER" : d.action,
        label: space?.shortName ?? space?.name ?? d.spaceId.toUpperCase(),
        x: d.x,
        y: d.y,
        radius: d.radius,
        spaceId: d.spaceId,
        sceneId: d.sceneId,
      })
      if (ret) approach[d.id] = { x: ret.x, y: ret.y }
    })
    map.pois.forEach((p) => {
      // puntos de información dentro de un espacio: abren su ficha (letrero)
      if (p.spaceId) interactables.push({ id: p.id, kind: "sign", action: p.action, label: p.label, x: p.x, y: p.y, radius: p.radius, spaceId: p.spaceId })
      else interactables.push({ id: p.id, kind: "poi", action: p.action, label: p.label, x: p.x, y: p.y, radius: p.radius })
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

    // Calle 12 Sur (este) y Calle Cobá (sur): asfalto hasta el borde del mundo,
    // banqueta de 1.7 m pegada a los muros, guarnición y raya discontinua al centro
    const bbAll = boundsOf(map.boundary)
    const m = map.pxPerMeter
    const sidewalk = 1.7 * m
    const eastX = bbAll.x + bbAll.width
    const southY = bbAll.y + bbAll.height
    const road = this.add.graphics()
    road.fillStyle(ASPHALT, 1)
    road.fillRect(eastX + sidewalk, bounds.y, bounds.x + bounds.width - (eastX + sidewalk), bounds.height)
    road.fillRect(bounds.x, southY + sidewalk, bounds.width, bounds.y + bounds.height - (southY + sidewalk))
    road.fillStyle(SIDEWALK, 1)
    road.fillRect(eastX, bbAll.y - sidewalk, sidewalk, bbAll.height + sidewalk * 2)
    road.fillRect(bbAll.x, southY, bbAll.width + sidewalk, sidewalk)
    // guarnición
    road.lineStyle(3, CURB, 0.9)
    road.lineBetween(eastX + sidewalk, bbAll.y - sidewalk, eastX + sidewalk, southY + sidewalk)
    road.lineBetween(bbAll.x, southY + sidewalk, eastX + sidewalk, southY + sidewalk)
    // juntas de la banqueta cada 2 m
    road.lineStyle(1, 0x5f5d62, 0.6)
    for (let y = bbAll.y; y < southY + sidewalk; y += 2 * m) road.lineBetween(eastX, y, eastX + sidewalk, y)
    for (let x = bbAll.x; x < eastX; x += 2 * m) road.lineBetween(x, southY, x, southY + sidewalk)
    // raya central discontinua (la calle sigue más allá del borde caminable)
    road.lineStyle(3, 0x8e8b90, 0.55)
    const laneX = eastX + sidewalk + 3.0 * m
    for (let y = bounds.y; y < bounds.y + bounds.height; y += 2.2 * m) road.lineBetween(laneX, y, laneX, y + 1.1 * m)
    const laneY = southY + sidewalk + 3.0 * m
    for (let x = bounds.x; x < bounds.x + bounds.width; x += 2.2 * m) road.lineBetween(x, laneY, x + 1.1 * m, laneY)
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

    // edificios: huella real + nombre (interiores con piso, muros y techo que se vuelve transparente)
    map.buildings.forEach((b) => this.renderBuilding(b))
    this.renderNaveRoof()
    this.renderTent()
    // muros de los interiores (de la misma geometría que bloquea)
    map.obstacleRects.forEach((r) => {
      const g = this.add.graphics()
      g.fillStyle(WALL, 1)
      g.fillRect(r.x, r.y, r.width, r.height)
      g.setDepth(r.y + r.height)
    })

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
      erase.fillStyle(0xb5b2b8, 1)
      erase.fillRect(o.x, o.y, o.width, 6)
      erase.fillRect(o.x, o.y + o.height - 6, o.width, 6)
      erase.setDepth(-1)
      if (!o.label) return
      const label = this.add.text(o.x + o.width / 2, o.y + o.height / 2, o.label, { ...TEXT_STYLE, fontSize: "13px", color: "#ecebe9" })
      label.setOrigin(0.5).setAngle(-90).setAlpha(0.9).setDepth(-1).setResolution(2)
    })

    // calles / vecino (orientación)
    const street = (x: number, y: number, text: string, angle = 0, size = 22) => {
      const t = this.add.text(x, y, text, { ...TEXT_STYLE, fontSize: `${size}px`, color: "#ecebe9", letterSpacing: 6 })
      t.setOrigin(0.5).setAlpha(0.35).setAngle(angle).setDepth(-11).setResolution(2)
    }
    if (map.labels.streetSouth) street(bb.x + bb.width / 2, bb.y + bb.height + sidewalk + 1.6 * m, map.labels.streetSouth)
    if (map.labels.streetEast) {
      street(eastX + sidewalk + 1.4 * m, bb.y + bb.height * 0.22, map.labels.streetEast, 90)
      street(eastX + sidewalk + 1.4 * m, bb.y + bb.height * 0.78, map.labels.streetEast, 90)
    }
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

    // POIs: anillo sutil en el piso; dentro de un interior, una placa "INFO" en la losa
    map.pois.forEach((p) => {
      const g = this.add.graphics()
      if (p.spaceId) {
        g.fillStyle(INK, 0.85)
        g.fillRoundedRect(p.x - 26, p.y - 12, 52, 24, 5)
        g.setDepth(-1)
        const t = this.add.text(p.x, p.y, "INFO", { ...TEXT_STYLE, fontSize: "10px", color: "#ecebe9", letterSpacing: 3 })
        t.setOrigin(0.5).setDepth(-0.5).setResolution(2)
        return
      }
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

    this.setupNpcs()
    this.setupSite()
    this.previousFlags = this.worldFlags
    this.renderSculpture()
    this.time.addEvent({ delay: 60000, loop: true, callback: () => this.updateSundial() })

    if (this.mapDebug && this.textures.exists("ref-plan")) {
      const ref = this.add.image(0, 0, "ref-plan").setOrigin(0).setAlpha(0.45).setDepth(8500)
      ref.setPipeline("TextureTintPipeline")
    }
  }

  /** clave del techo: la nave comparte uno solo; los demás, su propio spaceId */
  private roofKey(b: BuildingDef): string {
    return b.group || b.spaceId
  }

  private roofContainer(key: string): Phaser.GameObjects.Container {
    let c = this.roofs.get(key)
    if (!c) {
      c = this.add.container(0, 0).setDepth(ROOF_DEPTH)
      this.roofs.set(key, c)
    }
    return c
  }

  private renderBuilding(b: BuildingDef) {
    const style = roofStyle(b)
    const pts = b.points.map((p) => new Phaser.Math.Vector2(p.x, p.y))
    const space = getSpace(b.spaceId)
    const cx = b.bounds.x + b.bounds.width / 2
    const cy = b.bounds.y + b.bounds.height / 2

    if (b.interior) this.renderInterior(b)

    // techo: en los interiores va sobre el visitante (contenedor que se desvanece al entrar);
    // en los demás edificios es la propia huella, bajo el visitante
    const g = this.add.graphics()
    g.fillStyle(style.fill, 1)
    g.fillPoints(pts, true)
    if (!b.group) {
      g.lineStyle(6, WALL, 1)
      g.strokePoints(pts, true)
      // sombra/cara sur dentro de la huella
      g.fillStyle(style.edge, 0.5)
      g.fillRect(b.bounds.x + 3, b.bounds.y + b.bounds.height - 16, b.bounds.width - 6, 13)
    }
    const layer: Phaser.GameObjects.GameObject[] = [g]
    if (this.textures.exists(`roof-${b.spaceId}`) && b.bounds.width > 120) {
      const roof = this.add.image(cx, cy, `roof-${b.spaceId}`)
      roof.setDisplaySize(b.bounds.width - 12, b.bounds.height - 12).setAlpha(0.3)
      layer.push(roof)
    }
    if (b.construction) layer.push(...this.renderConstructionRoof(b))

    if (b.label) {
      if (!space) {
        // bloque sin ficha (franja sur): aviso "PRÓXIMAMENTE", discreto y con respiración lenta
        const soon = this.add.text(cx, cy, b.label, { ...TEXT_STYLE, fontSize: "13px", color: "#ecebe9", letterSpacing: 3, backgroundColor: "#2a292c" })
        soon.setOrigin(0.5).setPadding(12, 6, 12, 6).setAlpha(0.95).setResolution(2)
        if (!this.reducedMotion) this.tweens.add({ targets: soon, alpha: { from: 0.95, to: 0.55 }, duration: 2400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" })
        layer.push(soon)
      } else {
        const size = b.bounds.width < 300 ? 15 : 19
        const commercial = space.type === "available"
        const name = this.add.text(cx, cy - (commercial ? 8 : 0), b.label, { ...TEXT_STYLE, fontSize: `${size}px`, color: style.text, letterSpacing: 2, align: "center" })
        name.setOrigin(0.5).setResolution(2)
        layer.push(name)
        if (commercial) {
          const reserved = space.status === "reserved"
          const soon = space.status === "coming-soon"
          const text = soon ? "EN OBRA" : reserved ? "RESERVADO" : "DISPONIBLE"
          const meta = this.add.text(cx, cy + 14, text, { ...TEXT_STYLE, fontSize: "10px", color: reserved || soon ? "#ecebe9" : "#5d5a60", letterSpacing: 2 })
          meta.setOrigin(0.5).setResolution(2)
          if (reserved || soon) meta.setPadding(8, 3, 8, 3).setBackgroundColor(reserved ? "#4f2724" : "#2a292c")
          layer.push(meta)
        }
      }
    }

    if (b.interior) this.roofContainer(this.roofKey(b)).add(layer)
    else layer.forEach((o, i) => (o as unknown as Phaser.GameObjects.Components.Depth).setDepth(-5 + i * 0.1))
  }

  /** franja de obra (rayas papel/tinta) y aviso de entrega sobre el techo del Pabellón 01 */
  private renderConstructionRoof(b: BuildingDef): Phaser.GameObjects.GameObject[] {
    const g = this.add.graphics()
    const y = b.bounds.y + b.bounds.height - 34
    const x0 = b.bounds.x + 10
    const w = b.bounds.width - 20
    g.fillStyle(0xd9d7d4, 1)
    g.fillRect(x0, y, w, 12)
    g.fillStyle(INK, 1)
    for (let x = x0; x < x0 + w - 6; x += 16) g.fillPoints([new Phaser.Math.Vector2(x, y + 12), new Phaser.Math.Vector2(x + 6, y + 12), new Phaser.Math.Vector2(x + 12, y), new Phaser.Math.Vector2(x + 6, y)], true)
    // andamio: líneas finas sobre el techo
    g.lineStyle(2, 0x5e5b57, 0.5)
    for (let x = b.bounds.x + 40; x < b.bounds.x + b.bounds.width - 20; x += 72) g.lineBetween(x, b.bounds.y + 12, x, b.bounds.y + b.bounds.height - 44)
    g.setDepth(-4.5)
    return [g]
  }

  /** piso, subdivisión pre armada y señal de salida de un interior (bajo el visitante) */
  private renderInterior(b: BuildingDef) {
    const m = this.map.pxPerMeter
    const r = b.bounds
    const g = this.add.graphics()
    g.fillStyle(FLOOR_IN, 1)
    g.fillRect(r.x, r.y, r.width, r.height)
    // juntas de la losa cada 2 m
    g.lineStyle(1, 0xb9b6b1, 0.55)
    for (let x = r.x + 2 * m; x < r.x + r.width; x += 2 * m) g.lineBetween(x, r.y, x, r.y + r.height)
    for (let y = r.y + 2 * m; y < r.y + r.height; y += 2 * m) g.lineBetween(r.x, y, r.x + r.width, y)
    g.setDepth(-6)

    // la nave es una sola: la subdivisión en 3 módulos va marcada en el piso con una línea discontinua y columnas
    if (b.group === "nave" && b.spaceId !== "nave-03") {
      const d = this.add.graphics().setDepth(-5.8)
      d.lineStyle(3, 0x6b6970, 0.7)
      const len = r.height - 20
      const n = Math.max(1, Math.floor(len / 14))
      for (let i = 0; i < n; i += 2) d.lineBetween(r.x, r.y + 10 + (len * i) / n, r.x, r.y + 10 + (len * Math.min(n, i + 1)) / n)
      d.fillStyle(WALL, 1)
      for (let y = r.y + 1.0 * m; y < r.y + r.height; y += 4 * m) d.fillRect(r.x - 6, y - 6, 12, 12)
    }
    // los pabellones quedan lisos a propósito: planta libre, sin subdivisión dibujada
  }

  /** techo único de la nave (lámina a dos aguas sobre los tres módulos) */
  private renderNaveRoof() {
    const naves = this.map.buildings.filter((b) => b.group === "nave")
    if (naves.length === 0) return
    const xs = naves.flatMap((b) => [b.bounds.x, b.bounds.x + b.bounds.width])
    const ys = naves.flatMap((b) => [b.bounds.y, b.bounds.y + b.bounds.height])
    const x1 = Math.min(...xs)
    const x2 = Math.max(...xs)
    const y1 = Math.min(...ys)
    const y2 = Math.max(...ys)
    const g = this.add.graphics()
    // agua sur un paso más oscura, cumbrera al centro, muro perimetral
    g.fillStyle(0xbdbab5, 1)
    g.fillRect(x1, (y1 + y2) / 2, x2 - x1, (y2 - y1) / 2)
    g.lineStyle(4, 0x8f8c87, 1)
    g.lineBetween(x1, (y1 + y2) / 2, x2, (y1 + y2) / 2)
    g.lineStyle(1, 0xa9a6a1, 0.7)
    for (let x = x1 + 24; x < x2; x += 24) g.lineBetween(x, y1 + 4, x, y2 - 4)
    g.lineStyle(6, WALL, 1)
    g.strokeRect(x1, y1, x2 - x1, y2 - y1)
    this.roofContainer("nave").addAt(g, 0)
  }

  /** carpa beduina en la Nave 02: lona oscura con costuras, cuerdas y estacas; segundo techo bajo la lámina */
  private renderTent() {
    const c = this.add.container(TENT.cx, TENT.cy).setDepth(TENT_DEPTH)
    const g = this.add.graphics()
    const pts = TENT.canvas.map(([x, y]) => new Phaser.Math.Vector2(x, y))
    // sombra en el piso (fuera de la lona)
    g.fillStyle(0x000000, 0.18)
    g.fillPoints(TENT.canvas.map(([x, y]) => new Phaser.Math.Vector2(x * 1.04 + 6, y * 1.04 + 10)), true)
    // cuerdas y estacas
    g.lineStyle(2, 0x5a575c, 0.9)
    TENT.canvas.forEach(([x, y]) => {
      const k = 1.3
      g.lineBetween(x, y, x * k, y * k)
      g.fillStyle(0x2a292c, 1)
      g.fillCircle(x * k, y * k, 3)
    })
    // lona
    g.fillStyle(0x3f3d42, 1)
    g.fillPoints(pts, true)
    g.lineStyle(3, 0x2a292c, 1)
    g.strokePoints(pts, true)
    // costuras hacia el centro y cumbrera
    g.lineStyle(2, 0x5e5c62, 0.8)
    TENT.canvas.forEach(([x, y]) => g.lineBetween(0, 0, x, y))
    g.fillStyle(PALETTE.accent2, 1)
    g.fillCircle(0, 0, 5)
    c.add(g)
    this.tent = c
    // postes (se ven cuando la lona se vuelve transparente)
    TENT.poles.forEach(([dx, dy]) => {
      const p = this.add.graphics()
      p.fillStyle(0x2a292c, 1)
      p.fillCircle(TENT.cx + dx, TENT.cy + dy, TENT.poleR)
      p.fillStyle(0x8a6b45, 1)
      p.fillCircle(TENT.cx + dx, TENT.cy + dy, TENT.poleR - 3)
      p.setDepth(TENT.cy + dy)
    })
  }

  // ---- interiores: el techo se vuelve transparente al entrar --------------------
  private interiorAt(x: number, y: number): BuildingDef | null {
    for (const b of this.map.buildings) {
      if (!b.interior) continue
      if (x < b.bounds.x || x > b.bounds.x + b.bounds.width || y < b.bounds.y || y > b.bounds.y + b.bounds.height) continue
      if (pointInPolygon(x, y, b.points)) return b
    }
    return null
  }

  private fadeTo(target: Phaser.GameObjects.Container, alpha: number) {
    this.tweens.killTweensOf(target)
    if (this.reducedMotion) {
      target.setAlpha(alpha)
      return
    }
    this.tweens.add({ targets: target, alpha, duration: ROOF_FADE_MS, ease: "Sine.easeInOut" })
  }

  private updateInterior() {
    const b = this.interiorAt(this.px, this.py)
    const key = b ? this.roofKey(b) : null
    if (key !== this.insideKey) {
      if (this.insideKey) {
        const prev = this.roofs.get(this.insideKey)
        if (prev) this.fadeTo(prev, 1)
      }
      if (key) {
        const next = this.roofs.get(key)
        if (next) this.fadeTo(next, ROOF_INSIDE_ALPHA)
      }
      this.insideKey = key
    }
    const spaceId = b?.spaceId ?? null
    if (spaceId !== this.insideSpaceId) {
      this.insideSpaceId = spaceId
      gameEvents.emit("space", { spaceId })
    }
    if (this.tent) {
      const under = pointInPolygon(this.px - TENT.cx, this.py - TENT.cy, TENT.canvas.map(([x, y]) => ({ x, y })))
      if (under !== this.underTent) {
        this.underTent = under
        this.fadeTo(this.tent, under ? ROOF_INSIDE_ALPHA + 0.04 : 1)
      }
    }
  }

  // ---- obra del Pabellón 01: albañiles trabajando (loop) -------------------------
  private setupSite() {
    this.workers = []
    const site = this.map.buildings.find((b) => b.construction)
    if (!site) return
    const mine = this.registry.get("avatarId") as string | undefined
    const pool = ["sporty", "playero", "tuluminati", "creativa", "nomada-nocturno"].filter((id) => id !== mine && AVATARS.some((a) => a.id === id))
    const dress = (n: Npc) => {
      const helmet = this.add.image(n.x, n.y, "helmet").setOrigin(0.5, 1).setScale(PLAYER_SCALE)
      const vest = this.add.image(n.x, n.y, "vest").setOrigin(0.5, 1).setScale(PLAYER_SCALE)
      n.gear = { helmet, vest }
    }

    // 1 · el que carga: bloques del montón a la puerta, y de regreso sin nada
    const carryRoute: NpcRoute = { from: SITE.pile, to: SITE.door, speed: 72, carry: true }
    if (pool[0] && this.textures.exists(`avatar-${pool[0]}`)) {
      const shadow = this.add.ellipse(SITE.pile.x, SITE.pile.y, 30, 11, 0x000000, 0.28)
      const sprite = this.add.sprite(SITE.pile.x, SITE.pile.y, `avatar-${pool[0]}`, 0).setOrigin(0.5, 1).setScale(PLAYER_SCALE)
      const crate = this.add.image(SITE.pile.x, SITE.pile.y - 28, "block").setOrigin(0.5, 1).setScale(2.6).setVisible(false)
      const npc: Npc = { avatarId: pool[0], route: carryRoute, sprite, shadow, crate, x: SITE.pile.x, y: SITE.pile.y, target: SITE.door, phase: "wait", wait: 0.8, carrying: true, facing: "right", walked: 0 }
      dress(npc)
      this.npcs.push(npc)
      this.workers.push(npc)
      this.placeNpc(npc)
      this.npcIdle(npc)
    }
    // montón de bloques junto al punto de carga y dos ya metidos junto a la puerta
    ;[0, 1].forEach((k) => this.add.image(SITE.pile.x - 30 + k * 14, SITE.pile.y + 6 - k * 8, "block").setOrigin(0.5, 1).setScale(3).setDepth(SITE.pile.y + 6 - k * 8))
    ;[0, 1].forEach((k) => this.add.image(SITE.door.x - 6 + k * 14, SITE.door.y + 30, "block").setOrigin(0.5, 1).setScale(3).setDepth(SITE.door.y + 30))

    // 2 · el que martilla: de pie frente al muro, martillo arriba y abajo, "TOC"
    if (pool[1] && this.textures.exists(`avatar-${pool[1]}`)) {
      const { x, y } = SITE.hammer
      this.add.ellipse(x, y, 30, 11, 0x000000, 0.28).setDepth(y - 0.5)
      const sprite = this.add.sprite(x, y, `avatar-${pool[1]}`, 8).setOrigin(0.5, 1).setScale(PLAYER_SCALE).setDepth(y)
      const helmet = this.add.image(x, y - 66, "helmet").setOrigin(0.5, 1).setScale(PLAYER_SCALE).setDepth(y + 1)
      const vest = this.add.image(x, y - 32, "vest").setOrigin(0.5, 1).setScale(PLAYER_SCALE).setDepth(y + 1)
      const hammer = this.add.image(x + 22, y - 46, "hammer").setOrigin(0.5, 1).setScale(PLAYER_SCALE).setDepth(y + 2).setAngle(-70)
      void sprite
      void helmet
      void vest
      if (!this.reducedMotion) {
        this.tweens.add({ targets: hammer, angle: { from: -70, to: 10 }, duration: 260, yoyo: true, repeat: -1, repeatDelay: 900, ease: "Quad.easeIn" })
        this.time.addEvent({
          delay: 1420,
          loop: true,
          callback: () => {
            const t = this.add.text(x + 34, y - 70, "TOC", { ...TEXT_STYLE, fontSize: "10px", color: "#ecebe9", letterSpacing: 1, stroke: "#141315", strokeThickness: 3 })
            t.setOrigin(0.5).setDepth(y + 3).setResolution(2)
            this.tweens.add({ targets: t, y: y - 96, alpha: 0, duration: 650, ease: "Quad.easeOut", onComplete: () => t.destroy() })
            this.ringPulse(x + 30, y - 40, 10, PALETTE.gray, 380, true)
          },
        })
      }
    }

    // 3 · el de la siesta: acostado sobre los costales, "zZz" que sube
    if (pool[2] && this.textures.exists(`avatar-${pool[2]}`)) {
      const { x, y } = SITE.nap
      ;[0, 1, 2].forEach((k) => this.add.image(x - 20 + k * 20, y + 6, "sack").setOrigin(0.5, 1).setScale(3).setDepth(y + 6))
      const sprite = this.add.sprite(x, y - 8, `avatar-${pool[2]}`, 8).setOrigin(0.5, 1).setScale(PLAYER_SCALE).setDepth(y + 7).setAngle(90)
      // el casco le tapa la cara: está dormido
      const helmet = this.add.image(x + 30, y - 32, "helmet").setOrigin(0.5, 1).setScale(PLAYER_SCALE).setDepth(y + 8).setAngle(90)
      void sprite
      void helmet
      if (!this.reducedMotion) {
        this.time.addEvent({
          delay: 1900,
          loop: true,
          callback: () => {
            const t = this.add.text(x + 36, y - 44, "z", { ...TEXT_STYLE, fontSize: "12px", color: "#ecebe9", stroke: "#141315", strokeThickness: 3 })
            t.setOrigin(0.5).setDepth(y + 9).setResolution(2)
            this.tweens.add({ targets: t, y: y - 78, x: x + 48, alpha: 0, scaleX: 1.6, scaleY: 1.6, duration: 1500, ease: "Sine.easeOut", onComplete: () => t.destroy() })
          },
        })
      }
    }

    // conos y letrero de obra
    SITE.cones.forEach(([x, y]) => this.add.image(x, y, "cone").setOrigin(0.5, 1).setScale(3).setDepth(y))
    this.add.image(SITE.sign.x, SITE.sign.y, "site-sign").setOrigin(0.5, 1).setScale(3).setDepth(SITE.sign.y)
    const label = this.add.text(SITE.sign.x, SITE.sign.y - 44, "EN OBRA", { ...TEXT_STYLE, fontSize: "11px", color: "#141315", letterSpacing: 2 })
    label.setOrigin(0.5).setDepth(SITE.sign.y + 1).setResolution(2)
  }

  // ---- personas montando el bazar (loop: cargan cajas al centro del patio) ----
  private setupNpcs() {
    this.npcs = []
    this.bazaarCaption = null
    this.bazaarStage = "none"
    // el montaje y el bazar solo existen mientras hay un evento por venir
    const ev = nextEvent()
    if (!ev) return
    const mounted = isEventMounted(ev)
    this.bazaarStage = mounted ? "mounted" : "setup"
    const mine = this.registry.get("avatarId") as string | undefined
    const pool = ["creativa", "tuluminati", "sporty", "playero", "nomada-nocturno"].filter((id) => id !== mine && AVATARS.some((a) => a.id === id))
    const routes = mounted ? VISITOR_ROUTES : NPC_ROUTES
    routes.forEach((route, i) => {
      const avatarId = pool[i % pool.length]
      if (!this.textures.exists(`avatar-${avatarId}`)) return
      const shadow = this.add.ellipse(route.from.x, route.from.y, 30, 11, 0x000000, 0.28)
      const sprite = this.add.sprite(route.from.x, route.from.y, `avatar-${avatarId}`, 0).setOrigin(0.5, 1).setScale(PLAYER_SCALE)
      const crate = this.add.image(route.from.x, route.from.y - 28, "crate").setOrigin(0.5, 1).setScale(2.6).setVisible(false)
      const npc: Npc = { avatarId, route, sprite, shadow, crate, x: route.from.x, y: route.from.y, target: route.to, phase: "wait", wait: 0.6 + i * 0.9, carrying: route.carry, facing: "down", walked: 0 }
      this.npcs.push(npc)
      if (route.carry) {
        // lo que ya llevaron: una pila junto a cada punto de descarga
        ;[0, 1].forEach((k) => this.add.image(route.to.x + 30 + k * 12, route.to.y + 8 - k * 9, "crate").setOrigin(0.5, 1).setScale(3).setDepth(route.to.y + 8 - k * 9))
      }
      this.placeNpc(npc)
      this.npcIdle(npc)
    })
    if (mounted) this.renderBazaar(ev)
    // leyenda en el piso: contexto para la gente que carga cajas o pasea
    const text = mounted ? `${ev.kind} ${ev.name} · ${eventSoonLabel(ev)} · ${eventTimeLabel(ev)}` : `MONTANDO EL ${ev.kind} · ${eventSoonLabel(ev)}`
    const cap = this.add.text(690, mounted ? 1320 : 1150, text, { ...TEXT_STYLE, fontSize: "10px", color: "#ecebe9", letterSpacing: 2, backgroundColor: "#2a292c" })
    cap.setOrigin(0.5).setPadding(8, 4, 8, 4).setAlpha(0.92).setDepth(-3).setResolution(2)
    if (!this.reducedMotion) this.tweens.add({ targets: cap, alpha: { from: 0.92, to: 0.6 }, duration: 2600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" })
    this.bazaarCaption = cap
  }

  /** Interpretación del bazar (sin marcas): dos filas de puestos, series de luces y sombra de los toldos. */
  private renderBazaar(_ev: LaborEvent) {
    this.stalls.forEach(({ x, y }, i) => {
      // sombra suave del puesto en el piso
      this.add.ellipse(x, y - 4, 96, 22, 0x000000, 0.16).setDepth(-4)
      this.add.image(x, y, i % 2 === 0 ? "stall-a" : "stall-b").setOrigin(0.5, 1).setScale(STALL_SCALE).setDepth(y)
    })
    // series de luces sobre cada fila: poste en cada extremo y focos alternados con una leve caída
    STALL_ROWS.forEach((rowY) => {
      const x0 = STALL_XS[0] - 70
      const x1 = STALL_XS[STALL_XS.length - 1] + 70
      const top = rowY - 104
      ;[x0, x1].forEach((px) => this.add.rectangle(px, rowY - 2, 4, 108, 0x3c3a3f).setOrigin(0.5, 1).setDepth(rowY - 1))
      const g = this.add.graphics().setDepth(rowY - 2)
      g.lineStyle(2, 0x2a292c, 0.9)
      g.beginPath()
      const n = 40
      for (let k = 0; k <= n; k++) {
        const t = k / n
        const x = x0 + (x1 - x0) * t
        const y = top + 16 * Math.sin(Math.PI * t)
        if (k === 0) g.moveTo(x, y)
        else g.lineTo(x, y)
      }
      g.strokePath()
      const bulbs = 22
      for (let k = 0; k <= bulbs; k++) {
        const t = k / bulbs
        const x = x0 + (x1 - x0) * t
        const y = top + 16 * Math.sin(Math.PI * t) + 5
        const b = this.add.image(x, y, k % 2 ? "bulb-accent" : "bulb-paper").setScale(2).setDepth(rowY - 1)
        if (!this.reducedMotion) this.tweens.add({ targets: b, alpha: { from: 1, to: 0.45 }, duration: 900 + (k % 5) * 160, yoyo: true, repeat: -1, delay: (k * 137) % 900, ease: "Sine.easeInOut" })
      }
    })
  }

  private placeNpc(n: Npc) {
    n.sprite.setPosition(n.x, n.y).setDepth(n.y)
    n.shadow.setPosition(n.x, n.y).setDepth(n.y - 0.5)
    // la caja va al pecho: tapa el torso, no la cara
    n.crate.setPosition(n.x + (n.facing === "left" ? -8 : n.facing === "right" ? 8 : 0), n.y - 28).setDepth(n.y + 1).setVisible(n.route.carry && n.carrying)
    if (n.gear) {
      n.gear.helmet.setPosition(n.x, n.y - 66).setDepth(n.y + 2)
      n.gear.vest.setPosition(n.x, n.y - 32).setDepth(n.y + 1.5).setVisible(!(n.route.carry && n.carrying))
    }
  }

  private npcIdle(n: Npc) {
    n.sprite.anims.stop()
    const row = n.facing === "up" ? 1 : n.facing === "down" ? 0 : 2
    n.sprite.setFlipX(n.facing === "left")
    n.sprite.setFrame(row * 4)
  }

  private updateNpcs(deltaMs: number) {
    if (this.reducedMotion) return
    const dt = Math.min(deltaMs, 50) / 1000
    this.npcs.forEach((n) => {
      if (n.phase === "wait") {
        n.wait -= dt
        if (n.wait > 0) return
        n.phase = "walk"
        // montaje: sale del punto de carga con caja y regresa del centro sin ella
        n.carrying = n.route.carry && n.target === n.route.to
      }
      const dx = n.target.x - n.x
      const dy = n.target.y - n.y
      const d = Math.hypot(dx, dy)
      const step = n.route.speed * dt
      if (d <= step) {
        n.x = n.target.x
        n.y = n.target.y
        const atEnd = n.target === n.route.to
        if (n.route.carry && atEnd) this.dropCrate(n.x + 16, n.y + 4, n.crate.texture.key)
        n.carrying = false
        n.target = atEnd ? n.route.from : n.route.to
        n.phase = "wait"
        n.wait = n.route.carry ? (atEnd ? 0.9 : 1.2) : 1.4 + Math.random() * 1.2
        n.facing = n.route.carry ? (atEnd ? "down" : "left") : "up"
        n.walked = 0
        this.npcIdle(n)
        this.placeNpc(n)
        return
      }
      // paseantes: cada tanto se paran a curiosear un puesto
      if (!n.route.carry) {
        n.walked += step
        if (n.walked > 150 + Math.random() * 60 && d > 70) {
          n.walked = 0
          n.phase = "wait"
          n.wait = 1.1 + Math.random() * 1.2
          n.facing = Math.random() < 0.5 ? "up" : "down"
          this.npcIdle(n)
          this.placeNpc(n)
          return
        }
      }
      n.x += (dx / d) * step
      n.y += (dy / d) * step
      n.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up"
      const dir = n.facing === "left" || n.facing === "right" ? "side" : n.facing
      n.sprite.setFlipX(n.facing === "left")
      const key = `${n.avatarId}-walk-${dir}`
      if (n.sprite.anims.currentAnim?.key !== key || !n.sprite.anims.isPlaying) n.sprite.play(key, true)
      this.placeNpc(n)
    })
  }

  /** caja recién dejada en el centro: se queda un rato y se desvanece (el montaje sigue en loop) */
  private dropCrate(x: number, y: number, key = "crate") {
    const c = this.add.image(x, y, key).setOrigin(0.5, 1).setScale(3).setDepth(y)
    this.tweens.add({ targets: c, alpha: 0, delay: 2600, duration: 700, onComplete: () => c.destroy() })
  }

  update(time: number, deltaMs: number) {
    super.update(time, deltaMs)
    this.updateNpcs(deltaMs)
    this.updateInterior()
  }

  debugState() {
    return {
      ...super.debugState(),
      npcs: this.npcs.map((n) => ({ avatar: n.avatarId, x: Math.round(n.x), y: Math.round(n.y), phase: n.phase, carrying: n.carrying, worker: this.workers.includes(n) })),
      bazaarCaption: this.bazaarCaption?.text ?? null,
      bazaar: { stage: this.bazaarStage, stalls: this.stalls },
      inside: { key: this.insideKey, spaceId: this.insideSpaceId, underTent: this.underTent },
      roofs: [...this.roofs.entries()].map(([key, c]) => ({ key, alpha: Math.round(c.alpha * 100) / 100 })),
      tentAlpha: this.tent ? Math.round(this.tent.alpha * 100) / 100 : null,
      workers: this.workers.length,
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
      this.ringPulse(p.x, top, 46, PALETTE.accent, 750)
      this.burst(p.x, top - 10, 22)
    }
    if (fresh.includes("pieza.complete")) this.celebrate(p.x, top)
  }

  /** LA HORA completa: tres anillos, lluvia de chispas desde la punta y un acercamiento breve */
  private celebrate(x: number, y: number) {
    const tip = { x: x - 5 * (this.pedestal?.scale ?? 3), y: y - 26 * (this.pedestal?.scale ?? 3) }
    ;[0, 260, 520].forEach((delay, i) => {
      this.time.delayedCall(delay, () => {
        this.ringPulse(x, y, 40 + i * 24, i % 2 ? PALETTE.paper : PALETTE.accent, 900)
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
