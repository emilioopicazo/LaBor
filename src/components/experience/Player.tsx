import type { RefObject } from "react"
import { PLAYER_SPRITE_SCALE } from "../../config/world"
import { ASSETS } from "../../data/assets"

interface PlayerProps {
  playerRef: RefObject<SVGGElement>
  figureRef: RefObject<SVGGElement>
}

const W = ASSETS.visitorIdle.w * PLAYER_SPRITE_SCALE
const H = ASSETS.visitorIdle.h * PLAYER_SPRITE_SCALE

/**
 * El visitante: sprite pixel-art (idle + 2 frames de caminata).
 * El motor posiciona `playerRef` (translate) y escala/voltea
 * `figureRef` (profundidad 2.5D + dirección); la alternancia de
 * frames vive en CSS (.is-walking). El origen (0,0) son los pies.
 * Para cambiar el arte: sustituir los PNG en
 * public/assets/characters/visitor/ (mismo nombre).
 */
export function Player({ playerRef, figureRef }: PlayerProps) {
  const frame = (asset: typeof ASSETS.visitorIdle, cls: string) => (
    <image
      href={asset.src}
      x={-W / 2}
      y={-H}
      width={W}
      height={H}
      preserveAspectRatio="none"
      className={`px player__frame ${cls}`}
    />
  )
  return (
    <g ref={playerRef} className="player" aria-hidden="true">
      <g ref={figureRef} className="player__figure">
        <ellipse className="player__shadow" cx={2} cy={-2} rx={W * 0.26} ry={7} fill="#181411" opacity={0.22} />
        {frame(ASSETS.visitorIdle, "player__frame--idle")}
        {frame(ASSETS.visitorWalk1, "player__frame--walk1")}
        {frame(ASSETS.visitorWalk2, "player__frame--walk2")}
      </g>
    </g>
  )
}

/** Marcador de destino de clic (anillo ocre, animado por el motor vía WAAPI). */
export function ClickMarker({ markerRef }: { markerRef: RefObject<SVGGElement> }) {
  return (
    <g ref={markerRef} className="click-marker" aria-hidden="true">
      <g className="click-marker__inner" opacity={0}>
        <circle r={16} fill="none" stroke="#e08a3c" strokeWidth={2.2} />
        <circle r={3} fill="#e08a3c" />
      </g>
    </g>
  )
}
