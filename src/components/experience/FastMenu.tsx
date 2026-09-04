import { SPACES } from "../../data/spaces"

interface FastMenuProps {
  open: boolean
  setOpen: (open: boolean) => void
  /** Fast travel: camina rápido hasta el espacio y abre su overlay */
  onTravel: (id: string) => void
  /** Abre un overlay sin posición física (AGENDA) */
  onDirect: (id: string) => void
}

/**
 * Menú de respaldo (accesibilidad / usuarios impacientes).
 * No es un navbar: es un índice de viaje rápido que conserva la
 * metáfora espacial — al elegir un espacio, el visitante camina
 * hasta él y su overlay se abre al llegar.
 */
export function FastMenu({ open, setOpen, onTravel, onDirect }: FastMenuProps) {
  const residents = SPACES.filter((s) => s.type === "resident")
  const available = SPACES.filter((s) => s.type === "available")

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

            <p className="menu__section">RESIDENTES</p>
            <ul className="menu__list">
              {residents.map((s) => (
                <Item key={s.id} id={s.id} label={s.name} />
              ))}
            </ul>

            <p className="menu__section">ESPACIOS DISPONIBLES</p>
            <ul className="menu__list">
              {available.map((s) => (
                <Item key={s.id} id={s.id} label={s.name} meta={`${s.areaM2} M²`} />
              ))}
            </ul>

            <p className="menu__section">PATIO</p>
            <ul className="menu__list">
              <Item id="pieza" label="LA PIEZA CENTRAL" />
              <Item id="eventos" label="EVENTOS" />
              <Item id="agenda" label="AGENDA" direct />
              <Item id="contacto" label="CONTACTO" />
            </ul>

            <p className="menu__foot">LA BOR — TALLERES · TULUM, QROO.</p>
          </nav>
        </div>
      )}
    </>
  )
}
