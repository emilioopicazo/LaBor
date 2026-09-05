// ============================================================
// Joystick flotante (lógica). Nace donde cae el dedo dentro de la zona
// izquierda; entrega un vector normalizado con zona muerta. Los
// visuales viven en el DOM (React) y se alimentan de `state()`.
// ============================================================

export interface JoystickState {
  active: boolean
  /** origen en px de pantalla */
  ox: number
  oy: number
  /** posición de la perilla en px de pantalla */
  kx: number
  ky: number
  /** vector [-1, 1] ya con zona muerta y magnitud analógica */
  x: number
  y: number
  mag: number
}

export class Joystick {
  static readonly RADIUS = 44
  static readonly DEAD = 6

  pointerId: number | null = null
  private ox = 0
  private oy = 0
  private kx = 0
  private ky = 0
  x = 0
  y = 0
  mag = 0

  get active() {
    return this.pointerId !== null
  }

  begin(pointerId: number, sx: number, sy: number) {
    this.pointerId = pointerId
    this.ox = sx
    this.oy = sy
    this.kx = sx
    this.ky = sy
    this.x = 0
    this.y = 0
    this.mag = 0
  }

  move(pointerId: number, sx: number, sy: number) {
    if (this.pointerId !== pointerId) return
    let dx = sx - this.ox
    let dy = sy - this.oy
    const len = Math.hypot(dx, dy)
    const R = Joystick.RADIUS
    if (len > R) {
      // el anillo sigue al dedo cuando se sale del radio (stick "flotante")
      const over = len - R
      this.ox += (dx / len) * over
      this.oy += (dy / len) * over
      dx = sx - this.ox
      dy = sy - this.oy
    }
    this.kx = sx
    this.ky = sy
    const l = Math.hypot(dx, dy)
    if (l <= Joystick.DEAD) {
      this.x = 0
      this.y = 0
      this.mag = 0
      return
    }
    const mag = Math.min(1, (l - Joystick.DEAD) / (R - Joystick.DEAD))
    this.x = dx / l
    this.y = dy / l
    this.mag = mag
  }

  end(pointerId?: number) {
    if (pointerId !== undefined && this.pointerId !== pointerId) return
    this.pointerId = null
    this.x = 0
    this.y = 0
    this.mag = 0
  }

  state(): JoystickState {
    return { active: this.active, ox: this.ox, oy: this.oy, kx: this.kx, ky: this.ky, x: this.x, y: this.y, mag: this.mag }
  }
}
