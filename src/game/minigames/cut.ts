// ============================================================
// CORTE A MEDIDA (VETA) — una marca recorre la tabla de ida y vuelta;
// tocar corta donde está la marca. Tres cortes dentro de la tolerancia
// en cinco intentos ganan. Cada acierto acelera la marca y afina el
// margen. Puro tiempo de reacción: un solo toque, sin arrastrar.
// ============================================================

export type CutOutcome = "playing" | "win" | "lose"

export interface CutState {
  /** posición objetivo de la línea (0–1 a lo largo de la tabla) */
  target: number
  /** tolerancia a cada lado (0–1) */
  tolerance: number
  /** barridos completos por segundo (ida = medio ciclo) */
  speed: number
  hits: number
  attempts: number
  needed: number
  maxAttempts: number
  outcome: CutOutcome
  last: { pos: number; hit: boolean } | null
}

const randomTarget = (rnd: () => number, avoid?: number) => {
  let t = 0.2 + rnd() * 0.6
  if (avoid !== undefined && Math.abs(t - avoid) < 0.15) t = t < 0.5 ? t + 0.3 : t - 0.3
  return Math.min(0.85, Math.max(0.15, t))
}

export function createCut(rnd: () => number = Math.random): CutState {
  return { target: randomTarget(rnd), tolerance: 0.11, speed: 0.42, hits: 0, attempts: 0, needed: 3, maxAttempts: 5, outcome: "playing", last: null }
}

/** posición de la marca (0–1) para un tiempo transcurrido: onda triangular */
export function markerPosition(state: CutState, elapsedMs: number): number {
  const phase = ((elapsedMs / 1000) * state.speed * 2) % 2
  return phase < 1 ? phase : 2 - phase
}

export function isHit(state: CutState, pos: number): boolean {
  return Math.abs(pos - state.target) <= state.tolerance
}

export function cutAt(state: CutState, pos: number, rnd: () => number = Math.random): CutState {
  if (state.outcome !== "playing") return state
  const hit = isHit(state, pos)
  const hits = state.hits + (hit ? 1 : 0)
  const attempts = state.attempts + 1
  const outcome: CutOutcome = hits >= state.needed ? "win" : attempts >= state.maxAttempts ? "lose" : "playing"
  return {
    ...state,
    hits,
    attempts,
    outcome,
    last: { pos, hit },
    target: outcome === "playing" ? randomTarget(rnd, state.target) : state.target,
    tolerance: hit ? Math.max(0.055, state.tolerance * 0.78) : state.tolerance,
    speed: hit ? state.speed * 1.18 : state.speed,
  }
}
