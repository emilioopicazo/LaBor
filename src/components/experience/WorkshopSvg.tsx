import type { ReactNode } from "react"
import { WORLD_HEIGHT, WORLD_WIDTH } from "../../config/world"
import { ASSETS } from "../../data/assets"
import { GATE, SPAWN_POINT, type SceneGeometry } from "../../data/map"
import { OVERWORLD_PROPS, worldChangeProps } from "../../data/props"
import { SPACES, VETA_ANNEX_RECT, spaceAccent, type WorkshopSpace } from "../../data/spaces"
import type { Poi } from "../../hooks/useExperienceEngine"
import { DebugLayer } from "./DebugLayer"
import { CourtyardCat, SkyBirds } from "./Fauna"
import { DepthLayer, PoiMarkers, SpriteRect, T, WorldLabel } from "./WorldSprite"

// Muro perimetral (sistema de diseño §3): 44 px de espesor, una
// apertura para el portón de Cobá.
const WALL = 44
const PROPERTY = "90,320 300,110 2040,110 2040,1545 90,1545"
const VETA_CLIP = "120,330 330,180 370,180 370,740 120,740"

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
  /** marcador de clic (capa de piso) */
  marker: ReactNode
  /** visitante (se inserta en la capa de profundidad) */
  player: ReactNode
}

/**
 * El patio de La Bor con los sprites del sistema de diseño.
 * Capas: terreno → piso → muros → edificios → gato → profundidad
 * (props + visitante ordenados por Y) → hotspots → pájaros → debug.
 * La lógica de exploración no depende de estos nodos: para cambiar
 * el arte basta sustituir los PNG en public/assets/.
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
        <clipPath id="property-clip">
          <polygon points={PROPERTY} />
        </clipPath>
        <clipPath id="veta-clip">
          <polygon points={VETA_CLIP} />
        </clipPath>
        <radialGradient id="skylight-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f7f2e6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f7f2e6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ---------- TERRENO EXTERIOR + CALLES ---------- */}
      <g id="terrain">
        <rect x={0} y={0} width={WORLD_WIDTH} height={WORLD_HEIGHT} fill={T.outside} />
        {[
          [150, 60, 90, 26],
          [520, 50, 70, 20],
          [1560, 55, 110, 24],
          [2240, 210, 70, 30],
          [2290, 640, 80, 34],
          [2250, 1120, 76, 28],
          [40, 420, 60, 40],
          [40, 1000, 66, 36],
          [720, 48, 60, 18],
          [1900, 52, 66, 20],
        ].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#31492a" opacity={0.45} />
        ))}
        <text x={1076} y={82} fill={T.paper} opacity={0.32} fontSize={17} letterSpacing="0.4em" textAnchor="middle">
          ↑ MALA CASA
        </text>

        {/* CALLE 12 SUR (oriente) */}
        <rect x={2060} y={96} width={66} height={1456} fill={T.street} />
        <line x1={2093} y1={120} x2={2093} y2={1530} stroke={T.paper2} strokeWidth={3} strokeDasharray="30 26" opacity={0.28} />
        <g transform="translate(2098, 420) rotate(90)">
          <text fill={T.paper} opacity={0.45} fontSize={19} letterSpacing="0.45em">
            CALLE 12 SUR
          </text>
        </g>

        {/* CALLE COBÁ (sur) — acceso principal */}
        <rect x={0} y={1552} width={WORLD_WIDTH} height={48} fill={T.street} />
        <line x1={30} y1={1576} x2={WORLD_WIDTH - 30} y2={1576} stroke={T.paper2} strokeWidth={3} strokeDasharray="30 26" opacity={0.28} />
        <text x={560} y={1586} fill={T.paper} opacity={0.45} fontSize={19} letterSpacing="0.45em">
          CALLE COBÁ
        </text>
        <text x={1690} y={1586} fill={T.paper} opacity={0.35} fontSize={19} letterSpacing="0.45em">
          CALLE COBÁ
        </text>
      </g>

      {/* ---------- PISO DEL PATIO ---------- */}
      <g id="ground">
        <SpriteRect asset={ASSETS.floorPatio} x={90} y={110} w={1950} h={1435} clipPath="url(#property-clip)" />
        {/* esténcil pintado en el patio */}
        <g transform="translate(1035, 935)" className="stencil">
          <rect x={-320} y={-100} width={640} height={200} fill="none" stroke={T.paper} strokeWidth={2} opacity={0.3} />
          <text y={30} textAnchor="middle" fontSize={98} fontWeight={900} letterSpacing="0.02em" fill={T.paper} opacity={0.34}>
            La Bor
          </text>
          <text y={70} textAnchor="middle" fontSize={20} fontWeight={600} letterSpacing="0.62em" fill={T.paper} opacity={0.3}>
            TALLERES
          </text>
        </g>
        {/* apertura norte hacia Mala Casa */}
        <rect x={1046} y={110} width={60} height={WALL} fill="#8f8778" />
        {/* rótulo pintado bajo el pedestal de la instalación */}
        <text x={860} y={772} textAnchor="middle" fontSize={11} fontWeight={700} letterSpacing="0.24em" fill={T.paper} opacity={0.6}>
          LA PIEZA CENTRAL
        </text>
        {marker}
      </g>

      {/* ---------- MURO PERIMETRAL ---------- */}
      <g id="walls">
        <SpriteRect asset={ASSETS.wallH} x={300} y={110} w={746} h={WALL} />
        <SpriteRect asset={ASSETS.wallH} x={1106} y={110} w={934} h={WALL} />
        <g transform="translate(90, 320) rotate(-45)">
          <SpriteRect asset={ASSETS.wallH} x={0} y={0} w={297} h={WALL} />
        </g>
        <SpriteRect asset={ASSETS.wallV} x={90} y={320} w={WALL} h={1225} />
        <SpriteRect asset={ASSETS.wallV} x={2040 - WALL} y={110} w={WALL} h={1435} />
        <SpriteRect asset={ASSETS.wallH} x={90} y={1545 - WALL} w={GATE.x - 90} h={WALL} />
        <SpriteRect asset={ASSETS.wallH} x={GATE.x + GATE.width} y={1545 - WALL} w={2040 - GATE.x - GATE.width} h={WALL} />
        {/* portón principal (Cobá) */}
        <SpriteRect asset={ASSETS.gateMain} x={GATE.x} y={GATE.y} w={GATE.width} h={20} />
        <line x1={1050} y1={110} x2={1078} y2={134} stroke={T.paper} strokeWidth={2} opacity={0.4} />
      </g>

      {/* ---------- EDIFICIOS ---------- */}
      <g id="buildings">
        {SPACES.filter((s) => s.buildingRect).map((space) => (
          <Building key={space.id} space={space} onActivate={() => onSpaceClick(space.id)} />
        ))}
        {/* anexo sur de VETA — patio de material */}
        <g
          className="building"
          onPointerDown={(e) => {
            e.stopPropagation()
            onSpaceClick("veta")
          }}
        >
          <SpriteRect
            asset={ASSETS.roofs["veta-sur"]}
            x={VETA_ANNEX_RECT.x}
            y={VETA_ANNEX_RECT.y}
            w={VETA_ANNEX_RECT.width}
            h={VETA_ANNEX_RECT.height}
          />
          <WorldLabel x={VETA_ANNEX_RECT.x + 14} y={VETA_ANNEX_RECT.y + 14} text="VETA · ANNEX" accent="#c98f42" size={13} />
        </g>
        {/* tragaluz activo de CONTRASTE */}
        <circle className="ambient-glow" cx={880} cy={300} r={46} fill="url(#skylight-glow)" />
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
  const labelY = space.id === "veta" ? r.y + 170 : r.y + 14
  return (
    <g
      className="building"
      onPointerDown={(e) => {
        e.stopPropagation()
        onActivate()
      }}
      aria-label={space.name}
    >
      {asset && (
        <SpriteRect
          asset={asset}
          x={r.x}
          y={r.y}
          w={r.width}
          h={r.height}
          clipPath={space.id === "veta" ? "url(#veta-clip)" : undefined}
        />
      )}
      <WorldLabel x={r.x + 14} y={labelY} text={text} accent={accent} size={space.type === "available" ? 14 : 15} />
    </g>
  )
}
