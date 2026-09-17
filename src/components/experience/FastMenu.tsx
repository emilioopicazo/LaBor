import { AVAILABLE, CONTACT, RESIDENTS, mailLink, whatsappLink } from "../../data/spaces"
import { eventShortLabel, nextEvent } from "../../data/events"
import { fromPrice, mapsLink, mxn } from "../../data/leads"
import { PIEZA_CENTRAL } from "../../data/missions"
import { UNLOCK_MISSION_ID } from "../../data/music"
import { currentTrack, music, useMusic } from "../../game/audio"
import { missionView, useMissionRun } from "../../game/mission"
import { useProfile } from "../../game/profile"

interface FastMenuProps {
  open: boolean
  setOpen: (open: boolean) => void
  /** Fast travel: camina rápido hasta la puerta del espacio */
  onTravel: (id: string) => void
  /** Abre un overlay directo (misión, anuncio, agenda) */
  onDirect: (id: string) => void
  onChangeAvatar: () => void
}

/**
 * Menú como hoja inferior (patrón de iOS): agarradera, título, listas
 * agrupadas con separadores insertados y chevrón, filas de 52 pt, zonas
 * seguras. Es el índice de viaje rápido + misión + personaje + contacto;
 * no sustituye al mundo, lo ataja.
 */
export function FastMenu({ open, setOpen, onTravel, onDirect, onChangeAvatar }: FastMenuProps) {
  const run = useMissionRun()
  const view = missionView(run)
  const audio = useMusic()
  const track = currentTrack()
  const playing = audio.enabled && audio.playing
  const prof = useProfile()
  // la pista se desbloquea al terminar LA HORA (queda en el perfil)
  const unlocked = (prof.completed[UNLOCK_MISSION_ID] ?? 0) > 0 || run?.completed === true
  const ev = nextEvent()

  const Item = ({ id, label, meta, direct, reserved }: { id: string; label: string; meta?: string; direct?: boolean; reserved?: boolean }) => {
    const visited = prof.visited.includes(id)
    return (
      <li>
        <button type="button" className={`menu__item${visited ? " is-visited" : ""}`} onClick={() => (direct ? onDirect(id) : onTravel(id))}>
          <span className="menu__item-label">
            {visited && (
              <span className="menu__check" aria-label="Visitado">
                ✓
              </span>
            )}
            {label}
          </span>
          {meta && <span className={`menu__item-meta${reserved ? " menu__item-meta--reserved" : ""}`}>{meta}</span>}
        </button>
      </li>
    )
  }

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
        aria-haspopup="dialog"
      >
        MENÚ
      </button>

      {open && (
        <div className="menu" role="dialog" aria-modal="true" aria-label="Menú de La Bor">
          <button type="button" className="menu__backdrop" aria-label="Cerrar menú" onClick={() => setOpen(false)} />
          <nav className="menu__panel">
            <div className="menu__grabber" aria-hidden="true" />
            <header className="menu__header">
              <p className="menu__title">ÍNDICE</p>
              <button type="button" className="menu__close" onClick={() => setOpen(false)} aria-label="Cerrar">
                ×
              </button>
            </header>

            {ev && (
              <>
                <p className="menu__section">PRÓXIMO EN EL PATIO</p>
                <ul className="menu__list">
                  <li>
                    <button type="button" className="menu__item menu__item--event" onClick={() => onDirect("eventos-board")}>
                      <span className="menu__item-label">
                        {ev.kind} · {ev.name}
                      </span>
                      <span className="menu__item-meta">{eventShortLabel(ev)}</span>
                    </button>
                  </li>
                </ul>
              </>
            )}

            <p className="menu__section">MISIÓN</p>
            <ul className="menu__list">
              <Item id="pieza-central" label={PIEZA_CENTRAL.title} meta={view ? (view.complete ? "COMPLETA" : view.progress) : "INICIAR"} direct />
            </ul>

            <p className="menu__section">TALLERES</p>
            <ul className="menu__list">
              {RESIDENTS.map((s) => (
                <Item key={s.id} id={s.id} label={s.name} meta={s.subtitle?.split(" / ")[0]} />
              ))}
            </ul>

            <p className="menu__section">ESPACIOS DISPONIBLES</p>
            <ul className="menu__list">
              {AVAILABLE.map((s) => {
                const from = fromPrice(s)
                const meta = s.status === "reserved" ? `${s.areaM2} M² · RESERVADO` : from ? `${s.areaM2} M² · DESDE ${mxn(from)}` : `${s.areaM2} M² · COTIZAR`
                return <Item key={s.id} id={s.id} label={s.name} meta={meta} reserved={s.status === "reserved"} />
              })}
            </ul>

            <p className="menu__section">PATIO</p>
            <ul className="menu__list">
              <Item id="eventos-board" label="EVENTOS" meta="LETRERO" />
              <Item id="info-totem" label="INFORMACIÓN" meta="TÓTEM" />
              <Item id="agenda" label="AGENDA" direct />
            </ul>

            <p className="menu__section">MÚSICA</p>
            <div className={`menu__list menu__music${unlocked ? "" : " is-locked"}`}>
              <button
                type="button"
                className={`menu__music-toggle${playing ? " is-playing" : ""}`}
                onClick={() => music.toggle()}
                disabled={!unlocked}
                aria-label={!unlocked ? "Pista bloqueada" : playing ? "Pausar música" : "Reproducir música"}
                aria-pressed={playing}
              >
                <span className={`menu__music-icon ${!unlocked ? "is-locked" : playing ? "is-pause" : "is-play"}`} aria-hidden="true" />
              </button>
              <span className="menu__music-text">
                <span className="menu__music-title">{unlocked ? track.title : "PISTA DE LA PIEZA"}</span>
                <span className="menu__music-meta">
                  {!unlocked
                    ? "SE DESBLOQUEA AL TERMINAR LA HORA"
                    : `${track.artist} · ${playing ? "SONANDO · VOLUMEN AMBIENTE" : audio.unsupported ? "NO DISPONIBLE EN ESTE NAVEGADOR" : audio.blocked ? "TOCA PARA ESCUCHAR" : "EN PAUSA"}`}
                </span>
              </span>
            </div>

            <p className="menu__section">PERSONAJE</p>
            <ul className="menu__list">
              <li>
                <button type="button" className="menu__item" onClick={onChangeAvatar}>
                  <span className="menu__item-label">CAMBIAR PERSONAJE</span>
                </button>
              </li>
            </ul>

            <p className="menu__section">CONTACTO</p>
            <ul className="menu__list menu__list--links">
              <li>
                <a className="menu__item" href={whatsappLink("Hola La Bor, quiero información sobre los espacios disponibles.")} target="_blank" rel="noreferrer">
                  <span className="menu__item-label">WHATSAPP</span>
                  <span className="menu__item-meta">{CONTACT.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a className="menu__item" href={mapsLink()} target="_blank" rel="noreferrer">
                  <span className="menu__item-label">CÓMO LLEGAR</span>
                  <span className="menu__item-meta">GOOGLE MAPS</span>
                </a>
              </li>
              <li>
                <a className="menu__item" href={mailLink("Información La Bor")}>
                  <span className="menu__item-label">EMAIL</span>
                  <span className="menu__item-meta">{CONTACT.email}</span>
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
