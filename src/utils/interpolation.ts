/** Interpolación lineal simple. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Amortiguación independiente del framerate.
 * `perFrame60` es el factor por frame equivalente a 60fps
 * (p. ej. CAMERA_LERP = 0.08) y `dt` el delta en segundos.
 */
export function damp(current: number, target: number, perFrame60: number, dt: number): number {
  const k = -Math.log(1 - perFrame60) * 60
  const t = 1 - Math.exp(-k * dt)
  return current + (target - current) * t
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
