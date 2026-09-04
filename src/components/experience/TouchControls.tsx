import type { RefObject } from "react"

interface TouchControlsProps {
  ringRef: RefObject<HTMLDivElement>
  knobRef: RefObject<HTMLDivElement>
  onEnter: () => void
  visible: boolean
}

/**
 * Controles táctiles (sistema de diseño §4): arrastrar en cualquier
 * parte del piso levanta un stick flotante centrado donde cayó el
 * dedo; el botón ENTRAR va al espacio más cercano. Tocar el piso
 * sigue caminando hasta ahí. El motor posiciona el anillo y la
 * perilla por refs (sin re-render).
 */
export function TouchControls({ ringRef, knobRef, onEnter, visible }: TouchControlsProps) {
  return (
    <>
      <div ref={ringRef} className="stick" aria-hidden="true">
        <div ref={knobRef} className="stick__knob" />
      </div>
      {visible && (
        <div className="touch-enter">
          <button
            type="button"
            className="touch-enter__button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onEnter()
            }}
          >
            ENTRAR
          </button>
          <span className="touch-enter__caption">ESPACIO MÁS CERCANO</span>
        </div>
      )}
    </>
  )
}
