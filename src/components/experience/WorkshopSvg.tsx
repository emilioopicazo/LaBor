import type { ReactNode } from "react"
import { WALL, WORLD_HEIGHT, WORLD_WIDTH } from "../../config/world"
import { ASSETS } from "../../data/assets"
import { GATE, PROPERTY_INNER, SPAWN_POINT, type SceneGeometry } from "../../data/map"
import { OVERWORLD_PROPS, worldChangeProps } from "../../data/props"
import { BUILDINGS, spaceAccent, type WorkshopSpace } from "../../data/spaces"
import type { Poi } from "../../hooks/useExperienceEngine"
import { DebugLayer } from "./DebugLayer"
import { CourtyardCat, SkyBirds } from "./Fauna"
import { DepthLayer, PoiMarkers, SpriteRect, T, WorldLabel } from "./WorldSprite"

interface WorkshopSvgProps {
  pois: Poi[]
  nearbyPoiId: string | null
  playerDepthIndex: number
  showDebugLayer: boolean
  geo: SceneGeometry
  /** banderas de mundo (quest) que agregan props */
  worldFlags: Record<string, boolean>
  onSpaceClick: (id: string) => void
  onPoiClick: (id: string) => void
  marker: ReactNode
  player: ReactNode
}

/**
 * El patio de La Bor: el mundo es el predio completo con su muro
 * perimetral (geometría del prototipo de diseño ×2.5). Capas: piso →
 * muros → edificios → gato → profundidad (props + visitante) →
 * hotspots → pájaros → debug. Para cambiar el arte basta sustituir
 * los PNG en public/assets/.
 */
export function WorkshopSvg({
  pois,
  nearbyPoiId,
  playerDepthIndex,
  showDebugLayer,
  geo,
  worldFlags,
  onSpaceClick,
  onPoiClick,
  marker,
  player,
}: WorkshopSvgProps) {
  const props = [...OVERWORLD_PROPS, ...worldChangeProps(worldFlags)]
  const inner = PROPERTY_INNER
  const tileW = inner.width / 2
  const tileH = inner.height / 2

  return (
    <svg
      className="world-svg"
      viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
      width={WORLD_WIDTH}
      height={WORLD_HEIGHT}
      role="img"
      aria-label="Patio de La Bor"
    >
      <defs>
        <radialGradient id="skylight-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f7f2e6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f7f2e6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---------- PISO (4 losas para conservar la densidad del grano) ---------- */}
      <g id="ground">
        <rect x={0} y={0} width={WORLD_WIDTH} height={WORLD_HEIGHT} fill={T.outside} />
        {[0, 1].map((ix) =>
          [0, 1].map((iy) => (
            <SpriteRect
              key={`${ix}-${iy}`}
              asset={ASSETS.floorPatio}
              x={inner.x + ix * tileW}
              y={inner.y + iy * tileH}
              w={tileW}
              h={tileH}
            />
          )),
        )}
        {/* esténcil pintado en el patio */}
        <g transform="translate(1500, 1760)" className="stencil">
          <rect x={-400} y={-125} width={800} height={250} fill="none" stroke={T.paper} strokeWidth={3} opacity={0.3} />
          <text y={36} textAnchor="middle" fontSize={122} fontWeight={900} letterSpacing="0.02em" fill={T.paper} opacity={0.34}>
            La Bor
          </text>
          <text y={86} textAnchor="middle" fontSize={24} fontWeight={600} letterSpacing="0.62em" fill={T.paper} opacity={0.3}>
            TALLERES
          </text>
        </g>
        {/* rótulo bajo el pedestal */}
        <text x={1820} y={1484} textAnchor="middle" fontSize={14} fontWeight={700} letterSpacing="0.24em" fill={T.paper} opacity={0.6}>
          LA PIEZA CENTRAL
        </text>
        {/* orientación pintada en el piso junto al portón y en los muros */}
        <text x={GATE.x + GATE.width / 2} y={WORLD_HEIGHT - WALL - 26} textAnchor="middle" fontSize={20} fontWeight={700} letterSpacing="0.45em" fill={T.paper} opacity={0.5}>
          CALLE COBÁ ↓
        </text>
        <text x={WORLD_WIDTH / 2} y={66} textAnchor="middle" fontSize={20} fontWeight={700} letterSpacing="0.45em" fill={T.paper} opacity={0.4}>
          MALA CASA ↑
        </text>
        <g transform={`translate(${WORLD_WIDTH - 36}, 1450) rotate(90)`}>
          <text textAnchor="middle" fontSize={20} fontWeight={700} letterSpacing="0.45em" fill={T.paper} opacity={0.4}>
            CALLE 12 SUR
          </text>
        </g>
        <text x={WORLD_WIDTH - WALL - 24} y={WORLD_HEIGHT - WALL - 20} textAnchor="end" fontSize={13} fontWeight={700} letterSpacing="0.28em" fill={T.paper} opacity={0.35}>
          PERÍMETRO · 34.90 × 37.31 M
        </text>
        {marker}
      </g>

      {/* ---------- MURO PERIMETRAL ---------- */}
      <g id="walls">
        <SpriteRect asset={ASSETS.wallH} x={0} y={0} w={WORLD_WIDTH} h={WALL} />
        <SpriteRect asset={ASSETS.wallV} x={0} y={WALL} w={WALL} h={WORLD_HEIGHT - WALL * 2} />
        <SpriteRect asset={ASSETS.wallV} x={WORLD_WIDTH - WALL} y={WALL} w={WALL} h={WORLD_HEIGHT - WALL * 2} />
        <SpriteRect asset={ASSETS.wallH} x={0} y={WORLD_HEIGHT - WALL} w={GATE.x} h={WALL} />
        <SpriteRect asset={ASSETS.wallH} x={GATE.x + GATE.width} y={WORLD_HEIGHT - WALL} w={WORLD_WIDTH - GATE.x - GATE.width} h={WALL} />
        <SpriteRect asset={ASSETS.gateMain} x={GATE.x} y={GATE.y + 14} w={GATE.width} h={72} />
      </g>

      {/* ---------- EDIFICIOS ---------- */}
      <g id="buildings">
        {BUILDINGS.map((space) => (
          <Building key={space.id} space={space} onActivate={() => onSpaceClick(space.id)} />
        ))}
        {/* tragaluz activo de CONTRASTE */}
        <circle className="ambient-glow" cx={1178} cy={586} r={70} fill="url(#skylight-glow)" />
      </g>

      {/* ---------- VIDA AMBIENTAL (bajo la profundidad) ---------- */}
      <CourtyardCat />

      {/* ---------- PROFUNDIDAD: props + visitante ---------- */}
      <DepthLayer props={props} playerIndex={playerDepthIndex}>
        {player}
      </DepthLayer>

      {/* ---------- PUNTOS DE INTERÉS ---------- */}
      <PoiMarkers pois={pois} nearbyId={nearbyPoiId} onPoiClick={onPoiClick} />

      {/* ---------- PÁJAROS (siempre encima) ---------- */}
      <SkyBirds />

      {showDebugLayer && <DebugLayer geo={geo} pois={pois} spawn={SPAWN_POINT} />}
    </svg>
  )
}

// ============================================================
// Edificio: sprite de techumbre + etiqueta física
// ============================================================
function Building({ space, onActivate }: { space: WorkshopSpace; onActivate: () => void }) {
  const r = space.buildingRect!
  const asset = ASSETS.roofs[space.id]
  const accent = spaceAccent(space)
  const text =
    space.type === "available" ? `${space.name} · ${space.areaM2} M²` : space.id === "contraste" ? "CONTRASTE" : space.name
  return (
    <g
      className="building"
      onPointerDown={(e) => {
        e.stopPropagation()
        onActivate()
      }}
      onPointerUp={(e) => e.stopPropagation()}
      aria-label={space.name}
    >
      {asset && <SpriteRect asset={asset} x={r.x} y={r.y} w={r.width} h={r.height} />}
      <WorldLabel x={r.x + 18} y={r.y + 18} text={text} accent={accent} size={space.type === "available" ? 17 : 19} />
    </g>
  )
}
