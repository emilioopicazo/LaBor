import { useMemo } from "react"

interface WorldHUDProps {
  hasMoved: boolean
  oficio: number
  sceneName: string | null
  onReset: () => void
}

/**
 * Identidad persistente mínima + guía de primer uso + oficio.
 * El sello LA BOR regresa al visitante al patio.
 */
export function WorldHUD({ hasMoved, oficio, sceneName, onReset }: WorldHUDProps) {
  const isTouch = useMemo(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches, [])

  return (
    <>
      <div className="hud__scrim" aria-hidden="true" />
      <button
        type="button"
        className="hud__brand"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onReset()
        }}
        title="Volver al patio"
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

      {!hasMoved && <p className="hud__hint">{isTouch ? "TOCA EL PISO PARA CAMINAR" : "CLICK PARA CAMINAR"}</p>}

      <p className="hud__orientation">MEJOR EN HORIZONTAL</p>
    </>
  )
}
