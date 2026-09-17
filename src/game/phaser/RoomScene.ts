// ============================================================
// LA BOR — cuarto de taller (interior a escala de juego)
// ============================================================

import Phaser from "phaser"
import { ROOMS, type RoomDef } from "../../data/rooms"
import { getSpace } from "../../data/spaces"
import type { Interactable } from "../bridge"
import type { Circle, Rect, Vec } from "../map/tiled"
import { FOCUS_ZOOM_MULT, PLAYER_SCALE, ROOM_MARGIN, ROOM_ZOOM_MULT } from "./config"
import { WorldScene, type WorldBuild } from "./WorldScene"

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Archivo", "Helvetica Neue", Arial, sans-serif',
  fontStyle: "800",
  color: "#181411",
}

const FLOORS: Record<string, { fill: number; line: number; wall: number }> = {
  wood: { fill: 0xb98a55, line: 0xa5773f, wall: 0x2b2622 },
  "concrete-dark": { fill: 0x5f6166, line: 0x55575c, wall: 0x1e1d1c },
  "concrete-light": { fill: 0xd6d1c5, line: 0xc8c2b4, wall: 0x2b2622 },
  empty: { fill: 0xcbc4b3, line: 0xbfb8a6, wall: 0x2b2622 },
}

export class RoomScene extends WorldScene {
  private def!: RoomDef

  constructor() {
    super("room")
  }

  init(data: Record<string, unknown>) {
    super.init(data)
    const id = (data.roomId as string) ?? "veta-room"
    this.def = ROOMS[id] ?? ROOMS["veta-room"]
    this.sceneId = this.def.id
    this.spaceId = this.def.spaceId
  }

  protected buildWorld(): WorldBuild {
    const d = this.def
    const inset = d.wall + 6
    const walkable: Vec[] = [
      { x: inset, y: inset + 40 },
      { x: d.width - inset, y: inset + 40 },
      { x: d.width - inset, y: d.height - inset },
      { x: inset, y: d.height - inset },
    ]
    const obstacles: Circle[] = d.props
      .filter((p) => p.obstacleR)
      .map((p) => ({ id: p.id, x: p.x, y: p.y + (p.obstacleDy ?? 0), r: p.obstacleR! }))
    const space = getSpace(d.spaceId)
    const host = d.host && space?.contact ? { ...d.host, contact: space.contact } : null
    if (host) obstacles.push({ id: "host", x: host.x, y: host.y - 12, r: 20 })
    const geo = { walkable, obstacles, blocked: [] as Rect[] }

    const interactables: Interactable[] = [
      ...(host ? [{ id: "host", kind: "person" as const, action: "HABLAR", label: host.contact.name.toUpperCase(), x: host.x, y: host.y, radius: 76, spaceId: d.spaceId }] : []),
      { id: "exit", kind: "exit", action: "SALIR", label: "PATIO", x: d.exit.x, y: d.exit.y, radius: d.exit.radius, spaceId: d.spaceId },
      { id: "sign", kind: "sign", action: d.sign.action, label: space?.shortName ?? d.sign.label, x: d.sign.x, y: d.sign.y, radius: d.sign.radius, spaceId: d.spaceId },
      ...d.stations.map((s) => ({
        id: s.id,
        kind: "station" as const,
        action: "JUGAR",
        label: s.label,
        x: s.x,
        y: s.y,
        radius: s.radius,
        spaceId: d.spaceId,
        minigameIds: s.minigameIds,
      })),
    ]
    this.registry.set("approach", {})

    const bounds: Rect = { x: -ROOM_MARGIN, y: -ROOM_MARGIN, width: d.width + ROOM_MARGIN * 2, height: d.height + ROOM_MARGIN * 2 }
    this.render()
    return { geo, interactables, spawn: d.spawn, facing: d.spawnFacing, bounds, zoomMult: ROOM_ZOOM_MULT }
  }

  /** textos que deben caber en el ancho visible: en vertical, los cuartos chicos fuerzan un zoom alto */
  private fitTexts: Phaser.GameObjects.Text[] = []

  protected applyZoom() {
    super.applyZoom()
    const maxW = (this.scale.width / (this.baseZoom * FOCUS_ZOOM_MULT)) * 0.88
    this.fitTexts.forEach((t) => t.setScale(Math.min(1, maxW / Math.max(t.width, 1))))
  }

  private render() {
    this.fitTexts = []
    const d = this.def
    const f = FLOORS[d.style]
    const space = getSpace(d.spaceId)
    this.cameras.main.setBackgroundColor(0x1a1816)

    const g = this.add.graphics()
    g.fillStyle(f.wall, 1)
    g.fillRect(0, 0, d.width, d.height)
    g.fillStyle(f.fill, 1)
    g.fillRect(d.wall, d.wall, d.width - d.wall * 2, d.height - d.wall * 2)
    // veta del piso
    g.lineStyle(2, f.line, 0.7)
    const stepY = d.style === "wood" ? 28 : 96
    for (let y = d.wall + stepY; y < d.height - d.wall; y += stepY) g.lineBetween(d.wall, y, d.width - d.wall, y)
    if (d.style !== "wood") for (let x = d.wall + 96; x < d.width - d.wall; x += 96) g.lineBetween(x, d.wall, x, d.height - d.wall)
    // muro norte más alto (cara) + franja de acento
    g.fillStyle(0x000000, 0.18)
    g.fillRect(d.wall, d.wall, d.width - d.wall * 2, 40)
    g.fillStyle(Phaser.Display.Color.HexStringToColor(d.accent).color, 1)
    g.fillRect(d.wall, d.wall + 40, d.width - d.wall * 2, 4)
    // salida: hueco en el muro sur + tapete
    g.fillStyle(0x8f877a, 1)
    g.fillRect(d.exit.x - 34, d.height - d.wall, 68, d.wall)
    g.fillStyle(0xf4efe4, 0.8)
    g.fillRect(d.exit.x - 30, d.height - d.wall - 14, 60, 10)
    g.setDepth(-10)

    const title = this.add.text(d.width / 2, d.wall + 20, d.name, { ...TEXT_STYLE, fontSize: "16px", color: "#f4efe4", letterSpacing: 4 })
    title.setOrigin(0.5).setDepth(-9).setResolution(2)
    this.fitTexts.push(title)
    const exitLabel = this.add.text(d.exit.x, d.height - d.wall - 30, "SALIR ↓", { ...TEXT_STYLE, fontSize: "11px", color: "#181411", letterSpacing: 2 })
    exitLabel.setOrigin(0.5).setAlpha(0.7).setDepth(-9).setResolution(2)

    // letrero / ficha
    if (d.style === "empty" && space) {
      const from = space.plans && space.plans.length ? Math.min(...space.plans.map((p) => p.monthlyMxn)) : null
      const reserved = space.status === "reserved"
      const price = reserved ? "LISTA DE ESPERA · PREGUNTA POR WHATSAPP" : from ? `DESDE $${from.toLocaleString("es-MX")} MXN / MES` : "RENTA A COTIZAR"
      const t1 = this.add.text(d.sign.x, d.sign.y - 34, `${reserved ? "RESERVADO" : "ESPACIO DISPONIBLE"} · ${space.areaM2} M²`, { ...TEXT_STYLE, fontSize: "15px", letterSpacing: 2, color: reserved ? "#f4efe4" : "#181411" })
      t1.setOrigin(0.5).setAlpha(reserved ? 1 : 0.75).setDepth(-9).setResolution(2)
      if (reserved) {
        t1.setPadding(10, 4, 10, 4).setBackgroundColor("#b8663d")
        if (!this.reducedMotion) this.tweens.add({ targets: t1, alpha: { from: 1, to: 0.5 }, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" })
      }
      const t2 = this.add.text(d.sign.x, d.sign.y - 10, price, { ...TEXT_STYLE, fontSize: "13px", letterSpacing: 1 })
      t2.setOrigin(0.5).setAlpha(0.65).setDepth(-9).setResolution(2)
      this.fitTexts.push(t1, t2)
      const ring = this.add.graphics()
      ring.lineStyle(2, 0x181411, 0.25)
      ring.strokeCircle(d.sign.x, d.sign.y, 46)
      ring.setDepth(-9)
    } else {
      const totem = this.add.image(d.sign.x, d.sign.y + 8, "infoTotem").setOrigin(0.5, 1).setScale(2.5).setDepth(d.sign.y + 8)
      totem.setAlpha(0.95)
    }

    // estaciones
    d.stations.forEach((s) => {
      const ring = this.add.graphics()
      ring.lineStyle(3, Phaser.Display.Color.HexStringToColor(d.accent).color, 0.55)
      ring.strokeCircle(s.x, s.y + 8, 40)
      ring.setDepth(-9)
      const label = this.add.text(s.x, s.y - 74, s.label, { ...TEXT_STYLE, fontSize: "11px", color: "#f4efe4", letterSpacing: 2, backgroundColor: "#181411" })
      label.setOrigin(0.5).setPadding(6, 3, 6, 3).setDepth(s.y + 200).setResolution(2)
    })

    // props
    d.props.forEach((p) => {
      if (!this.textures.exists(p.sprite)) return
      const s = this.add.image(p.x, p.y, p.sprite).setOrigin(0.5, 1).setScale(p.scale).setDepth(p.y)
      if (p.tint !== undefined) s.setTint(p.tint)
    })

    this.renderHost()
  }

  /** la persona del taller: de pie con su nombre; al acercarse aparece HABLAR */
  private renderHost() {
    const d = this.def
    const c = getSpace(d.spaceId)?.contact
    if (!d.host || !c || !this.textures.exists(`avatar-${c.avatarId}`)) return
    const { x, y, facing } = d.host
    this.add.ellipse(x, y, 30, 11, 0x000000, 0.28).setDepth(y - 0.5)
    const row = facing === "up" ? 1 : facing === "down" ? 0 : 2
    const s = this.add.sprite(x, y, `avatar-${c.avatarId}`, row * 4).setOrigin(0.5, 1).setScale(PLAYER_SCALE).setDepth(y)
    s.setFlipX(facing === "left")
    const tag = this.add.text(x, y - 92, `${c.name.toUpperCase()} · ${d.name.toUpperCase()}`, { ...TEXT_STYLE, fontSize: "10px", color: "#f4efe4", letterSpacing: 2, backgroundColor: "#181411" })
    tag.setOrigin(0.5).setPadding(6, 3, 6, 3).setDepth(y + 200).setResolution(2)
    this.fitTexts.push(tag)
    if (this.reducedMotion) return
    // respira: vaivén mínimo para que se note que está viva
    this.tweens.add({ targets: s, y: y - 2, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" })
  }

  exitRoom() {
    this.transitionTo("overworld", { spawnId: `return-${this.def.spaceId}` })
  }
}
