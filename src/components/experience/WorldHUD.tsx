interface WorldHUDProps {
  hasMoved: boolean
  oficio: number
  sceneName: string | null
  coarse: boolean
  onReset: () => void
}

/**
 * Identidad persistente mínima + guía de primer uso + oficio.
 * El sello LA BOR regresa al visitante al portón.
 */
export function WorldHUD({ hasMoved, oficio, sceneName, coarse, onReset }: WorldHUDProps) {
  return (
    <>
      <div className="hud__scrim" aria-hidden="true" />
      <button
        type="button"
        className="hud__brand"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onReset()
        }}
        title="Volver al portón"
      >
        <span className="hud__brand-name">LA BOR</span>
        <span className="hud__brand-sub">TALLERES · TULUM</span>
        {sceneName && <span className="hud__brand-scene">{sceneName}</span>}
      </button>

      {oficio > 0 && (
        <p className="hud__oficio">
          <span className="hud__oficio-label">OFICIO</span>
          <span className="hud__oficio-value">{oficio}</span>
        </p>
      )}

      {!hasMoved && (
        <p className="hud__hint">
          {coarse ? "TOCA EL PISO O ARRASTRA PARA CAMINAR" : "CLICK PARA CAMINAR · WASD / FLECHAS"}
        </p>
      )}

      <p className="hud__orientation">MEJOR EN HORIZONTAL</p>
    </>
  )
}
