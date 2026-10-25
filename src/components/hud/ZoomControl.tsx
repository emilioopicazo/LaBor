import { USER_ZOOM_STEPS } from "../../game/phaser/config"

interface ZoomControlProps {
  /** multiplicador actual sobre el zoom base */
  level: number
  onChange: (level: number) => void
}

/**
 * Acercar / alejar (control segmentado vertical, 44 pt por botón, a la
 * derecha sobre el botón de acción). Pasos fijos; el pellizco con dos
 * dedos y la rueda del ratón también mueven el zoom.
 */
export function ZoomControl({ level, onChange }: ZoomControlProps) {
  const idx = nearestStep(level)
  const canIn = idx < USER_ZOOM_STEPS.length - 1
  const canOut = idx > 0
  return (
    <div className="zoom" role="group" aria-label="Zoom">
      <button type="button" className="zoom__button" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); if (canIn) onChange(USER_ZOOM_STEPS[idx + 1]) }} disabled={!canIn} aria-label="Acercar">
        <span aria-hidden="true">+</span>
      </button>
      <span className="zoom__level" aria-live="polite">{Math.round(level * 100)}%</span>
      <button type="button" className="zoom__button" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); if (canOut) onChange(USER_ZOOM_STEPS[idx - 1]) }} disabled={!canOut} aria-label="Alejar">
        <span aria-hidden="true">−</span>
      </button>
    </div>
  )
}

function nearestStep(level: number): number {
  let best = 0
  USER_ZOOM_STEPS.forEach((s, i) => {
    if (Math.abs(s - level) < Math.abs(USER_ZOOM_STEPS[best] - level)) best = i
  })
  return best
}
