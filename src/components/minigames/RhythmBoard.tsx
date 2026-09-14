import { useEffect, useRef, useState } from "react"
import { ROUNDS, TILES, createRhythm, pressTile, startInput } from "../../game/minigames/rhythm"

interface Props {
  onComplete: (success: boolean, score?: number) => void
}

const SHOW_MS = 520
const GAP_MS = 260

/** RITMO DE FRAGUA: cuatro yunques; el martillo marca un orden y hay que repetirlo. */
export function RhythmBoard({ onComplete }: Props) {
  const [state, setState] = useState(() => createRhythm())
  const [lit, setLit] = useState<number | null>(null)
  const reported = useRef(false)

  // fase "show": ilumina la secuencia y luego abre la entrada
  useEffect(() => {
    if (state.phase !== "show") return
    let cancelled = false
    const timers: number[] = []
    state.sequence.forEach((tile, i) => {
      timers.push(window.setTimeout(() => !cancelled && setLit(tile), 600 + i * (SHOW_MS + GAP_MS)))
      timers.push(window.setTimeout(() => !cancelled && setLit(null), 600 + i * (SHOW_MS + GAP_MS) + SHOW_MS))
    })
    timers.push(window.setTimeout(() => !cancelled && setState((s) => startInput(s)), 600 + state.sequence.length * (SHOW_MS + GAP_MS)))
    return () => {
      cancelled = true
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [state.phase, state.sequence])

  useEffect(() => {
    if ((state.phase === "won" || state.phase === "lost") && !reported.current) {
      reported.current = true
      onComplete(state.phase === "won", state.phase === "won" ? 120 : 0)
    }
  }, [state.phase, onComplete])

  const press = (tile: number) => {
    if (state.phase !== "input") return
    setLit(tile)
    window.setTimeout(() => setLit(null), 180)
    setState((s) => pressTile(s, tile))
  }

  return (
    <div className="rhythm" data-phase={state.phase} data-sequence={state.sequence.join(",")} data-round={state.round}>
      <div className="rhythm__grid">
        {Array.from({ length: TILES }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`rhythm__tile${lit === i ? " is-lit" : ""}`}
            disabled={state.phase !== "input"}
            onPointerDown={(e) => {
              e.preventDefault()
              press(i)
            }}
            aria-label={`Yunque ${i + 1}`}
          >
            <span className="rhythm__anvil" aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="minigame__status">
        {state.phase === "show"
          ? `MIRA EL RITMO · RONDA ${state.round}/${ROUNDS}`
          : state.phase === "input"
            ? `REPÍTELO · ${state.inputIndex}/${state.sequence.length} · RONDA ${state.round}/${ROUNDS}`
            : state.phase === "won"
              ? "GANASTE · RITMO DE FRAGUA"
              : "SE PERDIÓ EL RITMO"}
      </p>
    </div>
  )
}
