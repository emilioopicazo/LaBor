import { calendarUrl, eventDateLabel, eventRelativeLabel, eventTimeLabel, nextEvent } from "../../data/events"
import { eventProposalLink, mapsLink, rsvpLink, vendorLink } from "../../data/leads"
import { CONTACT } from "../../data/spaces"

interface EventPopupProps {
  onClose: () => void
}

/**
 * Anuncio del próximo evento como pop-up: el cartel completo y los CTAs
 * que mandan a WhatsApp ya con el mensaje escrito (ir, poner stand) o al
 * calendario. Se abre desde el letrero del patio y desde el menú.
 */
export function EventPopup({ onClose }: EventPopupProps) {
  const ev = nextEvent()
  return (
    <div className="popup" role="dialog" aria-modal="true" aria-label={ev ? `${ev.kind} ${ev.name}` : "Eventos"}>
      <button type="button" className="popup__backdrop" onClick={onClose} aria-label="Cerrar" />
      <div className="popup__card">
        <button type="button" className="overlay__close popup__close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        {ev ? (
          <>
            {ev.poster && <img className="popup__poster" src={ev.poster} alt={`Cartel ${ev.kind} ${ev.name}`} />}
            <div className="popup__body">
              <p className="popup__kicker">
                {eventRelativeLabel(ev)} · {ev.kind}
              </p>
              <p className="popup__when">
                {eventDateLabel(ev)} · {eventTimeLabel(ev)}
              </p>
              <p className="popup__place">{ev.place}</p>
              {ev.lineup && <p className="popup__lineup">{ev.lineup}</p>}
              <div className="popup__ctas">
                <a className="overlay__cta overlay__cta--primary overlay__cta--wa" href={rsvpLink(ev)} target="_blank" rel="noreferrer">
                  VOY · CONFIRMAR POR WHATSAPP
                </a>
                <a className="overlay__cta" href={calendarUrl(ev)} target="_blank" rel="noreferrer">
                  AGREGAR AL CALENDARIO
                </a>
                <a className="overlay__cta" href={vendorLink(ev)} target="_blank" rel="noreferrer">
                  QUIERO PONER UN STAND
                </a>
                <a className="overlay__cta overlay__cta--plain" href={mapsLink()} target="_blank" rel="noreferrer">
                  CÓMO LLEGAR · GOOGLE MAPS
                </a>
              </div>
              <p className="popup__legend">Entrada libre · Dudas por WhatsApp {CONTACT.phoneDisplay}</p>
            </div>
          </>
        ) : (
          <div className="popup__body">
            <p className="popup__kicker">EVENTOS</p>
            <p className="popup__when">Sin fecha anunciada</p>
            <p className="popup__place">Si quieres proponer un evento en el patio, escríbenos.</p>
            <div className="popup__ctas">
              <a className="overlay__cta overlay__cta--primary overlay__cta--wa" href={eventProposalLink()} target="_blank" rel="noreferrer">
                PROPONER UN EVENTO
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
