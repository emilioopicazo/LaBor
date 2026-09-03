import type { RefObject } from "react"
import type { WorkshopSpace } from "../../data/spaces"

interface HotspotLabelProps {
  space: WorkshopSpace
  labelRef: RefObject<HTMLDivElement>
  onOpen: (id: string) => void
}

/**
 * Etiqueta editorial que aparece al acercarse a un hotspot.
 * El motor la posiciona en pantalla cada frame (ref), por lo que
 * aquí solo vive el contenido.
 */
export function HotspotLabel({ space, labelRef, onOpen }: HotspotLabelProps) {
  const action = space.type === "available" ? "DISPONIBLE" : "VER"
  return (
    <div ref={labelRef} className="hotspot-label">
      <button
        type="button"
        className="hotspot-label__button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onOpen(space.id)
        }}
      >
        <span className="hotspot-label__name">{space.name}</span>
        <span className="hotspot-label__action">{action} ↗</span>
      </button>
    </div>
  )
}
