// ============================================================
// LA HORA — la sombra del reloj de sol marca la hora real de Tulum
// Tulum (Quintana Roo) es UTC−5 todo el año. La sombra barre de −52°
// (amanecer) a +52° (atardecer) entre las 6:30 y las 18:30; de noche no
// hay sombra. El arte define el rango; la hora la pone el reloj real.
// ============================================================

export const TULUM_UTC_OFFSET_H = -5
export const SHADOW_MAX_DEG = 52
export const DAY_START_H = 6.5
export const DAY_END_H = 18.5

export interface SundialReading {
  /** hora local de Tulum en decimales (0–24) */
  localHours: number
  /** ángulo de la sombra en grados (−52 … 52) */
  angle: number
  /** hay sol: la sombra se ve */
  daylight: boolean
}

export function tulumLocalHours(date: Date): number {
  const utc = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  return (utc + TULUM_UTC_OFFSET_H + 24) % 24
}

export function sundialReading(date: Date = new Date()): SundialReading {
  const localHours = tulumLocalHours(date)
  const daylight = localHours >= DAY_START_H && localHours <= DAY_END_H
  const t = (localHours - DAY_START_H) / (DAY_END_H - DAY_START_H)
  const clamped = Math.min(1, Math.max(0, t))
  const angle = -SHADOW_MAX_DEG + clamped * 2 * SHADOW_MAX_DEG
  return { localHours, angle, daylight }
}
