import { useEffect, useRef, useState } from "react"
import { aiTurn, createTicTacToe, playerMove } from "../../game/minigames/tictactoe"

interface Props {
  onComplete: (success: boolean, score?: number) => void
}

/** GATO: tablero de madera, tap por celda; la IA responde tras un instante. */
export function TicTacToeBoard({ onComplete }: Props) {
  const [state, setState] = useState(() => createTicTacToe())
  const reported = useRef(false)

  useEffect(() => {
    if (state.outcome !== "playing") {
      if (!reported.current) {
        reported.current = true
        onComplete(state.outcome === "win", state.outcome === "win" ? Math.max(0, 9 - state.moves) * 10 : 0)
      }
      return
    }
    if (state.turn === "O") {
      const t = window.setTimeout(() => setState((s) => aiTurn(s)), 380)
      return () => window.clearTimeout(t)
    }
  }, [state, onComplete])

  return (
    <div className="ttt" data-turn={state.turn} data-outcome={state.outcome}>
      {state.board.map((cell, i) => {
        const win = state.winningLine?.includes(i)
        return (
          <button
            key={i}
            type="button"
            className={`ttt__cell${cell ? ` ttt__cell--${cell.toLowerCase()}` : ""}${win ? " is-win" : ""}`}
            disabled={state.outcome !== "playing" || state.turn !== "X" || cell !== null}
            onClick={() => setState((s) => playerMove(s, i))}
            aria-label={`Casilla ${i + 1}${cell ? `: ${cell}` : ""}`}
          >
            {cell === "X" && <span className="ttt__x" aria-hidden="true" />}
            {cell === "O" && <span className="ttt__o" aria-hidden="true" />}
          </button>
        )
      })}
      <p className="minigame__status">
        {state.outcome === "playing" ? (state.turn === "X" ? "TU TURNO · MADERA" : "CARPINTERÍA…") : state.outcome === "win" ? "GANASTE" : state.outcome === "draw" ? "EMPATE" : "PERDISTE"}
      </p>
    </div>
  )
}
