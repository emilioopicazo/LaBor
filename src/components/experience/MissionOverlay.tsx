import { useEffect, useRef, useState } from "react"
import { ASSETS } from "../../data/assets"
import { PIEZA_CENTRAL } from "../../data/missions"
import { MINIGAMES } from "../../game/minigames/contract"
import { eventDateLabel, nextEvent } from "../../data/events"
import { rsvpLink, visitLink } from "../../data/leads"
import { TRACKS } from "../../data/music"
import { getSpace } from "../../data/spaces"
import { mission, missionView, useMissionRun } from "../../game/mission"
import { useProfile } from "../../game/profile"

/** icono pixel del componente (16×16 lógicos, ×2) */
function ComponentIcon({ icon }: { icon: string }) {
  const asset = (ASSETS as unknown as Record<string, { src: string } | undefined>)[icon]
  if (!asset) return null
  return <span className="overlay__icon" style={{ backgroundImage: `url(${asset.src})` }} aria-hidden="true" />
}

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
  const ev = nextEvent()

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
          <span>LA HORA</span>
        </h2>
        <p className="overlay__status">LA PIEZA CENTRAL · RELOJ DE SOL</p>

        {!view && (
          <>
            <p className="overlay__description">{def.description}</p>
            <ul className="overlay__details overlay__details--icons">
              {def.components.map((c) => (
                <li key={c.id}>
                  <ComponentIcon icon={c.icon} />
                  <span>
                    {getSpace(c.spaceId)?.shortName} — {c.minigameIds.map((g) => MINIGAMES[g].title).join(" o ")} → {c.label}
                  </span>
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
                    <ComponentIcon icon={c.icon} />
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
            <p className="overlay__lead overlay__lead--stamp">{def.reward.title}</p>
            <p className="overlay__description">{def.reward.text}</p>
            <p className="overlay__kicker">SUENA · {TRACKS[0].title.toUpperCase()} · {TRACKS[0].artist.toUpperCase()}</p>
            <div className="overlay__cta-row">
              <a className="overlay__cta overlay__cta--primary overlay__cta--wa" href={visitLink(null)} target="_blank" rel="noreferrer">
                AGENDAR VISITA ↗
              </a>
              {ev && (
                <a className="overlay__cta overlay__cta--wa" href={rsvpLink(ev)} target="_blank" rel="noreferrer">
                  VOY AL {ev.kind} {ev.name} · {eventDateLabel(ev).slice(0, 3)} {ev.date.slice(8)} ↗
                </a>
              )}
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
