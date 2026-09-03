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
        MENU&nbsp;+
      </button>

      {open && (
        <div className="menu" role="dialog" aria-modal="true" aria-label="Índice de La Bor">
          <button
            type="button"
            className="menu__backdrop"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <nav className="menu__panel">
            <header className="menu__header">
              <p className="menu__title">ÍNDICE</p>
              <button
                type="button"
                className="menu__close"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>

            <p className="menu__section">RESIDENTES</p>
            <ul className="menu__list">
              {residents.map((s) => (
                <li key={s.id}>
                  <button type="button" className="menu__item" onClick={() => onTravel(s.id)}>
                    <span>{s.name}</span>
                    <span className="menu__item-meta">→</span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="menu__section">ESPACIOS DISPONIBLES</p>
            <ul className="menu__list">
              {available.map((s) => (
                <li key={s.id}>
                  <button type="button" className="menu__item" onClick={() => onTravel(s.id)}>
                    <span>{s.name}</span>
                    <span className="menu__item-meta">{s.areaM2} M² →</span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="menu__section">PROGRAMA</p>
            <ul className="menu__list">
              <li>
                <button type="button" className="menu__item" onClick={() => onTravel("talleres")}>
                  <span>TALLERES</span>
                  <span className="menu__item-meta">→</span>
                </button>
              </li>
              <li>
                <button type="button" className="menu__item" onClick={() => onTravel("eventos")}>
                  <span>EVENTOS</span>
                  <span className="menu__item-meta">→</span>
                </button>
              </li>
              <li>
                <button type="button" className="menu__item" onClick={() => onDirect("agenda")}>
                  <span>AGENDA</span>
                  <span className="menu__item-meta">→</span>
                </button>
              </li>
              <li>
                <button type="button" className="menu__item" onClick={() => onTravel("contacto")}>
                  <span>CONTACTO</span>
                  <span className="menu__item-meta">→</span>
                </button>
              </li>
            </ul>

            <p className="menu__foot">LA BOR — TALLERES · TULUM, QROO.</p>
          </nav>
        </div>
      )}
    </>
  )
}
