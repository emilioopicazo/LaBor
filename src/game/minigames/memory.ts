// ============================================================
// MEMORIA (CONTRASTE) — 4×3, seis pares. Solo dos cartas sin pareja
// pueden estar volteadas; el desajuste se oculta tras un retraso que
// controla la UI (hideMismatch). Tocar rápido no rompe el estado.
// ============================================================

export const PAIRS = 6
export const CARD_KINDS = ["anillo", "dije", "cadena", "piedra", "pinza", "lima"] as const
export type CardKind = (typeof CARD_KINDS)[number]

export interface MemoryCard {
  id: number
  kind: CardKind
}

export interface MemoryState {
  cards: MemoryCard[]
  /** índices volteados sin pareja (0, 1 o 2) */
  open: number[]
  matched: number[]
  moves: number
  /** dos abiertas que no coinciden: esperar hideMismatch() */
  locked: boolean
  complete: boolean
}

export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function createMemory(rnd?: () => number): MemoryState {
  const kinds = CARD_KINDS.slice(0, PAIRS)
  const cards = shuffle(
    kinds.flatMap((kind) => [kind, kind]),
    rnd,
  ).map((kind, id) => ({ id, kind }))
  return { cards, open: [], matched: [], moves: 0, locked: false, complete: false }
}

export function flip(s: MemoryState, index: number): MemoryState {
  if (s.complete || s.locked) return s
  if (index < 0 || index >= s.cards.length) return s
  if (s.matched.includes(index) || s.open.includes(index)) return s
  if (s.open.length >= 2) return s
  const open = [...s.open, index]
  if (open.length < 2) return { ...s, open }
  const [a, b] = open
  const moves = s.moves + 1
  if (s.cards[a].kind === s.cards[b].kind) {
    const matched = [...s.matched, a, b]
    return { ...s, open: [], matched, moves, complete: matched.length === s.cards.length }
  }
  return { ...s, open, moves, locked: true }
}

/** Tras el retraso visual: oculta el par que no coincidió. */
export function hideMismatch(s: MemoryState): MemoryState {
  if (!s.locked) return s
  return { ...s, open: [], locked: false }
}
