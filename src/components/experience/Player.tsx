import type { RefObject } from "react"

interface PlayerProps {
  playerRef: RefObject<SVGGElement>
  figureRef: RefObject<SVGGElement>
}

/**
 * El visitante: silueta humana mínima en escala arquitectónica.
 * El motor posiciona `playerRef` (translate) y escala/voltea
 * `figureRef` (profundidad 2.5D + dirección). El origen (0,0)
 * son los pies.
 */
export function Player({ playerRef, figureRef }: PlayerProps) {
  return (
    <g ref={playerRef} className="player" aria-hidden="true">
      <g ref={figureRef} className="player__figure">
        <ellipse className="player__shadow" cx={0} cy={-1} rx={15} ry={4.6} fill="#000" opacity={0.2} />
        <g className="player__body">
          {/* piernas */}
          <rect className="player__leg player__leg--l" x={-7.5} y={-18} width={6} height={18} rx={2.6} fill="#201f1d" />
          <rect className="player__leg player__leg--r" x={1.5} y={-18} width={6} height={18} rx={2.6} fill="#201f1d" />
          {/* torso */}
          <rect x={-9.5} y={-42} width={19} height={27} rx={8} fill="#201f1d" />
          {/* cabeza */}
          <circle cx={0} cy={-51} r={8.4} fill="#201f1d" />
        </g>
      </g>
    </g>
  )
}

/** Marcador de destino de clic (animado por el motor vía WAAPI). */
export function ClickMarker({ markerRef }: { markerRef: RefObject<SVGGElement> }) {
  return (
    <g ref={markerRef} className="click-marker" aria-hidden="true">
      <g className="click-marker__inner" opacity={0}>
        <circle r={15} fill="none" stroke="#22211e" strokeWidth={1.6} />
        <line x1={-5} y1={0} x2={5} y2={0} stroke="#22211e" strokeWidth={1.6} />
        <line x1={0} y1={-5} x2={0} y2={5} stroke="#22211e" strokeWidth={1.6} />
      </g>
    </g>
  )
}
