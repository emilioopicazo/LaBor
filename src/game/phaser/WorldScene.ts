// ============================================================
// LA BOR — escena base de mundo (patio y cuartos)
// Aquí vive lo que comparten todas las escenas jugables: visitante,
// input (joystick / teclado / toque), colisión por pies, cámara con
// zona muerta, profundidad, interactuables y el puente con React.
// Las subclases solo construyen su geometría y su arte.
// ============================================================

import Phaser from "phaser"
import { AVATARS, DEFAULT_AVATAR } from "../../data/avatars"
import { gameEvents, registerController, type GameCommands, type Interactable, type MarkerState } from "../bridge"
import type { Facing, Rect, Vec } from "../map/tiled"
import { buildNavGraph, canStand, dist, findPath, moveWithSliding, nearestStandable, type Geometry, type NavGraph } from "../world/collision"
import {
  CAM_LERP,
  DEADZONE_H,
  DEADZONE_W,
  FAST_TRAVEL_MULT,
  FOCUS_ZOOM_MULT,
  JOY_ZONE_TOP,
  JOY_ZONE_X,
  PLAYER_RADIUS,
  PLAYER_SCALE,
  PLAYER_SPEED,
  TAP_MAX_MOVE,
  TAP_MAX_MS,
  WALK_FPS,
  baseZoomFor,
  isMapDebug,
} from "./config"
import { Joystick } from "./Joystick"

export interface WorldBuild {
  geo: Geometry
  interactables: Interactable[]
  spawn: Vec
  facing: Facing
  /** límites de cámara (px de mundo) */
  bounds: Rect
  zoomMult: number
}

interface TapCandidate {
  id: number
  x: number
  y: number
  t: number
}

export abstract class WorldScene extends Phaser.Scene implements GameCommands {
  /** id lógico de la escena (overworld / veta-room…) y espacio al que pertenece */
  sceneId = "overworld"
  spaceId: string | null = null

  protected geo!: Geometry
  protected nav!: NavGraph
  protected interactables: Interactable[] = []
  protected bounds!: Rect
  protected zoomMult = 1

  protected player!: Phaser.GameObjects.Sprite
  protected shadow!: Phaser.GameObjects.Ellipse
  protected px = 0
  protected py = 0
  protected facing: Facing = "down"
  protected moving = false
  protected avatarId: string = DEFAULT_AVATAR

  protected joystick = new Joystick()
  private keys!: Record<string, Phaser.Input.Keyboard.Key>
  private tap: TapCandidate | null = null
  private path: Vec[] = []
  private fastTravel: string | null = null
  private marker!: Phaser.GameObjects.Graphics
  protected paused = false
  private hasMoved = false
  private current: Interactable | null = null
  protected worldFlags: string[] = []
  protected baseZoom = 1
  private focused = false
  private lastEmit = 0
  protected debugGfx: Phaser.GameObjects.Graphics | null = null
  protected mapDebug = isMapDebug()
  /** balizas por id de interactuable */
  private beacons = new Map<string, Phaser.GameObjects.Image>()
  private markers: Record<string, MarkerState> = {}
  private guideTarget: string | null = null
  private guideGfx!: Phaser.GameObjects.Graphics
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter
  private sparksOchre!: Phaser.GameObjects.Particles.ParticleEmitter
  /** balizas que se completaron con un panel abierto: saltan al cerrarlo */
  private pendingPops: string[] = []
  private fxLog: string[] = []
  private resizes = 0
  private lastArrive = -Infinity

  protected abstract buildWorld(data: Record<string, unknown>): WorldBuild
  /** las subclases reaccionan a banderas de mundo (etapas de la escultura) */
  protected onWorldFlags(_flags: string[]) {}

  init(data: Record<string, unknown>) {
    const avatar = this.registry.get("avatarId") as string | undefined
    this.avatarId = avatar && AVATARS.some((a) => a.id === avatar) ? avatar : DEFAULT_AVATAR
    this.worldFlags = (this.registry.get("worldFlags") as string[] | undefined) ?? []
    this.paused = false
    this.path = []
    this.fastTravel = null
    this.current = null
    this.tap = null
    this.joystick.end()
    this.sceneData = data
  }
  private sceneData: Record<string, unknown> = {}

  create() {
    const build = this.buildWorld(this.sceneData)
    this.geo = build.geo
    this.interactables = build.interactables
    this.bounds = build.bounds
    this.zoomMult = build.zoomMult
    this.nav = buildNavGraph(this.geo, PLAYER_RADIUS)

    const spawn = nearestStandable(build.spawn.x, build.spawn.y, PLAYER_RADIUS, this.geo)
    this.px = spawn.x
    this.py = spawn.y
    this.facing = build.facing

    this.shadow = this.add.ellipse(this.px, this.py, 30, 11, 0x000000, 0.28)
    this.player = this.add.sprite(this.px, this.py, `avatar-${this.avatarId}`, 0)
    this.player.setOrigin(0.5, 1)
    this.player.setScale(PLAYER_SCALE)
    this.marker = this.add.graphics()
    this.marker.setDepth(1)
    this.applyIdleFrame()

    this.setupCamera()
    this.setupInput()
    this.setupFx()
    this.createBeacons()
    this.guideGfx = this.add.graphics()
    this.guideGfx.setDepth(9500)
    this.markers = (this.registry.get("markers") as Record<string, MarkerState> | undefined) ?? {}
    this.guideTarget = (this.registry.get("guide") as string | null | undefined) ?? null
    this.applyMarkers()
    // cuartos y regresos al patio: la llegada se ve tras el fundido (el primer patio la repite al abrirse el portón)
    this.arrive()

    if (this.mapDebug) {
      this.debugGfx = this.add.graphics()
      this.debugGfx.setDepth(9000)
    }

    this.cameras.main.fadeIn(260, 24, 21, 17)
    registerController(this)
    gameEvents.emit("ready", { sceneId: this.sceneId, spaceId: this.spaceId })
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      registerController(null)
      this.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this)
    })
  }

  // ---- cámara -------------------------------------------------------------
  private setupCamera() {
    const cam = this.cameras.main
    cam.setBounds(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height)
    cam.setRoundPixels(true)
    this.applyZoom()
    cam.startFollow(this.player, true, CAM_LERP, CAM_LERP, 0, 36)
    cam.centerOn(this.px, this.py - 36)
    this.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this)
  }

  /** llegada: el visitante "aterriza" con un pop y la cámara asienta desde un poco más lejos */
  arrive() {
    if (this.reducedMotion) return
    // create() y el portón pueden pedirla casi juntas: una sola llegada por segundo
    if (this.time.now - this.lastArrive < 1000) return
    this.lastArrive = this.time.now
    const cam = this.cameras.main
    const rest = this.restZoom()
    cam.setZoom(rest * 0.86)
    cam.zoomTo(rest, 900, "Sine.easeOut", true)
    this.player.setScale(PLAYER_SCALE * 0.5)
    this.tweens.add({ targets: this.player, scaleX: PLAYER_SCALE, scaleY: PLAYER_SCALE, duration: 460, delay: 180, ease: "Back.easeOut" })
    this.time.delayedCall(220, () => this.ringPulse(this.px, this.py - 6, 24, 0xf4efe4, 520))
  }

  // ---- efectos ----------------------------------------------------------------
  private setupFx() {
    const cfg = {
      speed: { min: 60, max: 190 },
      angle: { min: 0, max: 360 },
      gravityY: 220,
      lifespan: { min: 450, max: 900 },
      scale: { start: 1.6, end: 0 },
      alpha: { start: 1, end: 0.2 },
      emitting: false,
    }
    this.sparks = this.add.particles(0, 0, "spark-paper", cfg)
    this.sparks.setDepth(7000)
    this.sparksOchre = this.add.particles(0, 0, "spark-ochre", cfg)
    this.sparksOchre.setDepth(7000)
  }

  /** ráfaga de chispas en un punto del mundo */
  protected burst(x: number, y: number, count = 18, ochre = false) {
    if (this.reducedMotion) return
    ;(ochre ? this.sparksOchre : this.sparks).explode(count, x, y)
    this.logFx(`burst:${Math.round(x)},${Math.round(y)}`)
  }

  private logFx(entry: string) {
    this.fxLog.push(entry)
    if (this.fxLog.length > 40) this.fxLog.shift()
  }

  /** anillo que se expande y se desvanece (instalar, completar, entrar) */
  protected ringPulse(x: number, y: number, radius = 40, color = 0xe08a3c, duration = 700) {
    if (this.reducedMotion) return
    const g = this.add.graphics()
    g.lineStyle(4, color, 0.9)
    g.strokeCircle(0, 0, radius)
    g.setPosition(x, y).setDepth(6500).setScale(0.3)
    this.tweens.add({ targets: g, scaleX: 1.6, scaleY: 1.6, alpha: 0, duration, ease: "Cubic.easeOut", onComplete: () => g.destroy() })
    this.logFx(`ring:${Math.round(x)},${Math.round(y)}`)
  }

  protected get reducedMotion(): boolean {
    return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }

  private onResize() {
    this.resizes++
    this.applyZoom()
  }

  protected applyZoom() {
    const cam = this.cameras.main
    const w = this.scale.width
    const h = this.scale.height
    let z = baseZoomFor(w, h) * this.zoomMult
    // el viewport nunca debe ser mayor que los límites (sin vacío fuera del predio)
    z = Math.max(z, w / this.bounds.width, h / this.bounds.height)
    this.baseZoom = z
    // si hay un zoom animado en curso, se le cambia el destino; si no, se aplica directo
    if (cam.zoomEffect.isRunning) cam.zoomEffect.destination = this.restZoom()
    else cam.setZoom(this.restZoom())
    cam.setDeadzone((w * DEADZONE_W) / z, (h * DEADZONE_H) / z)
  }

  /** zoom "en reposo": el base, o un poco más cerca si hay algo enfocado */
  protected restZoom() {
    return this.focused ? this.baseZoom * FOCUS_ZOOM_MULT : this.baseZoom
  }

  // ---- input --------------------------------------------------------------
  private setupInput() {
    this.input.addPointer(2)
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this)
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this)
    this.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this)
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onPointerUp, this)
    const kb = this.input.keyboard
    if (kb) {
      this.keys = kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ENTER,ESC,SPACE") as Record<string, Phaser.Input.Keyboard.Key>
      kb.on("keydown-E", () => this.triggerAction())
      kb.on("keydown-ENTER", () => this.triggerAction())
      kb.on("keydown-SPACE", () => this.triggerAction())
      kb.on("keydown-ESC", () => gameEvents.emit("escape", {}))
    }
  }

  private inJoystickZone(p: Phaser.Input.Pointer): boolean {
    const w = this.scale.width
    const h = this.scale.height
    return p.x < w * JOY_ZONE_X && p.y > h * JOY_ZONE_TOP && p.y < h - 4
  }

  private onPointerDown(p: Phaser.Input.Pointer) {
    if (this.paused) return
    const touch = p.wasTouch
    if (touch && this.inJoystickZone(p)) {
      // si el dedo dueño del joystick ya no está abajo (touchcancel, gesto del
      // navegador), el joystick se libera y el nuevo dedo lo toma
      if (this.joystick.active && !this.joystickOwnerDown()) this.releaseJoystick()
      if (!this.joystick.active) {
        this.joystick.begin(p.id, p.x, p.y)
        this.cancelPath()
        this.emitJoystick()
        return
      }
    }
    this.tap = { id: p.id, x: p.x, y: p.y, t: this.time.now }
  }

  private joystickOwnerDown(): boolean {
    const id = this.joystick.pointerId
    if (id === null) return false
    const owner = this.input.manager.pointers.find((pt) => pt.id === id)
    return Boolean(owner && owner.isDown)
  }

  private releaseJoystick() {
    this.joystick.end()
    this.emitJoystick()
  }

  private onPointerMove(p: Phaser.Input.Pointer) {
    if (this.joystick.active && this.joystick.pointerId === p.id) {
      this.joystick.move(p.id, p.x, p.y)
      this.emitJoystick()
    }
  }

  private onPointerUp(p: Phaser.Input.Pointer) {
    if (this.joystick.active && this.joystick.pointerId === p.id) {
      this.joystick.end(p.id)
      this.emitJoystick()
      return
    }
    const tap = this.tap
    this.tap = null
    if (!tap || tap.id !== p.id || this.paused) return
    const moved = dist(tap.x, tap.y, p.x, p.y)
    if (moved > TAP_MAX_MOVE || this.time.now - tap.t > TAP_MAX_MS) return
    const world = this.cameras.main.getWorldPoint(p.x, p.y)
    this.handleTap(world.x, world.y)
  }

  /**
   * Toque en el mundo: un interactuable cercano al toque gana sobre el piso.
   * Si está al alcance → se activa; si no → el visitante camina hasta él.
   * Piso libre → tap-to-walk (secundario al joystick).
   */
  private handleTap(wx: number, wy: number) {
    const hitR = 40 / this.cameras.main.zoom + 8
    let best: Interactable | null = null
    let bestD = Infinity
    for (const it of this.interactables) {
      const d = dist(wx, wy, it.x, it.y)
      if (d < Math.max(hitR, it.radius * 0.6) && d < bestD) {
        best = it
        bestD = d
      }
    }
    if (best) {
      if (this.current && this.current.id === best.id) {
        this.triggerAction()
        return
      }
      this.walkTo(this.approachPoint(best), best.id)
      return
    }
    const target = nearestStandable(wx, wy, PLAYER_RADIUS, this.geo, 140)
    if (!canStand(target.x, target.y, PLAYER_RADIUS, this.geo)) return
    this.walkTo(target, null)
  }

  protected approachPoint(it: Interactable): Vec {
    const spawn = (this.registry.get("approach") as Record<string, Vec> | undefined)?.[it.id]
    if (spawn) return spawn
    return nearestStandable(it.x, it.y, PLAYER_RADIUS, this.geo, it.radius + 60)
  }

  private walkTo(target: Vec, fastTravelId: string | null) {
    const path = findPath({ x: this.px, y: this.py }, target, PLAYER_RADIUS, this.geo, this.nav)
    if (path.length === 0) return
    this.path = path
    this.fastTravel = fastTravelId
    this.drawMarker(target)
  }

  private cancelPath() {
    this.path = []
    this.fastTravel = null
    this.marker.clear()
  }

  private drawMarker(t: Vec) {
    this.marker.clear()
    this.marker.lineStyle(2, 0xf4efe4, 0.9)
    this.marker.strokeCircle(t.x, t.y, 10)
    this.marker.fillStyle(0xf4efe4, 0.6)
    this.marker.fillCircle(t.x, t.y, 3)
  }

  private emitJoystick() {
    gameEvents.emit("joystick", this.joystick.state())
  }

  // ---- ciclo ----------------------------------------------------------------
  update(time: number, deltaMs: number) {
    const dt = Math.min(deltaMs, 50) / 1000
    let vx = 0
    let vy = 0
    let fast = false
    // vigilante: un joystick sin dedo abajo (evento perdido) se suelta solo
    if (this.joystick.active && !this.joystickOwnerDown()) this.releaseJoystick()
    if (!this.paused) {
      if (this.joystick.active && this.joystick.mag > 0) {
        vx = this.joystick.x * this.joystick.mag
        vy = this.joystick.y * this.joystick.mag
        this.cancelPath()
      } else {
        const k = this.keys
        let kx = 0
        let ky = 0
        if (k) {
          if (k.A.isDown || k.LEFT.isDown) kx -= 1
          if (k.D.isDown || k.RIGHT.isDown) kx += 1
          if (k.W.isDown || k.UP.isDown) ky -= 1
          if (k.S.isDown || k.DOWN.isDown) ky += 1
        }
        if (kx !== 0 || ky !== 0) {
          const l = Math.hypot(kx, ky)
          vx = kx / l
          vy = ky / l
          this.cancelPath()
        } else if (this.path.length > 0) {
          const next = this.path[0]
          const d = dist(this.px, this.py, next.x, next.y)
          if (d < 4) {
            this.path.shift()
            if (this.path.length === 0) {
              this.marker.clear()
              if (this.fastTravel) {
                const id = this.fastTravel
                this.fastTravel = null
                gameEvents.emit("arrived", { targetId: id })
              }
            }
          } else {
            vx = (next.x - this.px) / d
            vy = (next.y - this.py) / d
            fast = this.fastTravel !== null
            const step = PLAYER_SPEED * (fast ? FAST_TRAVEL_MULT : 1) * dt
            if (step > d) {
              vx *= d / step
              vy *= d / step
            }
          }
        }
      }
    }

    const step = PLAYER_SPEED * (fast ? FAST_TRAVEL_MULT : 1) * dt
    let moved = false
    if (vx !== 0 || vy !== 0) {
      const next = moveWithSliding(this.px, this.py, vx * step, vy * step, PLAYER_RADIUS, this.geo)
      moved = Math.abs(next.x - this.px) > 0.01 || Math.abs(next.y - this.py) > 0.01
      // si el paso completo se bloqueó pero hay camino, no atorarse: nada más
      this.px = next.x
      this.py = next.y
      if (Math.abs(vx) > Math.abs(vy)) this.facing = vx > 0 ? "right" : "left"
      else this.facing = vy > 0 ? "down" : "up"
      if (!this.hasMoved && (this.joystick.active || this.keys)) {
        this.hasMoved = true
        gameEvents.emit("moved", {})
      }
      if (this.path.length > 0 && !moved) this.cancelPath()
    }
    const wasMoving = this.moving
    this.moving = moved
    if (this.moving !== wasMoving || moved) this.applyAnimation()

    this.player.setPosition(Math.round(this.px), Math.round(this.py))
    this.player.setDepth(this.py)
    this.shadow.setPosition(Math.round(this.px), Math.round(this.py))
    this.shadow.setDepth(this.py - 0.5)

    this.updateNearest()

    if (time - this.lastEmit > 100) {
      this.lastEmit = time
      gameEvents.emit("player", { x: this.px, y: this.py, moving: this.moving, sceneId: this.sceneId })
    }
    this.drawGuide()
    if (this.debugGfx) this.drawDebug()
  }

  private updateNearest() {
    let best: Interactable | null = null
    let bestD = Infinity
    for (const it of this.interactables) {
      const d = dist(this.px, this.py, it.x, it.y)
      const r = it.radius + (this.current && this.current.id === it.id ? 12 : 0)
      if (d <= r && d < bestD) {
        best = it
        bestD = d
      }
    }
    if ((best?.id ?? null) !== (this.current?.id ?? null)) {
      this.current = best
      gameEvents.emit("action", { target: best })
      this.applyMarkers()
    }
  }

  private applyAnimation() {
    const dir = this.facing === "left" || this.facing === "right" ? "side" : this.facing
    this.player.setFlipX(this.facing === "left")
    if (this.moving) {
      const key = `${this.avatarId}-walk-${dir}`
      if (this.player.anims.currentAnim?.key !== key || !this.player.anims.isPlaying) this.player.play(key, true)
    } else {
      this.player.anims.stop()
      this.applyIdleFrame()
    }
  }

  private applyIdleFrame() {
    const row = this.facing === "up" ? 1 : this.facing === "down" ? 0 : 2
    this.player.setFlipX(this.facing === "left")
    this.player.setFrame(row * 4)
  }

  /** las subclases pintan su geometría extra en modo ?mapdebug=1 */
  protected drawExtraDebug(_g: Phaser.GameObjects.Graphics) {}

  private drawDebug() {
    const g = this.debugGfx!
    g.clear()
    this.drawExtraDebug(g)
    g.lineStyle(2, 0x00ff66, 0.9)
    g.strokePoints(this.geo.walkable.map((p) => new Phaser.Math.Vector2(p.x, p.y)), true)
    g.lineStyle(2, 0xff8800, 0.9)
    this.geo.obstacles.forEach((o) => g.strokeCircle(o.x, o.y, o.r))
    this.geo.blocked.forEach((b) => g.strokeRect(b.x, b.y, b.width, b.height))
    g.lineStyle(2, 0x66ccff, 0.9)
    this.interactables.forEach((it) => g.strokeCircle(it.x, it.y, it.radius))
    g.lineStyle(2, 0xffffff, 1)
    g.strokeCircle(this.px, this.py, PLAYER_RADIUS)
  }

  // ---- balizas de interacción ------------------------------------------------
  /** altura de la baliza sobre el punto de interacción, por tipo */
  private beaconLift(it: Interactable): number {
    switch (it.kind) {
      case "door":
        return 54
      case "poi":
        return it.id === "pieza-central" ? 150 : 92
      case "station":
        return 110
      case "sign":
        return 96
      case "exit":
        return 44
    }
  }

  private createBeacons() {
    this.beacons.forEach((b) => b.destroy())
    this.beacons.clear()
    this.interactables.forEach((it) => {
      const y = it.y - this.beaconLift(it)
      const img = this.add.image(it.x, y, "beacon-todo").setScale(1.3).setDepth(6000).setAlpha(0.8)
      this.tweens.add({ targets: img, y: y - 5, duration: 1100 + Math.random() * 300, yoyo: true, repeat: -1, ease: "Sine.easeInOut" })
      this.beacons.set(it.id, img)
    })
  }

  private applyMarkers() {
    this.beacons.forEach((img, id) => {
      const state = this.markers[id] ?? "todo"
      const near = this.current?.id === id
      img.setTexture(state === "done" ? "beacon-done" : state === "target" ? "beacon-target" : "beacon-todo")
      // un poco más discretas: no deben robarle protagonismo al patio
      img.setScale(near ? 1.6 : state === "target" ? 1.45 : 1.3)
      img.setAlpha(near ? 1 : state === "done" ? 0.85 : state === "target" ? 1 : 0.75)
    })
  }

  /** chevrón en el borde de la pantalla hacia el objetivo cuando queda fuera de vista */
  private drawGuide() {
    const g = this.guideGfx
    g.clear()
    if (!this.guideTarget) return
    const it = this.interactables.find((i) => i.id === this.guideTarget)
    if (!it) return
    const cam = this.cameras.main
    const view = cam.worldView
    const margin = 34 / cam.zoom
    const inside = it.x > view.x + margin && it.x < view.right - margin && it.y > view.y + margin * 2.4 && it.y < view.bottom - margin * 2.6
    if (inside) return
    // punto del objetivo proyectado al borde del viewport (con margen y sin tapar el HUD)
    const cx = view.centerX
    const cy = view.centerY
    const dx = it.x - cx
    const dy = it.y - cy
    const halfW = view.width / 2 - margin
    const halfH = view.height / 2 - margin * 2.5
    const k = Math.min(halfW / Math.max(Math.abs(dx), 1e-6), halfH / Math.max(Math.abs(dy), 1e-6))
    const px = cx + dx * k
    const py = cy + dy * k
    const angle = Math.atan2(dy, dx)
    const size = 11 / cam.zoom
    const tip = { x: px + Math.cos(angle) * size, y: py + Math.sin(angle) * size }
    const left = { x: px + Math.cos(angle + 2.5) * size, y: py + Math.sin(angle + 2.5) * size }
    const right = { x: px + Math.cos(angle - 2.5) * size, y: py + Math.sin(angle - 2.5) * size }
    const pulse = 0.55 + 0.35 * Math.abs(Math.sin(this.time.now / 500))
    g.fillStyle(0x181411, 0.9)
    g.fillCircle(px, py, size * 1.35)
    g.fillStyle(0xe08a3c, pulse)
    g.fillPoints([new Phaser.Math.Vector2(tip.x, tip.y), new Phaser.Math.Vector2(left.x, left.y), new Phaser.Math.Vector2(right.x, right.y)], true)
  }

  // ---- comandos (React → mundo) --------------------------------------------
  setMarkers(states: Record<string, MarkerState>) {
    const previous = this.markers
    this.markers = states
    this.registry.set("markers", states)
    this.applyMarkers()
    if (Object.keys(previous).length === 0) return
    // algo se acaba de completar: la baliza salta y suelta chispas (con un panel abierto, al cerrarlo)
    Object.entries(states).forEach(([id, st]) => {
      if (st !== "done" || previous[id] === "done" || !this.beacons.has(id)) return
      if (this.paused) this.pendingPops.push(id)
      else this.popBeacon(id)
    })
  }

  private popBeacon(id: string) {
    const b = this.beacons.get(id)
    if (!b) return
    if (!this.reducedMotion) this.tweens.add({ targets: b, scaleX: b.scaleX * 1.7, scaleY: b.scaleY * 1.7, duration: 180, yoyo: true, ease: "Quad.easeOut" })
    this.burst(b.x, b.y, 16)
    this.ringPulse(b.x, b.y, 22, 0x3f9c96, 600)
  }

  setGuide(targetId: string | null) {
    this.guideTarget = targetId
    this.registry.set("guide", targetId)
  }

  enterRoom(sceneId: string) {
    this.transitionTo("room", { roomId: sceneId })
  }

  exitRoom() {
    // solo aplica en cuartos; el patio lo ignora
  }

  protected transitionTo(key: string, data: Record<string, unknown>) {
    this.paused = true
    this.joystick.end()
    this.emitJoystick()
    gameEvents.emit("action", { target: null })
    const door = this.current
    this.current = null
    const cam = this.cameras.main
    // cruzar la puerta: la cámara se acerca mientras funde
    cam.zoomTo(cam.zoom * 1.18, 240, "Sine.easeIn", true)
    if (door) this.ringPulse(door.x, door.y, 30, 0xf4efe4, 420)
    cam.fadeOut(220, 24, 21, 17)
    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(key, data)
    })
  }

  goTo(targetId: string) {
    const it = this.interactables.find((i) => i.id === targetId)
    if (!it) return
    this.walkTo(this.approachPoint(it), targetId)
  }

  teleport(x: number, y: number) {
    const p = nearestStandable(x, y, PLAYER_RADIUS, this.geo)
    this.px = p.x
    this.py = p.y
    this.cancelPath()
    this.player.setPosition(Math.round(this.px), Math.round(this.py))
    this.cameras.main.centerOn(this.px, this.py - 36)
  }

  setAvatar(avatarId: string) {
    if (!AVATARS.some((a) => a.id === avatarId)) return
    this.avatarId = avatarId
    this.registry.set("avatarId", avatarId)
    this.player.setTexture(`avatar-${avatarId}`, 0)
    this.player.anims.stop()
    this.applyIdleFrame()
  }

  setPaused(paused: boolean) {
    this.paused = paused
    if (!paused && this.pendingPops.length > 0) {
      const ids = this.pendingPops.splice(0)
      this.time.delayedCall(160, () => ids.forEach((id) => this.popBeacon(id)))
    }
    if (paused) {
      this.joystick.end()
      this.emitJoystick()
      this.cancelPath()
      this.moving = false
      this.applyAnimation()
    }
  }

  setWorldFlags(flags: string[]) {
    this.worldFlags = flags
    this.registry.set("worldFlags", flags)
    this.onWorldFlags(flags)
  }

  triggerAction() {
    if (this.paused || !this.current) return
    gameEvents.emit("interact", { target: this.current })
  }

  focus(target: { x: number; y: number } | null) {
    this.focused = target !== null
    const cam = this.cameras.main
    // force = true: si el zoom anterior sigue animando, el nuevo lo sustituye (si no, se ignora)
    cam.zoomTo(this.focused ? this.baseZoom * FOCUS_ZOOM_MULT : this.baseZoom, 320, "Sine.easeInOut", true)
  }

  // ---- hooks de prueba ---------------------------------------------------------
  debugState() {
    const cam = this.cameras.main
    return {
      sceneId: this.sceneId,
      spaceId: this.spaceId,
      fps: Math.round(this.game.loop.actualFps),
      player: { x: this.px, y: this.py, facing: this.facing, moving: this.moving, avatarId: this.avatarId },
      camera: { scrollX: cam.scrollX, scrollY: cam.scrollY, zoom: cam.zoom, width: cam.width, height: cam.height, deadzone: cam.deadzone ? { w: cam.deadzone.width, h: cam.deadzone.height } : null },
      current: this.current,
      paused: this.paused,
      interactables: this.interactables.map((i) => ({ id: i.id, x: i.x, y: i.y, radius: i.radius, action: i.action })),
      joystick: this.joystick.state(),
      markers: this.markers,
      guide: this.guideTarget,
      beacons: [...this.beacons.entries()].map(([id, b]) => ({ id, texture: b.texture.key, scale: b.scaleX })),
      guideVisible: this.guideGfx ? this.guideGfx.commandBuffer.length > 0 : false,
      fx: this.fxLog.slice(-20),
      clock: { now: Math.round(this.time.now), paused: this.time.paused },
      resizes: this.resizes,
    }
  }

  debugCanStand(x: number, y: number) {
    return canStand(x, y, PLAYER_RADIUS, this.geo)
  }
}

/** registra animaciones de los 5 avatares (una vez, en Boot) */
export function createAvatarAnimations(anims: Phaser.Animations.AnimationManager) {
  AVATARS.forEach((a) => {
    const key = `avatar-${a.id}`
    const rows: Array<[string, number]> = [
      ["down", 0],
      ["up", 4],
      ["side", 8],
    ]
    rows.forEach(([dir, start]) => {
      const animKey = `${a.id}-walk-${dir}`
      if (anims.exists(animKey)) return
      anims.create({
        key: animKey,
        frames: [start + 1, start + 2, start + 3, start + 2].map((frame) => ({ key, frame })),
        frameRate: WALK_FPS,
        repeat: -1,
      })
    })
  })
}
