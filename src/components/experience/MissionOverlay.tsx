import { useEffect, useRef, useState } from "react"
import { PIEZA_CENTRAL } from "../../data/missions"
import { TRACKS } from "../../data/music"
import { getSpace, whatsappLink } from "../../data/spaces"
import { mission, missionView, useMissionRun } from "../../game/mission"
import { useProfile } from "../../game/profile"

interface MissionOverlayProps {
  onClose: () => void
  onGoTo: (spaceId: string) => void
}

/**
 * LA PIEZA CENTRAL: iniciar / estado / instalar / reiniciar (con
 * confirmación) / recompensa. Solo se muestra el objetivo actual y los
 * tres componentes; nada de bitácora enorme.
 */
export function MissionOverlay({ onClose, onGoTo }: MissionOverlayProps) {
  const run = useMissionRun()
  const prof = useProfile()
  const view = missionView(run)
  const def = view?.def ?? PIEZA_CENTRAL
  const closeRef = useRef<HTMLButtonElement>(null)
  const [confirmRestart, setConfirmRestart] = useState(false)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  const timesDone = prof.completed[def.id] ?? 0
  const next = view?.targetSpaceId ? getSpace(view.targetSpaceId) : null

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={def.title}>
      <button type="button" className="overlay__backdrop" aria-label="Cerrar" onClick={onClose} />
      <article className="overlay__panel">
        <header className="overlay__header">
          <p className="overlay__kicker">MISIÓN{view ? ` · ${view.progress}` : ""}{timesDone > 0 ? ` · COMPLETADA ×${timesDone}` : ""}</p>
          <button ref={closeRef} type="button" className="overlay__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <h2 className="overlay__name">
          <span>LA PIEZA</span>
          <span>CENTRAL</span>
        </h2>

        {!view && (
          <>
            <p className="overlay__description">{def.description}</p>
            <ul className="overlay__details">
              {def.components.map((c) => (
                <li key={c.id}>
                  {getSpace(c.spaceId)?.shortName} — {c.minigameId === "gato" ? "GATO" : c.minigameId === "conecta4" ? "CONECTA 4" : "MEMORIA"} → {c.label}
                </li>
              ))}
            </ul>
            <div className="overlay__cta-row">
              <button type="button" className="overlay__cta overlay__cta--primary" onClick={() => mission.startMission(def.id)}>
                INICIAR MISIÓN ↗
              </button>
            </div>
          </>
        )}

        {view && !view.complete && (
          <>
            <p className="overlay__objective">
              <span className="overlay__objective-label">AHORA</span>
              {view.objective}
            </p>
            <ul className="overlay__steps">
              {def.components.map((c) => {
                const installed = view.run.installed.includes(c.id)
                const carried = view.run.temporaryInventory.includes(c.id)
                const status = installed ? "done" : carried ? "carry" : view.currentComponentId === c.id ? "active" : "pending"
                return (
                  <li key={c.id} className={`overlay__step overlay__step--${status}`}>
                    <span className="overlay__step-mark">{installed ? "✓" : carried ? "●" : status === "active" ? "→" : "—"}</span>
                    <span className="overlay__step-text">
                      {c.label} · {getSpace(c.spaceId)?.shortName}
                      {carried ? " · EN MANO" : installed ? " · INSTALADA" : ""}
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className="overlay__cta-row">
              {view.installable.length > 0 && (
                <button type="button" className="overlay__cta overlay__cta--primary" onClick={() => mission.installNext()}>
                  INSTALAR {def.components.find((c) => c.id === view.installable[0])?.short} ↗
                </button>
              )}
              {next && view.installable.length === 0 && (
                <button type="button" className="overlay__cta overlay__cta--primary" onClick={() => onGoTo(next.id)}>
                  IR A {next.shortName ?? next.name} ↗
                </button>
              )}
              {!confirmRestart ? (
                <button type="button" className="overlay__cta" onClick={() => setConfirmRestart(true)}>
                  REINICIAR MISIÓN
                </button>
              ) : (
                <span className="overlay__confirm">
                  <span>¿Empezar de cero? Se pierden componentes y avances.</span>
                  <button
                    type="button"
                    className="overlay__cta overlay__cta--danger"
                    onClick={() => {
                      mission.restartMission()
                      setConfirmRestart(false)
                    }}
                  >
                    SÍ, REINICIAR
                  </button>
                  <button type="button" className="overlay__cta" onClick={() => setConfirmRestart(false)}>
                    NO
                  </button>
                </span>
              )}
            </div>
          </>
        )}

        {view && view.complete && (
          <>
            <p className="overlay__lead">{def.reward.title}</p>
            <p className="overlay__description">{def.reward.text}</p>
            <p className="overlay__kicker">SUENA · {TRACKS[0].title.toUpperCase()} · {TRACKS[0].artist.toUpperCase()}</p>
            <div className="overlay__cta-row">
              <a
                className="overlay__cta overlay__cta--primary"
                href={whatsappLink("Hola La Bor, completé LA PIEZA CENTRAL en el recorrido digital y quiero agendar una visita a los talleres.")}
                target="_blank"
                rel="noreferrer"
              >
                AGENDAR VISITA ↗
              </a>
              <button type="button" className="overlay__cta" onClick={() => mission.restartMission()}>
                JUGAR DE NUEVO
              </button>
            </div>
          </>
        )}
      </article>
    </div>
  )
}
