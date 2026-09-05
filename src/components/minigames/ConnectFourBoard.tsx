import { useEffect, useRef, useState } from "react"
import { COLS, ROWS, aiTurn, createConnectFour, dropRow, playerDrop } from "../../game/minigames/connectfour"

interface Props {
  onComplete: (success: boolean, score?: number) => void
}

/** CONECTA 4: tap en una columna (toda la columna es el objetivo táctil). */
export function ConnectFourBoard({ onComplete }: Props) {
  const [state, setState] = useState(() => createConnectFour())
  const reported = useRef(false)

  useEffect(() => {
    if (state.outcome !== "playing") {
      if (!reported.current) {
        reported.current = true
        onComplete(state.outcome === "win", state.outcome === "win" ? Math.max(0, 21 - state.moves) * 10 : 0)
      }
      return
    }
    if (state.turn === "A") {
      const t = window.setTimeout(() => setState((s) => aiTurn(s)), 420)
      return () => window.clearTimeout(t)
    }
  }, [state, onComplete])

  const isWin = (r: number, c: number) => state.winningCells?.some(([wr, wc]) => wr === r && wc === c)
  const isLast = (r: number, c: number) => state.lastMove?.[0] === r && state.lastMove?.[1] === c

  return (
    <div className="c4" data-outcome={state.outcome}>
      <div className="c4__grid" role="grid" aria-label="Tablero Conecta 4">
        {Array.from({ length: COLS }, (_, c) => (
          <button
            key={c}
            type="button"
            className="c4__col"
            disabled={state.outcome !== "playing" || state.turn !== "P" || dropRow(state.grid, c) < 0}
            onClick={() => setState((s) => playerDrop(s, c))}
            aria-label={`Columna ${c + 1}`}
          >
            {Array.from({ length: ROWS }, (_, r) => {
              const d = state.grid[r][c]
              return (
                <span
                  key={r}
                  className={`c4__cell${d ? ` c4__cell--${d.toLowerCase()}` : ""}${isWin(r, c) ? " is-win" : ""}${isLast(r, c) ? " is-last" : ""}`}
                />
              )
            })}
          </button>
        ))}
      </div>
      <p className="minigame__status">
        {state.outcome === "playing" ? (state.turn === "P" ? "TU TURNO · RONDANA" : "HERRERÍA…") : state.outcome === "win" ? "GANASTE" : state.outcome === "draw" ? "EMPATE" : "PERDISTE"}
      </p>
    </div>
  )
}
