import { useMemo } from "react"

interface WorldHUDProps {
  hasMoved: boolean
  onReset: () => void
}

/**
 * Identidad persistente mínima + guía de primer uso.
 * El sello LA BOR regresa al visitante al punto de llegada.
 */
export function WorldHUD({ hasMoved, onReset }: WorldHUDProps) {
  const isTouch = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    [],
  )

  return (
    <>
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
        <span className="hud__brand-sub">TALLERES</span>
        <span className="hud__brand-place">TULUM</span>
      </button>

      {!hasMoved && (
        <p className="hud__hint">{isTouch ? "TOCA PARA EXPLORAR" : "CLICK PARA CAMINAR"}</p>
      )}

      <p className="hud__orientation">MEJOR EN HORIZONTAL</p>
    </>
  )
}
