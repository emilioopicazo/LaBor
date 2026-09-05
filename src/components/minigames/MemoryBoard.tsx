import { useEffect, useRef, useState } from "react"
import { createMemory, flip, hideMismatch, type CardKind } from "../../game/minigames/memory"

interface Props {
  onComplete: (success: boolean, score?: number) => void
}

const GLYPH: Record<CardKind, string> = {
  anillo: "◯",
  dije: "◇",
  cadena: "∞",
  piedra: "●",
  pinza: "⋀",
  lima: "▬",
}
const LABEL: Record<CardKind, string> = { anillo: "ANILLO", dije: "DIJE", cadena: "CADENA", piedra: "PIEDRA", pinza: "PINZA", lima: "LIMA" }

/** MEMORIA: 4×3, seis pares de piezas de joyería. */
export function MemoryBoard({ onComplete }: Props) {
  const [state, setState] = useState(() => createMemory())
  const reported = useRef(false)

  useEffect(() => {
    if (state.complete) {
      if (!reported.current) {
        reported.current = true
        onComplete(true, Math.max(0, 18 - state.moves) * 10)
      }
      return
    }
    if (state.locked) {
      const t = window.setTimeout(() => setState((s) => hideMismatch(s)), 720)
      return () => window.clearTimeout(t)
    }
  }, [state, onComplete])

  return (
    <div className="mem" data-complete={state.complete}>
      <div className="mem__grid">
        {state.cards.map((card, i) => {
          const open = state.open.includes(i) || state.matched.includes(i)
          const matched = state.matched.includes(i)
          return (
            <button
              key={card.id}
              type="button"
              className={`mem__card${open ? " is-open" : ""}${matched ? " is-matched" : ""}`}
              disabled={open || state.locked || state.complete}
              onClick={() => setState((s) => flip(s, i))}
              aria-label={open ? LABEL[card.kind] : "Carta oculta"}
            >
              <span className="mem__face mem__face--back" aria-hidden="true" />
              <span className="mem__face mem__face--front" aria-hidden="true">
                <span className="mem__glyph">{GLYPH[card.kind]}</span>
                <span className="mem__label">{LABEL[card.kind]}</span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="minigame__status">{state.complete ? "COMPLETO" : `PARES ${state.matched.length / 2}/6 · MOVIMIENTOS ${state.moves}`}</p>
    </div>
  )
}
