// ============================================================
// GATO (VETA) — 3×3, el visitante es X y empieza. IA por minimax con
// un porcentaje de jugadas "distraídas" para que se pueda ganar
// (una IA perfecta nunca pierde y la misión sería imposible).
// ============================================================

export type Cell = "X" | "O" | null
export type Outcome = "playing" | "win" | "lose" | "draw"

export interface TicTacToeState {
  board: Cell[]
  turn: "X" | "O"
  outcome: Outcome
  winningLine: number[] | null
  moves: number
}

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

export function createTicTacToe(): TicTacToeState {
  return { board: Array<Cell>(9).fill(null), turn: "X", outcome: "playing", winningLine: null, moves: 0 }
}

export function winnerOf(board: Cell[]): { who: Cell; line: number[] | null } {
  for (const line of LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { who: board[a], line }
  }
  return { who: null, line: null }
}

function evaluate(board: Cell[], depth: number): number {
  const { who } = winnerOf(board)
  if (who === "O") return 10 - depth
  if (who === "X") return depth - 10
  return 0
}

function minimax(board: Cell[], player: "X" | "O", depth: number): number {
  const { who } = winnerOf(board)
  if (who || board.every((c) => c !== null)) return evaluate(board, depth)
  let best = player === "O" ? -Infinity : Infinity
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue
    board[i] = player
    const score = minimax(board, player === "O" ? "X" : "O", depth + 1)
    board[i] = null
    best = player === "O" ? Math.max(best, score) : Math.min(best, score)
  }
  return best
}

/** Mejor jugada para O (minimax). */
export function bestMove(board: Cell[]): number {
  let best = -Infinity
  let move = -1
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue
    board[i] = "O"
    const score = minimax(board, "X", 0)
    board[i] = null
    if (score > best) {
      best = score
      move = i
    }
  }
  return move
}

/**
 * Jugada de la IA: bloquea/gana siempre que sea inmediato; fuera de
 * eso, con probabilidad `slack` juega una casilla libre al azar.
 */
export function aiMove(board: Cell[], slack = 0.4, rnd: () => number = Math.random): number {
  const free = board.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0)
  if (free.length === 0) return -1
  // ganar ya (siempre: una IA que no cierra su línea se siente rota)
  for (const i of free) {
    board[i] = "O"
    const w = winnerOf(board).who
    board[i] = null
    if (w === "O") return i
  }
  // jugada "distraída": puede no bloquear — así el visitante sí puede ganar
  if (rnd() < slack) return free[Math.floor(rnd() * free.length)]
  // bloquear ya
  for (const i of free) {
    board[i] = "X"
    const w = winnerOf(board).who
    board[i] = null
    if (w === "X") return i
  }
  return bestMove(board)
}

function withOutcome(s: TicTacToeState): TicTacToeState {
  const { who, line } = winnerOf(s.board)
  if (who === "X") return { ...s, outcome: "win", winningLine: line }
  if (who === "O") return { ...s, outcome: "lose", winningLine: line }
  if (s.board.every((c) => c !== null)) return { ...s, outcome: "draw" }
  return s
}

/** Jugada del visitante (X). Devuelve el mismo estado si no es válida. */
export function playerMove(s: TicTacToeState, index: number): TicTacToeState {
  if (s.outcome !== "playing" || s.turn !== "X" || index < 0 || index > 8 || s.board[index]) return s
  const board = s.board.slice()
  board[index] = "X"
  return withOutcome({ ...s, board, turn: "O", moves: s.moves + 1 })
}

export function aiTurn(s: TicTacToeState, rnd?: () => number): TicTacToeState {
  if (s.outcome !== "playing" || s.turn !== "O") return s
  const board = s.board.slice()
  const i = aiMove(board, 0.4, rnd)
  if (i < 0) return s
  board[i] = "O"
  return withOutcome({ ...s, board, turn: "X" })
}
