import { useEffect, useRef, useState } from "react"
import { ROUNDS, createBalance, currentRound, selectedWeight, toggleStone, weigh } from "../../game/minigames/balance"

interface Props {
  onComplete: (success: boolean, score?: number) => void
}

/** LA BALANZA: elegir las piedras que pesan exactamente el objetivo; tres rondas. */
export function BalanceBoard({ onComplete }: Props) {
  const [state, setState] = useState(() => createBalance())
  const reported = useRef(false)
  const round = currentRound(state)
  const weight = selectedWeight(state)

  useEffect(() => {
    if (state.complete && !reported.current) {
      reported.current = true
      onComplete(true, Math.max(0, 30 - state.attempts * 5) * 4)
    }
  }, [state, onComplete])

  return (
    <div className="balance" data-complete={state.complete} data-target={round.target} data-stones={round.stones.join(",")} data-round={state.round}>
      <div className="balance__scale" aria-live="polite">
        <span className="balance__target">
          <span className="balance__label">OBJETIVO</span>
          <span className="balance__value">{round.target} g</span>
        </span>
        <span className={`balance__beam${state.lastResult === "over" ? " is-over" : state.lastResult === "under" ? " is-under" : state.lastResult === "ok" ? " is-ok" : ""}`} aria-hidden="true" />
        <span className="balance__current">
          <span className="balance__label">EN LA BALANZA</span>
          <span className="balance__value">{weight} g</span>
        </span>
      </div>
      <div className="balance__stones">
        {round.stones.map((w, i) => (
          <button
            key={`${state.round}-${i}`}
            type="button"
            className={`balance__stone${state.selected.includes(i) ? " is-selected" : ""}`}
            style={{ ["--w" as string]: w }}
            disabled={state.complete}
            onClick={() => setState((s) => toggleStone(s, i))}
            aria-pressed={state.selected.includes(i)}
            aria-label={`Piedra de ${w} gramos`}
          >
            {w}
          </button>
        ))}
      </div>
      <button type="button" className="balance__weigh" disabled={state.complete || state.selected.length === 0} onClick={() => setState((s) => weigh(s))}>
        PESAR
      </button>
      <p className="minigame__status">
        {state.complete
          ? "GANASTE · TRES PESOS EXACTOS"
          : state.lastResult === "over"
            ? `PESA DE MÁS · RONDA ${state.round + 1}/${ROUNDS}`
            : state.lastResult === "under"
              ? `PESA DE MENOS · RONDA ${state.round + 1}/${ROUNDS}`
              : state.lastResult === "ok"
                ? `EXACTO · RONDA ${state.round + 1}/${ROUNDS}`
                : `RONDA ${state.round + 1}/${ROUNDS}`}
      </p>
    </div>
  )
}
