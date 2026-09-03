import { LOCATION } from "../../config/world"

interface EntranceProps {
  opening: boolean
  onEnter: () => void
}

/**
 * Pantalla de llegada: el visitante está parado afuera.
 * Al presionar ENTRAR, los dos portones industriales se abren
 * y revelan el patio (la transición vive en CSS).
 */
export function Entrance({ opening, onEnter }: EntranceProps) {
  return (
    <div className={`entrance${opening ? " entrance--opening" : ""}`} aria-hidden={opening}>
      <div className="entrance__panel entrance__panel--left" />
      <div className="entrance__panel entrance__panel--right" />
      <div className="entrance__seam" />

      <div className="entrance__content">
        <p className="entrance__kicker">TALLERES</p>
        <h1 className="entrance__title">
          LA&nbsp;BOR
        </h1>
        <button
          type="button"
          className="entrance__button"
          onClick={onEnter}
          disabled={opening}
        >
          ENTRAR
        </button>
        <p className="entrance__place">TULUM, QROO.</p>
      </div>

      <p className="entrance__coords">
        {LOCATION.lat.toFixed(7)}, {LOCATION.lng.toFixed(7)}
      </p>
    </div>
  )
}
