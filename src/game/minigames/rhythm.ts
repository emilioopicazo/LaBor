// ============================================================
// RITMO DE FRAGUA (MANNNO) — el martillo cae sobre cuatro yunques en un
// orden; hay que repetirlo. Cuatro rondas de 2, 3, 4 y 5 golpes. Un
// error pierde la ronda (se puede repetir al instante).
// ============================================================

export const TILES = 4
export const ROUNDS = 4
export type RhythmPhase = "show" | "input" | "won" | "lost"

export interface RhythmState {
  sequence: number[]
  round: number
  phase: RhythmPhase
  inputIndex: number
}

function nextTile(rnd: () => number, prev?: number): number {
  let t = Math.floor(rnd() * TILES)
  if (t === prev) t = (t + 1 + Math.floor(rnd() * (TILES - 1))) % TILES
  return t
}

export function createRhythm(rnd: () => number = Math.random): RhythmState {
  const first = nextTile(rnd)
  return { sequence: [first, nextTile(rnd, first)], round: 1, phase: "show", inputIndex: 0 }
}

/** la UI terminó de mostrar la secuencia: toca repetirla */
export function startInput(s: RhythmState): RhythmState {
  return s.phase === "show" ? { ...s, phase: "input", inputIndex: 0 } : s
}

export function pressTile(s: RhythmState, tile: number, rnd: () => number = Math.random): RhythmState {
  if (s.phase !== "input" || tile < 0 || tile >= TILES) return s
  if (s.sequence[s.inputIndex] !== tile) return { ...s, phase: "lost" }
  const inputIndex = s.inputIndex + 1
  if (inputIndex < s.sequence.length) return { ...s, inputIndex }
  if (s.round >= ROUNDS) return { ...s, inputIndex, phase: "won" }
  const last = s.sequence[s.sequence.length - 1]
  return { sequence: [...s.sequence, nextTile(rnd, last)], round: s.round + 1, phase: "show", inputIndex: 0 }
}
