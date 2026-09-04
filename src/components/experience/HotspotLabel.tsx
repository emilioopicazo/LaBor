import type { RefObject } from "react"

interface HotspotLabelProps {
  name: string
  action: string
  labelRef: RefObject<HTMLDivElement>
  onOpen: () => void
}

/**
 * Etiqueta editorial que aparece al acercarse a un punto de interés
 * (espacio, estación o salida). El motor la posiciona en pantalla
 * cada frame (ref), por lo que aquí solo vive el contenido.
 */
export function HotspotLabel({ name, action, labelRef, onOpen }: HotspotLabelProps) {
  return (
    <div ref={labelRef} className="hotspot-label">
      <button
        type="button"
        className="hotspot-label__button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onOpen()
        }}
      >
        <span className="hotspot-label__name">{name}</span>
        <span className="hotspot-label__action">{action} ↗</span>
      </button>
    </div>
  )
}
