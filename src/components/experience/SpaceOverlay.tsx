import { useEffect, useRef } from "react"
import { spaceKindLabel, type WorkshopSpace } from "../../data/spaces"

interface SpaceOverlayProps {
  space: WorkshopSpace
  onClose: () => void
  onNavigate: (id: string) => void
}

/**
 * Overlay editorial de un espacio. No navega a otra ruta: se abre
 * sobre el mundo, que permanece visible detrás. Cierra con ×, ESC
 * o clic en el fondo.
 */
export function SpaceOverlay({ space, onClose, onNavigate }: SpaceOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [space.id])

  const kicker = space.number
    ? `${space.number} / ${spaceKindLabel(space)}`
    : spaceKindLabel(space)

  const nameLines = space.name.split(" ")
  const subtitleLines = space.subtitle?.split(" / ") ?? []

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={space.name}>
      <button
        type="button"
        className="overlay__backdrop"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <article className="overlay__panel">
        <header className="overlay__header">
          <p className="overlay__kicker">{kicker}</p>
          <button
            ref={closeRef}
            type="button"
            className="overlay__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <h2 className="overlay__name">
          {nameLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>

        {space.areaM2 !== undefined && <p className="overlay__area">{space.areaM2} M²</p>}

        {subtitleLines.length > 0 && (
          <ul className="overlay__subtitle">
            {subtitleLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}

        {space.status === "available" && (
          <p className="overlay__status">ESPACIO DISPONIBLE</p>
        )}

        {space.description && <p className="overlay__description">{space.description}</p>}

        {space.details && (
          <ul className="overlay__details">
            {space.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}

        {space.status === "coming-soon" && (
          <p className="overlay__soon">PRÓXIMAMENTE</p>
        )}

        {space.cta && (
          <div className="overlay__cta-row">
            {space.cta.targetSpaceId ? (
              <button
                type="button"
                className="overlay__cta"
                onClick={() => onNavigate(space.cta!.targetSpaceId!)}
              >
                {space.cta.label} ↗
              </button>
            ) : space.cta.href ? (
              <a className="overlay__cta" href={space.cta.href} target="_blank" rel="noreferrer">
                {space.cta.label} ↗
              </a>
            ) : (
              <span className="overlay__cta overlay__cta--soon">{space.cta.label} ↗</span>
            )}
          </div>
        )}
      </article>
    </div>
  )
}
