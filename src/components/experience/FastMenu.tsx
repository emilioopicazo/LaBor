import { AVAILABLE, CONTACT, RESIDENTS, mailLink, whatsappLink } from "../../data/spaces"
import { PIEZA_CENTRAL } from "../../data/missions"
import { missionView, useMissionRun } from "../../game/mission"

interface FastMenuProps {
  open: boolean
  setOpen: (open: boolean) => void
  /** Fast travel: camina rápido hasta la puerta del espacio */
  onTravel: (id: string) => void
  /** Abre un overlay directo (misión, agenda, contacto) */
  onDirect: (id: string) => void
  onChangeAvatar: () => void
}

/**
 * Menú (arriba-derecha): índice de viaje rápido + misión + personaje +
 * contacto. Respaldo para quien no quiere caminar; no sustituye al mundo.
 */
export function FastMenu({ open, setOpen, onTravel, onDirect, onChangeAvatar }: FastMenuProps) {
  const run = useMissionRun()
  const view = missionView(run)

  const Item = ({ id, label, meta, direct }: { id: string; label: string; meta?: string; direct?: boolean }) => (
    <li>
      <button type="button" className="menu__item" onClick={() => (direct ? onDirect(id) : onTravel(id))}>
        <span>{label}</span>
        <span className="menu__item-meta">{meta ? `${meta} →` : "→"}</span>
      </button>
    </li>
  )

  return (
    <>
      <button
        type="button"
        className="hud__menu-button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        aria-expanded={open}
      >
        MENÚ&nbsp;+
      </button>

      {open && (
        <div className="menu" role="dialog" aria-modal="true" aria-label="Índice de La Bor">
          <button type="button" className="menu__backdrop" aria-label="Cerrar menú" onClick={() => setOpen(false)} />
          <nav className="menu__panel">
            <header className="menu__header">
              <p className="menu__title">ÍNDICE</p>
              <button type="button" className="menu__close" onClick={() => setOpen(false)} aria-label="Cerrar">
                ×
              </button>
            </header>

            <p className="menu__section">MISIÓN</p>
            <ul className="menu__list">
              <Item id="pieza-central" label={PIEZA_CENTRAL.title} meta={view ? (view.complete ? "COMPLETA" : view.progress) : "INICIAR"} direct />
            </ul>

            <p className="menu__section">RESIDENTES</p>
            <ul className="menu__list">
              {RESIDENTS.map((s) => (
                <Item key={s.id} id={s.id} label={s.name} />
              ))}
            </ul>

            <p className="menu__section">ESPACIOS DISPONIBLES</p>
            <ul className="menu__list">
              {AVAILABLE.map((s) => (
                <Item key={s.id} id={s.id} label={s.name} meta={`${s.areaM2} M² · ${s.rentMxn ? `$${(s.rentMxn / 1000).toFixed(0)}K` : "COTIZAR"}`} />
              ))}
            </ul>

            <p className="menu__section">PATIO</p>
            <ul className="menu__list">
              <Item id="eventos-board" label="EVENTOS" />
              <Item id="info-totem" label="INFORMACIÓN" />
              <Item id="agenda" label="AGENDA" direct />
            </ul>

            <p className="menu__section">PERSONAJE</p>
            <ul className="menu__list">
              <li>
                <button type="button" className="menu__item" onClick={onChangeAvatar}>
                  <span>CAMBIAR PERSONAJE</span>
                  <span className="menu__item-meta">→</span>
                </button>
              </li>
            </ul>

            <p className="menu__section">CONTACTO</p>
            <ul className="menu__list menu__list--links">
              <li>
                <a className="menu__item" href={whatsappLink("Hola La Bor, quiero información sobre los espacios disponibles.")} target="_blank" rel="noreferrer">
                  <span>WHATSAPP</span>
                  <span className="menu__item-meta">{CONTACT.phoneDisplay} ↗</span>
                </a>
              </li>
              <li>
                <a className="menu__item" href={mailLink("Información La Bor")}>
                  <span>EMAIL</span>
                  <span className="menu__item-meta">{CONTACT.email} ↗</span>
                </a>
              </li>
            </ul>

            <p className="menu__foot">LA BOR — TALLERES · TULUM, QROO.</p>
          </nav>
        </div>
      )}
    </>
  )
}
