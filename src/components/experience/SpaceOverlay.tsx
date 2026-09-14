import { useEffect, useRef, useState } from "react"
import { calendarUrl, eventDateLabel, eventTimeLabel, nextEvent } from "../../data/events"
import { PRICE_LEGEND, USE_OPTIONS, eventProposalLink, fromPrice, infoLink, interestLink, interestMail, mxn, planLabel, rsvpLink, vendorLink, visitLink, waitlistLink, type UseOption } from "../../data/leads"
import { AVAILABLE, CONTACT, mailLink, spaceKindLabel, type RentPlan, type SpaceCta, type WorkshopSpace } from "../../data/spaces"

interface SpaceOverlayProps {
  space: WorkshopSpace
  onClose: () => void
  onNavigate: (id: string) => void
  onEnterScene: (sceneId: string) => void
  /** escena actual: se omite el CTA de entrar si ya estamos dentro */
  currentSceneId?: string
}

const isWa = (href: string) => href.startsWith("https://wa.me/")

function CtaLink({ href, label, primary = false }: { href: string; label: string; primary?: boolean }) {
  return (
    <a className={`overlay__cta${primary ? " overlay__cta--primary" : ""}${isWa(href) ? " overlay__cta--wa" : ""}`} href={href} target="_blank" rel="noreferrer">
      {label} ↗
    </a>
  )
}

/**
 * Ficha de un espacio disponible o reservado: plan y uso se eligen con
 * botones y cada CTA abre WhatsApp con el mensaje ya escrito. Sin
 * formularios. Los reservados se pueden recorrer y ofrecen lista de espera.
 */
function LeadPanel({ space }: { space: WorkshopSpace }) {
  const reserved = space.status === "reserved"
  const plans = space.plans ?? []
  const [plan, setPlan] = useState<RentPlan | null>(null)
  const [use, setUse] = useState<UseOption | null>(null)
  const others = AVAILABLE.filter((s) => s.status === "available" && s.id !== space.id)

  return (
    <div className="lead" data-status={space.status}>
      {plans.length > 0 && (
        <>
          <p className="lead__label">{reserved ? "PLANES DE REFERENCIA" : "ELIGE TU PLAN"}</p>
          <div className="lead__chips" role="group" aria-label="Plan de renta">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`lead__chip lead__chip--plan${plan?.id === p.id ? " is-selected" : ""}`}
                onClick={() => setPlan(plan?.id === p.id ? null : p)}
                aria-pressed={plan?.id === p.id}
                disabled={reserved}
              >
                <span className="lead__chip-price">{mxn(p.monthlyMxn)}</span>
                <span className="lead__chip-meta">MXN / MES · {p.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {plans.length === 0 && !reserved && <p className="lead__quote">RENTA A COTIZAR SEGÚN USO Y PLAZO</p>}

      {!reserved && (
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

      <div className="overlay__cta-row lead__ctas">
        {reserved ? (
          <>
            <CtaLink href={waitlistLink(space)} label="AVISARME SI SE LIBERA" primary />
            <CtaLink href={visitLink(space)} label="AGENDAR VISITA" />
            {others.length > 0 && (
              <CtaLink href={infoLink()} label={`VER ${others.length} DISPONIBLES`} />
            )}
          </>
        ) : (
          <>
            <CtaLink href={interestLink(space, plan, use)} label={plan ? `ME INTERESA · ${plan.label}` : "ME INTERESA"} primary />
            <CtaLink href={visitLink(space)} label="AGENDAR VISITA" />
            <CtaLink href={interestMail(space, plan, use)} label="PEDIR INFO POR CORREO" />
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
export function SpaceOverlay({ space, onClose, onNavigate, onEnterScene, currentSceneId }: SpaceOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [space.id])

  const kicker = space.number ? `${space.number} / ${spaceKindLabel(space)}` : spaceKindLabel(space)
  const nameLines = space.name.split(" ")
  const subtitleLines = space.subtitle?.split(" / ") ?? []
  const commercial = space.type === "available"
  const reserved = space.status === "reserved"
  const from = fromPrice(space)

  const renderCta = (cta: SpaceCta, primary: boolean) => {
    const cls = `overlay__cta${primary ? " overlay__cta--primary" : ""}`
    if (cta.enterSceneId) {
      if (cta.enterSceneId === currentSceneId) return null
      return (
        <button key={cta.label} type="button" className={cls} onClick={() => onEnterScene(cta.enterSceneId!)}>
          {cta.label} ↗
        </button>
      )
    }
    if (cta.targetSpaceId) {
      return (
        <button key={cta.label} type="button" className={cls} onClick={() => onNavigate(cta.targetSpaceId!)}>
          {cta.label} ↗
        </button>
      )
    }
    if (cta.href) return <CtaLink key={cta.label} href={cta.href} label={cta.label} primary={primary} />
    return (
      <span key={cta.label} className="overlay__cta overlay__cta--soon">
        {cta.label} ↗
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

        {commercial && !reserved && <p className="overlay__lead">ESTE ESPACIO PODRÍA SER TUYO…</p>}

        <h2 className="overlay__name">
          {nameLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>

        {space.areaM2 !== undefined && (
          <p className="overlay__area">
            {space.areaM2} M²
            {commercial && (
              <span className={`overlay__rent${reserved ? " overlay__rent--reserved" : ""}`}>
                {reserved ? "RESERVADO" : from ? `DESDE ${mxn(from)} MXN / MES` : "RENTA A COTIZAR"}
              </span>
            )}
          </p>
        )}

        {subtitleLines.length > 0 && (
          <ul className="overlay__subtitle">
            {subtitleLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}

        {commercial && (
          <p className={`overlay__status${reserved ? " overlay__status--reserved" : ""}`}>{reserved ? "RESERVADO · LISTA DE ESPERA" : "ESPACIO DISPONIBLE"}</p>
        )}

        {space.description && <p className="overlay__description">{space.description}</p>}

        {space.details && (
          <ul className="overlay__details">
            {space.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}

        {space.status === "coming-soon" && <p className="overlay__soon">PRÓXIMAMENTE</p>}

        {commercial && <LeadPanel space={space} />}
        {space.id === "eventos-board" && <EventCard />}
        {space.id === "info-totem" && <InfoPanel />}

        {(space.cta || space.cta2) && (
          <div className="overlay__cta-row">
            {space.cta && renderCta(space.cta, !commercial)}
            {space.cta2 && renderCta(space.cta2, false)}
          </div>
        )}
      </article>
    </div>
  )
}

/** etiqueta corta de plan para menús: "DESDE $8,000" */
export function planShort(plan: RentPlan): string {
  return planLabel(plan).split(" MXN")[0]
}
