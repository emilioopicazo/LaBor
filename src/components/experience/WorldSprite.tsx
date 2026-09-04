import type { CSSProperties, ReactNode } from "react"
import type { SpriteAsset } from "../../data/assets"
import type { WorldProp } from "../../data/props"
import type { Poi } from "../../hooks/useExperienceEngine"

// Tokens del sistema de diseño usados dentro del SVG
export const T = {
  ink: "#181411",
  charcoal: "#1c1916",
  line: "#332e28",
  lineStrong: "#4e463c",
  paper: "#f4efe4",
  paper2: "#e9dcc6",
  muted: "#c0b6a3",
  ochre: "#c98f42",
  ochre2: "#e08a3c",
  teal: "#3f9c96",
  steel: "#8e9299",
  rust: "#c47a3f",
  outside: "#4a463f",
  street: "#2b2824",
}

interface SpriteProps {
  asset: SpriteAsset
  /** centro horizontal */
  x: number
  /** ancla inferior */
  y: number
  w: number
  h: number
  className?: string
  style?: CSSProperties
  opacity?: number
}

/** Sprite pixel-art anclado por su base (centro-abajo). Se estira a w×h. */
export function Sprite({ asset, x, y, w, h, className, style, opacity }: SpriteProps) {
  return (
    <image
      href={asset.src}
      x={x - w / 2}
      y={y - h}
      width={w}
      height={h}
      preserveAspectRatio="none"
      className={`px${className ? ` ${className}` : ""}`}
      style={style}
      opacity={opacity}
    />
  )
}

/** Sprite posicionado por su esquina superior izquierda (techos, muros). */
export function SpriteRect({
  asset,
  x,
  y,
  w,
  h,
  className,
  clipPath,
}: {
  asset: SpriteAsset
  x: number
  y: number
  w: number
  h: number
  className?: string
  clipPath?: string
}) {
  return (
    <image
      href={asset.src}
      x={x}
      y={y}
      width={w}
      height={h}
      preserveAspectRatio="none"
      className={`px${className ? ` ${className}` : ""}`}
      clipPath={clipPath}
    />
  )
}

/** Etiqueta física sobre una estructura (chip oscuro, tipografía clara). */
export function WorldLabel({
  x,
  y,
  text,
  accent,
  size = 15,
}: {
  x: number
  y: number
  text: string
  accent?: string
  size?: number
}) {
  const padX = 11
  const width = Math.round(text.length * size * 0.66 + padX * 2)
  const height = Math.round(size * 1.9)
  return (
    <g transform={`translate(${x}, ${y})`} className="world-label">
      <rect width={width} height={height} fill="rgba(24,20,17,0.86)" stroke={accent ?? "#6f6b63"} strokeWidth={1.4} />
      <text
        x={padX}
        y={height / 2 + size * 0.36}
        fontSize={size}
        fontWeight={800}
        letterSpacing="0.16em"
        fill={T.paper}
      >
        {text}
      </text>
    </g>
  )
}

/** Un prop con su ancla; la copa (si existe) se dibuja encima con vaivén. */
export function PropNode({ prop }: { prop: WorldProp }) {
  return (
    <g className={`prop${prop.className ? ` ${prop.className}` : ""}`} data-prop={prop.id}>
      <Sprite asset={prop.asset} x={prop.x} y={prop.y + (prop.dyDraw ?? 0)} w={prop.w} h={prop.h} />
      {prop.canopy && (
        <Sprite
          asset={prop.canopy.asset}
          x={prop.x}
          y={prop.y + prop.canopy.dy}
          w={prop.w}
          h={prop.h}
          className={`canopy canopy--${prop.canopy.sway}`}
        />
      )}
    </g>
  )
}

/**
 * Capa de profundidad: props ordenados por ancla `y`; el visitante se
 * inserta en `playerIndex` (calculado por el motor solo cuando cruza
 * un ancla). Así el visitante pasa detrás/delante de árboles y objetos.
 */
export function DepthLayer({
  props,
  playerIndex,
  children,
}: {
  props: WorldProp[]
  playerIndex: number
  children: ReactNode
}) {
  const sorted = [...props].sort((a, b) => a.y - b.y)
  const idx = Math.max(0, Math.min(playerIndex, sorted.length))
  return (
    <g id="depth">
      {sorted.slice(0, idx).map((p) => (
        <PropNode key={p.id} prop={p} />
      ))}
      {children}
      {sorted.slice(idx).map((p) => (
        <PropNode key={p.id} prop={p} />
      ))}
    </g>
  )
}

/** Marcadores de puntos de interés (pulso ocre en disponibles). */
export function PoiMarkers({
  pois,
  nearbyId,
  onPoiClick,
}: {
  pois: Poi[]
  nearbyId: string | null
  onPoiClick: (id: string) => void
}) {
  return (
    <g id="hotspots">
      {pois.map((poi, i) => {
        const near = nearbyId === poi.id
        const available = poi.action === "DISPONIBLE"
        return (
          <g
            key={poi.id}
            transform={`translate(${poi.x}, ${poi.y})`}
            className={`hotspot-marker hotspot-marker--${poi.kind}${near ? " is-near" : ""}`}
            onPointerDown={(e) => {
              e.stopPropagation()
              onPoiClick(poi.id)
            }}
            role="button"
            aria-label={`Ir a ${poi.name}`}
          >
            <circle r={44} fill="rgba(0,0,0,0)" />
            {available ? (
              <>
                <circle className="pulse" r={9} fill={T.ochre2} style={{ animationDelay: `${(i % 5) * 0.4}s` }} />
                <circle r={7} fill={T.ochre2} />
              </>
            ) : poi.kind === "station" ? (
              <>
                <circle className="pulse" r={10} fill={T.ochre} />
                <circle r={7} fill={T.ochre} stroke={T.ink} strokeWidth={1.5} />
              </>
            ) : poi.kind === "exit" ? (
              <rect x={-9} y={-9} width={18} height={18} fill={T.paper} stroke={T.ink} strokeWidth={1.5} />
            ) : (
              <>
                <circle r={7} fill={T.paper} stroke={T.ink} strokeWidth={1.5} />
                <circle r={2.2} fill={T.ink} />
              </>
            )}
          </g>
        )
      })}
    </g>
  )
}
