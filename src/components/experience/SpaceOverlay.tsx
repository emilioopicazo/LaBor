import { useEffect, useRef, useState } from "react"
import { calendarUrl, eventDateLabel, eventTimeLabel, nextEvent } from "../../data/events"
import { PRICE_LEGEND, USE_OPTIONS, eventProposalLink, infoLink, instagramHandle, interestLink, interestMail, mapsLink, openingLink, rsvpLink, vendorLink, visitLink, waitlistLink, workshopInfoLink, type UseOption } from "../../data/leads"
import { AVAILABLE, CONTACT, OPENING_LABEL, mailLink, spaceKindLabel, type SpaceCta, type WorkshopSpace } from "../../data/spaces"

interface SpaceOverlayProps {
  space: WorkshopSpace
  onClose: () => void
  onNavigate: (id: string) => void
  onEnterScene: (sceneId: string) => void
  /** camina (viaje rápido) hasta la puerta de un espacio del patio */
  onTravel?: (spaceId: string) => void
  /** interior donde ya está parado el visitante: no se ofrece caminar hasta él */
  insideSpaceId?: string | null
  /** escena actual: se omite el CTA de entrar si ya estamos dentro */
  currentSceneId?: string
}

const isWa = (href: string) => href.startsWith("https://wa.me/")

function CtaLink({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return (
    <a className={`overlay__cta${primary ? " overlay__cta--primary" : ""}${isWa(href) ? " overlay__cta--wa" : ""}`} href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  )
}

/**
 * Ficha de un espacio: el uso se elige con botones y cada CTA abre
 * WhatsApp con el mensaje ya escrito. Sin formularios y SIN precios: la
 * renta se platica (es la razón para escribir).
 */
function LeadPanel({ space }: { space: WorkshopSpace }) {
  const reserved = space.status === "reserved"
  const soon = space.status === "coming-soon"
  const locked = reserved || soon
  const [use, setUse] = useState<UseOption | null>(null)
  const others = AVAILABLE.filter((s) => s.status === "available" && s.id !== space.id)

  return (
    <div className="lead" data-status={space.status}>
      {!locked && (
        <>
          <p className="lead__label">¿PARA QUÉ LO USARÍAS?</p>
          <div className="lead__chips lead__chips--uses" role="group" aria-label="Uso">
            {USE_OPTIONS.map((u) => (
              <button key={u} type="button" className={`lead__chip${use === u ? " is-selected" : ""}`} onClick={() => setUse(use === u ? null : u)} aria-pressed={use === u}>
                {u}
              </button>
            ))}
          </div>
        </>
      )}

      {space.includes && (
        <ul className="overlay__details lead__includes">
          {space.includes.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}

      {/* el CTA principal se queda a la mano mientras la hoja hace scroll; los secundarios van en flujo */}
      <div className="overlay__cta-row lead__ctas lead__ctas--primary">
        {soon ? (
          <CtaLink href={openingLink(space)} label="AVISARME CUANDO ABRA" primary />
        ) : reserved ? (
          <CtaLink href={waitlistLink(space)} label="AVISARME SI SE LIBERA" primary />
        ) : (
          <CtaLink href={interestLink(space, use)} label="ME INTERESA" primary />
        )}
      </div>
      <div className="overlay__cta-row lead__ctas lead__ctas--more">
        {soon ? (
          <>
            <CtaLink href={visitLink(space)} label="AGENDAR VISITA A LA OBRA" />
            {others.length > 0 && <CtaLink href={infoLink()} label={`VER ${others.length} DISPONIBLES HOY`} />}
          </>
        ) : reserved ? (
          <>
            <CtaLink href={visitLink(space)} label="AGENDAR VISITA" />
            {others.length > 0 && <CtaLink href={infoLink()} label={`VER ${others.length} DISPONIBLES`} />}
          </>
        ) : (
          <>
            <CtaLink href={visitLink(space)} label="AGENDAR VISITA" />
            <CtaLink href={interestMail(space, use)} label="PEDIR INFO POR CORREO" />
          </>
        )}
      </div>
      <p className="lead__legend">{PRICE_LEGEND}</p>
    </div>
  )
}

/** Próximo evento del patio con sus botones (voy / stand / calendario). */
function EventCard() {
  const ev = nextEvent()
  if (!ev) {
    return (
      <div className="event">
        <p className="overlay__description">Sin fecha anunciada. Si quieres proponer un evento, escríbenos.</p>
        <div className="overlay__cta-row">
          <CtaLink href={eventProposalLink()} label="PROPONER UN EVENTO" primary />
        </div>
      </div>
    )
  }
  return (
    <div className="event">
      <p className="event__kicker">PRÓXIMO · {ev.kind}</p>
      <p className="event__name">{ev.name}</p>
      <p className="event__when">
        <span>{eventDateLabel(ev)}</span>
        <span>{eventTimeLabel(ev)}</span>
      </p>
      <p className="event__place">{ev.place}</p>
      <p className="overlay__description">{ev.description}</p>
      <div className="overlay__cta-row">
        <CtaLink href={rsvpLink(ev)} label="VOY · AVISAR POR WHATSAPP" primary />
        <CtaLink href={vendorLink(ev)} label="QUIERO PONER UN STAND" />
        <CtaLink href={calendarUrl(ev)} label="AGREGAR AL CALENDARIO" />
        <CtaLink href={eventProposalLink()} label="PROPONER OTRO EVENTO" />
      </div>
    </div>
  )
}

/** Tótem de información: los cuatro caminos a una conversación. */
function InfoPanel() {
  const ev = nextEvent()
  return (
    <div className="lead">
      <div className="overlay__cta-row lead__ctas">
        <CtaLink href={infoLink()} label="QUIERO UN ESPACIO" primary />
        <CtaLink href={visitLink(null)} label="AGENDAR VISITA" />
        {ev && <CtaLink href={rsvpLink(ev)} label={`${ev.kind} ${ev.name} · ${eventDateLabel(ev).slice(0, 3)} ${ev.date.slice(8)}`} />}
        <CtaLink href={mailLink("Información La Bor — espacios disponibles")} label="ESCRIBIR POR CORREO" />
        <CtaLink href={mapsLink()} label="CÓMO LLEGAR · GOOGLE MAPS" />
      </div>
      <p className="lead__legend">
        WhatsApp {CONTACT.phoneDisplay} · {CONTACT.email}
      </p>
    </div>
  )
}

/**
 * Overlay editorial de un espacio. No navega a otra ruta: se abre
 * sobre el mundo, que permanece visible detrás. Cierra con ×, ESC
 * o clic en el fondo.
 */
export function SpaceOverlay({ space, onClose, onNavigate, onEnterScene, onTravel, insideSpaceId = null, currentSceneId }: SpaceOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [space.id])

  const kicker = space.number ? `${space.number} / ${spaceKindLabel(space)}` : spaceKindLabel(space)
  const nameLines = space.name.split(" ")
  const subtitleLines = space.subtitle?.split(" / ") ?? []
  const commercial = space.type === "available"
  const reserved = space.status === "reserved"
  const soon = space.status === "coming-soon"
  // escasez real por familia: pabellones (disponibles / reservados / en obra) y naves
  const pabs = AVAILABLE.filter((s) => s.id.startsWith("pabellon"))
  const pabsOpen = pabs.filter((s) => s.status === "available").length
  const pabsReserved = pabs.filter((s) => s.status === "reserved").length
  const pabsSoon = pabs.filter((s) => s.status === "coming-soon").length
  const navesOpen = AVAILABLE.filter((s) => s.id.startsWith("nave") && s.status === "available").length
  const pabsTail = [pabsReserved ? `${pabsReserved} RESERVADO${pabsReserved > 1 ? "S" : ""}` : "", pabsSoon ? `${pabsSoon} EN OBRA` : ""].filter(Boolean).join(" · ")
  const scarcity = space.id.startsWith("nave")
    ? `QUEDAN ${navesOpen} MÓDULOS DE NAVE · ${pabsOpen} PABELLONES DISPONIBLES`
    : `QUEDAN ${pabsOpen} PABELLONES DE ${pabs.length}${pabsTail ? ` · ${pabsTail}` : ""}`

  const renderCta = (cta: SpaceCta, primary: boolean) => {
    const cls = `overlay__cta${primary ? " overlay__cta--primary" : ""}`
    if (cta.enterSceneId) {
      if (cta.enterSceneId === currentSceneId) return null
      return (
        <button key={cta.label} type="button" className={cls} onClick={() => onEnterScene(cta.enterSceneId!)}>
          {cta.label}
        </button>
      )
    }
    if (cta.targetSpaceId) {
      return (
        <button key={cta.label} type="button" className={cls} onClick={() => onNavigate(cta.targetSpaceId!)}>
          {cta.label}
        </button>
      )
    }
    if (cta.travelTo) {
      if (!onTravel || currentSceneId !== "overworld" || insideSpaceId === cta.travelTo) return null
      return (
        <button key={cta.label} type="button" className={cls} onClick={() => onTravel(cta.travelTo!)}>
          {cta.label}
        </button>
      )
    }
    if (cta.href) return <CtaLink key={cta.label} href={cta.href} label={cta.label} primary={primary} />
    return (
      <span key={cta.label} className="overlay__cta overlay__cta--soon">
        {cta.label}
      </span>
    )
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={space.name}>
      <button type="button" className="overlay__backdrop" aria-label="Cerrar" onClick={onClose} />
      <article className="overlay__panel">
        <header className="overlay__header">
          <p className="overlay__kicker">{kicker}</p>
          <button ref={closeRef} type="button" className="overlay__close" onClick={onClose} aria-label="Cerrar">
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

        {commercial && (
          <>
            <p key={space.id} className={`overlay__status${reserved ? " overlay__status--reserved" : soon ? " overlay__status--soon" : " overlay__status--open"}`}>
              {reserved ? "RESERVADO · LISTA DE ESPERA" : soon ? `EN OBRA · ${OPENING_LABEL}` : "ESPACIO DISPONIBLE"}
            </p>
            <p className="overlay__scarcity">{scarcity}</p>
          </>
        )}

        {space.description && <p className="overlay__description">{space.description}</p>}

        {space.details && (
          <ul className="overlay__details">
            {space.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}

        {commercial && <LeadPanel space={space} />}
        {space.id === "eventos-board" && <EventCard />}
        {space.id === "info-totem" && <InfoPanel />}

        {(space.cta || space.cta2 || space.contact) && (
          <div className="overlay__cta-row">
            {space.cta && renderCta(space.cta, !commercial)}
            {space.contact && workshopInfoLink(space) && <CtaLink href={workshopInfoLink(space)!} label={`WHATSAPP · ${space.contact.name.toUpperCase()}`} />}
            {space.contact?.instagram && <CtaLink href={space.contact.instagram} label={`INSTAGRAM · ${instagramHandle(space.contact.instagram)}`} />}
            {space.cta2 && renderCta(space.cta2, false)}
            {space.contact?.maps && <CtaLink href={space.contact.maps} label="VER EN GOOGLE MAPS" />}
          </div>
        )}
      </article>
    </div>
  )
}

