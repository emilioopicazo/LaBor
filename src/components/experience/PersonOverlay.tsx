import { AVATARS } from "../../data/avatars"
import { callLink, workshopInfoLink, workshopInfoMessage } from "../../data/leads"
import type { WorkshopSpace } from "../../data/spaces"
import { AvatarSprite } from "./AvatarSprite"

interface PersonOverlayProps {
  space: WorkshopSpace
  onClose: () => void
  onViewSpace: (id: string) => void
}

/**
 * La persona del taller: al hablarle, WhatsApp directo a su número con el
 * mensaje ya escrito ("me interesa más información sobre el taller de
 * carpintería VETA"), llamada y ficha del espacio. Sin formularios.
 */
export function PersonOverlay({ space, onClose, onViewSpace }: PersonOverlayProps) {
  const c = space.contact
  if (!c) return null
  const avatar = AVATARS.find((a) => a.id === c.avatarId) ?? AVATARS[0]
  const wa = workshopInfoLink(space)
  const message = workshopInfoMessage(space)
  const short = space.shortName ?? space.name
  return (
    <div className="overlay person" role="dialog" aria-modal="true" aria-label={`${c.name} · ${space.name}`}>
      <button type="button" className="overlay__backdrop" aria-label="Cerrar" onClick={onClose} />
      <article className="overlay__panel person__panel">
        <header className="overlay__header">
          <p className="overlay__kicker">
            {short} · {c.craft.toUpperCase()}
          </p>
          <button type="button" className="overlay__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <div className="person__hero">
          <span className="person__figure">
            <AvatarSprite avatar={avatar} scale={4} />
          </span>
          <div className="person__id">
            <h2 className="overlay__name person__name">
              <span>{c.name.toUpperCase()}</span>
            </h2>
            <p className="person__role">{c.role}</p>
          </div>
        </div>

        <p className="overlay__description">{c.blurb}</p>
        {message && <p className="person__preview">“{message}”</p>}

        <div className="overlay__cta-row">
          {wa && (
            <a className="overlay__cta overlay__cta--primary overlay__cta--wa" href={wa} target="_blank" rel="noreferrer">
              ESCRIBIR A {c.name.toUpperCase()} POR WHATSAPP
            </a>
          )}
          <a className="overlay__cta" href={callLink(c.phoneWa)}>
            LLAMAR · {c.phoneDisplay}
          </a>
          <button type="button" className="overlay__cta overlay__cta--plain" onClick={() => onViewSpace(space.id)}>
            VER FICHA DE {short}
          </button>
        </div>
        <p className="lead__legend">Te responde por WhatsApp. Si no contesta al momento, deja el mensaje: es un taller y están trabajando.</p>
      </article>
    </div>
  )
}
