// ============================================================
// CONECTA 4 (MANNNO) — 7 columnas × 6 filas con gravedad. El
// visitante (P) empieza. IA V1: gana ya → bloquea ya → prefiere el
// centro → columna válida al azar razonable.
// ============================================================

export const COLS = 7
export const ROWS = 6
export type Disc = "P" | "A" | null
export type Outcome = "playing" | "win" | "lose" | "draw"

export interface ConnectFourState {
  /** grid[row][col], fila 0 = arriba */
  grid: Disc[][]
  turn: "P" | "A"
  outcome: Outcome
  winningCells: Array<[number, number]> | null
  lastMove: [number, number] | null
  moves: number
}

export function createConnectFour(): ConnectFourState {
  return {
    grid: Array.from({ length: ROWS }, () => Array<Disc>(COLS).fill(null)),
    turn: "P",
    outcome: "playing",
    winningCells: null,
    lastMove: null,
    moves: 0,
  }
}

export function dropRow(grid: Disc[][], col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) if (grid[r][col] === null) return r
  return -1
}

export function validColumns(grid: Disc[][]): number[] {
  const out: number[] = []
  for (let c = 0; c < COLS; c++) if (grid[0][c] === null) out.push(c)
  return out
}

const DIRS: Array<[number, number]> = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
]

export function findFour(grid: Disc[][], who: Disc): Array<[number, number]> | null {
  if (!who) return null
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== who) continue
      for (const [dr, dc] of DIRS) {
        const cells: Array<[number, number]> = [[r, c]]
        for (let k = 1; k < 4; k++) {
          const rr = r + dr * k
          const cc = c + dc * k
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || grid[rr][cc] !== who) break
          cells.push([rr, cc])
        }
        if (cells.length === 4) return cells
      }
    }
  }
  return null
}

function place(grid: Disc[][], col: number, who: Disc): Disc[][] | null {
  const r = dropRow(grid, col)
  if (r < 0) return null
  const next = grid.map((row) => row.slice())
  next[r][col] = who
  return next
}

function withOutcome(s: ConnectFourState): ConnectFourState {
  const p = findFour(s.grid, "P")
  if (p) return { ...s, outcome: "win", winningCells: p }
  const a = findFour(s.grid, "A")
  if (a) return { ...s, outcome: "lose", winningCells: a }
  if (validColumns(s.grid).length === 0) return { ...s, outcome: "draw" }
  return s
}

export function playerDrop(s: ConnectFourState, col: number): ConnectFourState {
  if (s.outcome !== "playing" || s.turn !== "P" || col < 0 || col >= COLS) return s
  const r = dropRow(s.grid, col)
  if (r < 0) return s
  const grid = place(s.grid, col, "P")!
  return withOutcome({ ...s, grid, turn: "A", lastMove: [r, col], moves: s.moves + 1 })
}

/** Columna elegida por la IA. */
export function aiColumn(grid: Disc[][], rnd: () => number = Math.random): number {
  const valid = validColumns(grid)
  if (valid.length === 0) return -1
  for (const c of valid) if (findFour(place(grid, c, "A")!, "A")) return c
  for (const c of valid) if (findFour(place(grid, c, "P")!, "P")) return c
  // evita regalar una victoria: no juegues donde el visitante gana encima
  const safe = valid.filter((c) => {
    const after = place(grid, c, "A")!
    if (dropRow(after, c) < 0) return true
    return !findFour(place(after, c, "P")!, "P")
  })
  const pool = safe.length > 0 ? safe : valid
  const byCenter = pool.slice().sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3))
  // preferencia por el centro con algo de variedad
  if (rnd() < 0.6) return byCenter[0]
  return pool[Math.floor(rnd() * pool.length)]
}

export function aiTurn(s: ConnectFourState, rnd?: () => number): ConnectFourState {
  if (s.outcome !== "playing" || s.turn !== "A") return s
  const col = aiColumn(s.grid, rnd)
  if (col < 0) return s
  const r = dropRow(s.grid, col)
  const grid = place(s.grid, col, "A")!
  return withOutcome({ ...s, grid, turn: "P", lastMove: [r, col] })
}
