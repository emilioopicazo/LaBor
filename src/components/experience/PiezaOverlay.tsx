import { useEffect, useRef } from "react"
import { BASE_COMPONENT, installBase, piezaCentral } from "../../game/quests"
import { useGameState } from "../../game/state"

interface PiezaOverlayProps {
  onClose: () => void
  onGoTo: (spaceId: string) => void
}

/**
 * Overlay de LA PIEZA CENTRAL: estado de la quest y la acción
 * disponible (ir a VETA / instalar la base). Al instalar, el mundo
 * cambia: la base aparece sobre el pedestal.
 */
export function PiezaOverlay({ onClose, onGoTo }: PiezaOverlayProps) {
  const save = useGameState()
  const quest = piezaCentral(save)
  const hasBase = save.inventory.components.includes(BASE_COMPONENT)
  const installStep = quest.steps.find((s) => s.id === "install-base")
  const craftStep = quest.steps.find((s) => s.id === "craft-base")
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  const mark = (status: string) => (status === "done" ? "✓" : status === "active" ? "→" : status === "soon" ? "·" : "—")

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={quest.title}>
      <button type="button" className="overlay__backdrop" aria-label="Cerrar" onClick={onClose} />
      <article className="overlay__panel">
        <header className="overlay__header">
          <p className="overlay__kicker">INSTALACIÓN · {quest.progress}</p>
          <button ref={closeRef} type="button" className="overlay__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <h2 className="overlay__name">
          <span>LA PIEZA</span>
          <span>CENTRAL</span>
        </h2>

        <p className="overlay__description">{quest.description}</p>

        <ul className="overlay__steps">
          {quest.steps.map((step) => (
            <li key={step.id} className={`overlay__step overlay__step--${step.status}`}>
              <span className="overlay__step-mark">{mark(step.status)}</span>
              <span className="overlay__step-text">{step.text}</span>
              {step.status === "soon" && <span className="overlay__step-soon">PRÓXIMAMENTE</span>}
            </li>
          ))}
        </ul>

        <div className="overlay__cta-row">
          {installStep?.status === "active" && hasBase ? (
            <button
              type="button"
              className="overlay__cta overlay__cta--primary"
              onClick={() => {
                installBase()
              }}
            >
              INSTALAR LA BASE ↗
            </button>
          ) : craftStep?.status === "active" ? (
            <button type="button" className="overlay__cta overlay__cta--primary" onClick={() => onGoTo("veta")}>
              IR A VETA ↗
            </button>
          ) : quest.complete ? (
            <span className="overlay__cta overlay__cta--soon">SIGUIENTE: HERRERÍA · PRÓXIMAMENTE</span>
          ) : null}
        </div>
      </article>
    </div>
  )
}
