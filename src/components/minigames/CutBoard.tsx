import { useCallback, useEffect, useRef, useState } from "react"
import { createCut, cutAt, markerPosition } from "../../game/minigames/cut"

interface Props {
  onComplete: (success: boolean, score?: number) => void
}

/**
 * CORTE A MEDIDA: la marca recorre la tabla; tocar la tabla corta ahí.
 * La posición se anima por rAF sin re-render (ref al marcador); React
 * solo se entera de cada corte.
 */
export function CutBoard({ onComplete }: Props) {
  const [state, setState] = useState(() => createCut())
  const stateRef = useRef(state)
  const marker = useRef<HTMLSpanElement>(null)
  const board = useRef<HTMLButtonElement>(null)
  const startedAt = useRef(performance.now())
  const reported = useRef(false)
  stateRef.current = state

  useEffect(() => {
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const s = stateRef.current
      if (s.outcome !== "playing") return
      const pos = markerPosition(s, performance.now() - startedAt.current)
      if (marker.current) marker.current.style.left = `${pos * 100}%`
      if (board.current) board.current.dataset.marker = pos.toFixed(3)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (state.outcome === "playing" || reported.current) return
    reported.current = true
    onComplete(state.outcome === "win", state.outcome === "win" ? Math.max(0, 6 - state.attempts) * 20 : 0)
  }, [state, onComplete])

  const cut = useCallback(() => {
    const s = stateRef.current
    if (s.outcome !== "playing") return
    const pos = markerPosition(s, performance.now() - startedAt.current)
    setState(cutAt(s, pos))
  }, [])

  const left = `${(state.target - state.tolerance) * 100}%`
  const width = `${state.tolerance * 2 * 100}%`

  return (
    <div className="cut" data-outcome={state.outcome}>
      <button
        ref={board}
        type="button"
        className="cut__plank"
        onPointerDown={(e) => {
          e.preventDefault()
          cut()
        }}
        disabled={state.outcome !== "playing"}
        aria-label="Cortar"
        data-target={state.target.toFixed(3)}
        data-tolerance={state.tolerance.toFixed(3)}
      >
        <span className="cut__zone" style={{ left, width }} aria-hidden="true" />
        <span className="cut__line" style={{ left: `${state.target * 100}%` }} aria-hidden="true" />
        {state.last && (
          <span key={state.attempts} className={`cut__kerf${state.last.hit ? " is-hit" : " is-miss"}`} style={{ left: `${state.last.pos * 100}%` }} aria-hidden="true" />
        )}
        <span ref={marker} className="cut__marker" aria-hidden="true" />
      </button>
      <div className="cut__tally" aria-hidden="true">
        {Array.from({ length: state.maxAttempts }, (_, i) => {
          const used = i < state.attempts
          return <span key={i} className={`cut__slot${used ? " is-used" : ""}`} />
        })}
      </div>
      <p className="minigame__status">
        {state.outcome === "playing"
          ? `CORTES BUENOS ${state.hits}/${state.needed} · INTENTOS ${state.attempts}/${state.maxAttempts}`
          : state.outcome === "win"
            ? "GANASTE · TRES CORTES A MEDIDA"
            : "SE ACABÓ LA TABLA"}
      </p>
    </div>
  )
}
