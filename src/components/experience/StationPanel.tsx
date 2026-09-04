import { useCallback, useEffect, useRef, useState } from "react"
import type { WorkshopStation } from "../../data/scenes"
import { game } from "../../game/state"

interface StationPanelProps {
  station: WorkshopStation
  sceneName: string
  onCraft: (station: WorkshopStation) => void
  onClose: () => void
  onExit: () => void
}

/**
 * Interacción de estación: mantener presionado hasta completar.
 * Abstracta y breve (10–40 s por taller, docs §91.12). Si la pieza
 * única ya se hizo, la estación lo dice y sugiere el siguiente paso.
 */
export function StationPanel({ station, sceneName, onCraft, onClose, onExit }: StationPanelProps) {
  const alreadyDone = Boolean(station.doneFlag && game.hasFlag(station.doneFlag))
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(alreadyDone)
  const holding = useRef(false)
  const raf = useRef(0)
  const last = useRef(0)
  const progressRef = useRef(0)
  const completedRef = useRef(alreadyDone)

  const stop = useCallback(() => {
    holding.current = false
  }, [])

  useEffect(() => {
    const tick = (t: number) => {
      raf.current = requestAnimationFrame(tick)
      if (!holding.current || completedRef.current) {
        last.current = t
        return
      }
      const dt = Math.min(t - last.current, 50)
      last.current = t
      progressRef.current = Math.min(1, progressRef.current + dt / station.holdMs)
      setProgress(progressRef.current)
      if (progressRef.current >= 1) {
        completedRef.current = true
        holding.current = false
        setDone(true)
        onCraft(station)
      }
    }
    raf.current = requestAnimationFrame(tick)
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
    }
  }, [onCraft, station, stop])

  return (
    <div className="station" role="dialog" aria-modal="true" aria-label={station.name}>
      <button type="button" className="station__backdrop" aria-label="Cerrar" onClick={onClose} />
      <section className="station__panel">
        <header className="station__header">
          <p className="station__kicker">
            {sceneName} · {station.name}
          </p>
          <button type="button" className="overlay__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <h2 className="station__title">{station.craft.label}</h2>

        {done ? (
          <>
            <p className="station__hint">
              {alreadyDone
                ? "La base ya está lista. Llévala al pedestal del patio para instalarla."
                : "Lista. Llévala al pedestal del patio para instalarla."}
            </p>
            <div className="station__bar">
              <span style={{ transform: "scaleX(1)" }} />
            </div>
            <div className="station__actions">
              <button type="button" className="overlay__cta overlay__cta--primary" onClick={onExit}>
                SALIR AL PATIO ↗
              </button>
              <button type="button" className="overlay__cta" onClick={onClose}>
                SEGUIR AQUÍ
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="station__hint">{station.hint}</p>
            <div className="station__bar" aria-hidden="true">
              <span style={{ transform: `scaleX(${progress})` }} />
            </div>
            <div className="station__actions">
              <button
                type="button"
                className={`station__hold${holding.current ? " is-holding" : ""}`}
                onPointerDown={(e) => {
                  e.preventDefault()
                  holding.current = true
                  last.current = performance.now()
                }}
                onPointerUp={stop}
                onPointerLeave={stop}
                onContextMenu={(e) => e.preventDefault()}
              >
                MANTÉN PARA {station.verb}
              </button>
              <span className="station__progress">{Math.round(progress * 100)}%</span>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
