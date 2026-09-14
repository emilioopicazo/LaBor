// ============================================================
// LA BALANZA (CONTRASTE) — cinco piedras con peso; elegir las que suman
// exactamente el objetivo. Tres rondas. Siempre hay solución (el
// objetivo se construye con un subconjunto real de las piedras).
// ============================================================

export const ROUNDS = 3
export const STONES = 5

export interface BalanceRound {
  stones: number[]
  target: number
}

export interface BalanceState {
  rounds: BalanceRound[]
  round: number
  selected: number[]
  attempts: number
  complete: boolean
  lastResult: "ok" | "over" | "under" | null
}

function makeRound(rnd: () => number): BalanceRound {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const stones: number[] = []
  while (stones.length < STONES) stones.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0])
  const size = 2 + Math.floor(rnd() * 2) // 2 o 3 piedras
  const idx = [0, 1, 2, 3, 4].sort(() => rnd() - 0.5).slice(0, size)
  const target = idx.reduce((sum, i) => sum + stones[i], 0)
  return { stones, target }
}

export function createBalance(rnd: () => number = Math.random): BalanceState {
  return { rounds: Array.from({ length: ROUNDS }, () => makeRound(rnd)), round: 0, selected: [], attempts: 0, complete: false, lastResult: null }
}

export function currentRound(s: BalanceState): BalanceRound {
  return s.rounds[Math.min(s.round, ROUNDS - 1)]
}

export function selectedWeight(s: BalanceState): number {
  const r = currentRound(s)
  return s.selected.reduce((sum, i) => sum + r.stones[i], 0)
}

export function toggleStone(s: BalanceState, i: number): BalanceState {
  if (s.complete || i < 0 || i >= STONES) return s
  const selected = s.selected.includes(i) ? s.selected.filter((x) => x !== i) : [...s.selected, i]
  return { ...s, selected, lastResult: null }
}

export function weigh(s: BalanceState): BalanceState {
  if (s.complete || s.selected.length === 0) return s
  const r = currentRound(s)
  const w = selectedWeight(s)
  if (w === r.target) {
    const round = s.round + 1
    return { ...s, round, selected: [], lastResult: "ok", complete: round >= ROUNDS }
  }
  return { ...s, attempts: s.attempts + 1, lastResult: w > r.target ? "over" : "under" }
}
