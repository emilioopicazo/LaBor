import type { ReactNode } from "react"
import { WORLD_HEIGHT, WORLD_WIDTH } from "../../config/world"
import { OBSTACLES, SPAWN_POINT, WALKABLE_AREA, WAYPOINTS } from "../../data/map"
import { SPACES, WORLD_SPACES, type WorkshopSpace } from "../../data/spaces"

// Paleta del mundo (arte temporal V0 — reemplazable por ilustración
// custom sin tocar la lógica de juego; ver §84 del handoff).
const C = {
  outside: "#b3afa4",
  outsideVeg: "#9fa08f",
  street: "#8b8880",
  property: "#d7d4cb",
  slab: "#e0ddd4",
  wall: "#57544d",
  roof: "#dcd9d0",
  roofOcc: "#d2cec3",
  front: "#a9a59a",
  frontOcc: "#9e9a8e",
  ink: "#22211e",
  paper: "#f1efe9",
  skylight: "#eae8e0",
  door: "#26241f",
  bed: "#c6c5b1",
  green1: "#7f8873",
  green2: "#8b937d",
  green3: "#9aa189",
  trunk: "#6b6053",
  wood: "#b2a083",
  glow: "#d9a44e",
}

const EXTRUDE = 16

interface WorkshopSvgProps {
  nearbySpaceId: string | null
  showDebugLayer: boolean
  onSpaceClick: (id: string) => void
  children?: ReactNode
}

/**
 * Reconstrucción arquitectónica estilizada de La Bor.
 * Capas: terreno → propiedad → patio → jardín → edificios →
 * objetos → hotspots → [children: marcador de clic + visitante]
 * → debug. La lógica de exploración NO depende de estos nodos.
 */
export function WorkshopSvg({
  nearbySpaceId,
  showDebugLayer,
  onSpaceClick,
  children,
}: WorkshopSvgProps) {
  return (
    <svg
      className="world-svg"
      viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
      width={WORLD_WIDTH}
      height={WORLD_HEIGHT}
      role="img"
      aria-label="Mapa del complejo La Bor"
    >
      <defs>
        <filter id="paper-noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
        <radialGradient id="stain" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4a463d" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#4a463d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="weld-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#eaf3ff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#bcd6f5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#bcd6f5" stopOpacity="0" />
        </radialGradient>
        <clipPath id="slab-clip">
          <rect x={370} y={455} width={1640} height={655} />
        </clipPath>
      </defs>

      {/* ---------- TERRENO EXTERIOR ---------- */}
      <g id="terrain">
        <rect x={0} y={0} width={WORLD_WIDTH} height={WORLD_HEIGHT} fill={C.outside} />
        {/* vegetación exterior sugerida */}
        {[
          [150, 60, 90, 26],
          [520, 50, 70, 20],
          [1560, 55, 110, 24],
          [2120, 210, 70, 30],
          [2200, 640, 90, 34],
          [2140, 1120, 76, 28],
          [40, 420, 60, 40],
          [40, 1000, 66, 36],
          [720, 48, 60, 18],
          [1900, 52, 66, 20],
        ].map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={C.outsideVeg} opacity={0.5} />
        ))}
        <text x={1160} y={78} fill={C.ink} opacity={0.28} fontSize={17} letterSpacing="0.4em" textAnchor="middle">
          ↑ MALA CASA
        </text>

        {/* CALLE COBÁ (sur) */}
        <rect x={0} y={1552} width={WORLD_WIDTH} height={48} fill={C.street} />
        <line x1={0} y1={1548} x2={WORLD_WIDTH} y2={1548} stroke={C.ink} strokeWidth={2} opacity={0.25} />
        <line
          x1={30}
          y1={1576}
          x2={WORLD_WIDTH - 30}
          y2={1576}
          stroke={C.paper}
          strokeWidth={3}
          strokeDasharray="30 26"
          opacity={0.35}
        />
        <text x={250} y={1586} fill={C.paper} opacity={0.55} fontSize={19} letterSpacing="0.45em">
          CALLE COBÁ
        </text>
        <text x={1930} y={1586} fill={C.paper} opacity={0.4} fontSize={19} letterSpacing="0.45em">
          CALLE COBÁ
        </text>
      </g>

      {/* ---------- PROPIEDAD ---------- */}
      <g id="property">
        <rect x={90} y={110} width={1950} height={1435} fill={C.property} />
        <rect
          x={90}
          y={110}
          width={1950}
          height={1435}
          fill="none"
          stroke={C.wall}
          strokeWidth={3.5}
          opacity={0.55}
        />
        {/* acceso peatonal entre NAVE 02 y NAVE 01, desde Cobá */}
        <rect x={1342} y={1100} width={36} height={452} fill="#cfccc3" />
        {[1150, 1240, 1330, 1420, 1500].map((y) => (
          <line key={y} x1={1344} y1={y} x2={1376} y2={y} stroke={C.ink} strokeWidth={1} opacity={0.06} />
        ))}
        <rect x={1332} y={1536} width={9} height={9} fill={C.wall} />
        <rect x={1379} y={1536} width={9} height={9} fill={C.wall} />
      </g>

      {/* ---------- PATIO / EXPLANADA ---------- */}
      <g id="ground">
        <rect x={370} y={455} width={1640} height={655} fill={C.slab} />
        {/* juntas de dilatación */}
        <g clipPath="url(#slab-clip)" opacity={0.05} stroke={C.ink} strokeWidth={1.2}>
          {[534, 698, 862, 1026, 1190, 1354, 1518, 1682, 1846].map((x) => (
            <line key={`v${x}`} x1={x} y1={455} x2={x} y2={1110} />
          ))}
          {[619, 783, 947].map((y) => (
            <line key={`h${y}`} x1={370} y1={y} x2={2010} y2={y} />
          ))}
        </g>
        {/* manchas de uso */}
        <ellipse cx={640} cy={860} rx={130} ry={60} fill="url(#stain)" />
        <ellipse cx={1240} cy={640} rx={110} ry={54} fill="url(#stain)" />
        <ellipse cx={1560} cy={980} rx={150} ry={62} fill="url(#stain)" />
        <ellipse cx={900} cy={1040} rx={120} ry={44} fill="url(#stain)" />

        {/* esténcil pintado en el piso */}
        <g opacity={0.9}>
          <text
            x={1035}
            y={945}
            textAnchor="middle"
            fontSize={86}
            fontWeight={700}
            letterSpacing="0.32em"
            fill={C.ink}
            opacity={0.075}
          >
            LA BOR
          </text>
          <text
            x={1035}
            y={985}
            textAnchor="middle"
            fontSize={23}
            fontWeight={500}
            letterSpacing="0.65em"
            fill={C.ink}
            opacity={0.06}
          >
            TALLERES
          </text>
        </g>

        {/* textura de concreto */}
        <rect
          x={90}
          y={110}
          width={1950}
          height={1435}
          fill="#000"
          filter="url(#paper-noise)"
          opacity={0.05}
        />
      </g>

      {/* ---------- JARDÍN CENTRAL ---------- */}
      <g id="landscape">
        <path
          d="M 1052 208 Q 1200 178 1328 218 Q 1364 320 1346 438 Q 1352 524 1298 552 Q 1180 570 1082 552 Q 1036 508 1042 398 Q 1032 288 1052 208 Z"
          fill={C.bed}
        />
        {[
          [1075, 250],
          [1120, 545],
          [1255, 560],
          [1330, 470],
          [1345, 330],
          [1060, 430],
          [1290, 210],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.4} fill={C.ink} opacity={0.12} />
        ))}
        {/* árbol principal — hito de orientación */}
        <ellipse cx={1240} cy={505} rx={128} ry={34} fill="#000" opacity={0.1} />
        <path d="M 1187 470 h 16 l -4 -52 h -8 Z" fill={C.trunk} />
        <g className="tree-sway">
          <circle cx={1150} cy={362} r={78} fill={C.green1} />
          <circle cx={1237} cy={342} r={88} fill={C.green2} />
          <circle cx={1190} cy={290} r={70} fill={C.green2} />
          <circle cx={1262} cy={398} r={56} fill={C.green1} />
          <circle cx={1140} cy={420} r={48} fill={C.green1} />
          <circle cx={1214} cy={312} r={42} fill={C.green3} opacity={0.85} />
        </g>
        {/* arbustos secundarios */}
        <ellipse cx={1098} cy={528} rx={42} ry={12} fill="#000" opacity={0.08} />
        <circle cx={1085} cy={505} r={38} fill={C.green1} />
        <circle cx={1098} cy={492} r={24} fill={C.green3} opacity={0.9} />
        <ellipse cx={1315} cy={276} rx={36} ry={10} fill="#000" opacity={0.08} />
        <circle cx={1305} cy={255} r={33} fill={C.green2} />
        <circle cx={1315} cy={244} r={19} fill={C.green3} opacity={0.9} />
      </g>

      {/* ---------- EDIFICIOS ---------- */}
      <g id="buildings">
        {SPACES.filter((s) => s.buildingRect).map((space) => (
          <Building
            key={space.id}
            space={space}
            onActivate={() => onSpaceClick(space.id)}
          />
        ))}
      </g>

      {/* ---------- OBJETOS DEL PATIO ---------- */}
      <g id="objects">
        {/* madera apilada junto a VETA */}
        <g transform="translate(382, 548)">
          <rect x={0} y={16} width={46} height={9} fill={C.wood} stroke={C.ink} strokeWidth={0.8} opacity={0.95} />
          <rect x={3} y={7} width={40} height={9} fill="#a5926f" stroke={C.ink} strokeWidth={0.8} transform="rotate(-2 23 11)" />
          <rect x={6} y={-1} width={34} height={8} fill={C.wood} stroke={C.ink} strokeWidth={0.8} transform="rotate(1.5 23 3)" />
        </g>

        {/* tarima + huacales frente a las naves */}
        <g transform="translate(838, 1102)" opacity={0.9}>
          <rect x={0} y={0} width={48} height={16} fill="none" stroke={C.ink} strokeWidth={1} opacity={0.4} />
          <line x1={16} y1={0} x2={16} y2={16} stroke={C.ink} strokeWidth={1} opacity={0.35} />
          <line x1={32} y1={0} x2={32} y2={16} stroke={C.ink} strokeWidth={1} opacity={0.35} />
        </g>
        <g transform="translate(1508, 1100)" opacity={0.9}>
          <rect x={0} y={0} width={20} height={18} fill="#c6c2b8" stroke={C.ink} strokeWidth={1} opacity={0.7} />
          <rect x={24} y={4} width={16} height={14} fill="#beb9ae" stroke={C.ink} strokeWidth={1} opacity={0.7} />
        </g>

        {/* EVENTOS — tablero de avisos del patio */}
        <g className="object-hotspot" transform="translate(1100, 758) rotate(-1.5)">
          <line x1={-36} y1={0} x2={-36} y2={-58} stroke={C.ink} strokeWidth={4} />
          <line x1={36} y1={0} x2={36} y2={-58} stroke={C.ink} strokeWidth={4} />
          <rect x={-48} y={-104} width={96} height={52} fill={C.paper} stroke={C.ink} strokeWidth={2} />
          <rect x={-40} y={-96} width={26} height={34} fill="#fff" stroke={C.ink} strokeWidth={0.8} opacity={0.85} />
          <rect x={-8} y={-92} width={20} height={26} fill="#fff" stroke={C.ink} strokeWidth={0.8} opacity={0.7} />
          <text x={22} y={-70} textAnchor="middle" fontSize={9} letterSpacing="0.18em" fill={C.ink} opacity={0.8}>
            EVENTOS
          </text>
          <ellipse cx={8} cy={4} rx={44} ry={8} fill="#000" opacity={0.08} />
        </g>

        {/* TALLERES — mesa de trabajo comunal */}
        <g className="object-hotspot" transform="translate(760, 940)">
          <ellipse cx={6} cy={22} rx={62} ry={10} fill="#000" opacity={0.08} />
          <rect x={-60} y={-24} width={120} height={38} fill={C.wood} stroke={C.ink} strokeWidth={1.6} />
          <rect x={-60} y={-24} width={120} height={8} fill="#000" opacity={0.08} />
          <rect x={-54} y={14} width={7} height={12} fill={C.ink} opacity={0.8} />
          <rect x={47} y={14} width={7} height={12} fill={C.ink} opacity={0.8} />
          {/* herramientas sobre la mesa */}
          <circle cx={-30} cy={-6} r={5} fill="none" stroke={C.ink} strokeWidth={1.4} opacity={0.7} />
          <line x1={6} y1={-14} x2={30} y2={-2} stroke={C.ink} strokeWidth={2} opacity={0.6} />
          <rect x={34} y={-16} width={14} height={8} fill={C.ink} opacity={0.55} />
        </g>

        {/* CONTACTO — tótem de información junto al acceso */}
        <g className="object-hotspot" transform="translate(1330, 1052)">
          <ellipse cx={3} cy={4} rx={20} ry={5} fill="#000" opacity={0.1} />
          <rect x={-5} y={-46} width={10} height={50} fill={C.ink} />
          <rect x={-26} y={-72} width={52} height={26} fill={C.paper} stroke={C.ink} strokeWidth={1.6} />
          <text x={0} y={-55} textAnchor="middle" fontSize={9.5} letterSpacing="0.22em" fill={C.ink}>
            INFO
          </text>
        </g>

        {/* chispas de soldadura en NAVE 02 (vida ambiental) */}
        <rect x={1066} y={1120} width={28} height={7} fill={C.door} />
        <circle className="ambient-weld" cx={1080} cy={1124} r={11} fill="url(#weld-glow)" />

        {/* polvo en suspensión */}
        <circle className="dust dust--1" cx={820} cy={760} r={2.2} fill="#ffffff" opacity={0.16} />
        <circle className="dust dust--2" cx={1420} cy={930} r={1.8} fill="#ffffff" opacity={0.14} />
        <circle className="dust dust--3" cx={620} cy={620} r={2} fill="#ffffff" opacity={0.15} />
      </g>

      {/* ---------- HOTSPOTS ---------- */}
      <g id="hotspots">
        {WORLD_SPACES.map((space) => {
          const p = space.interactionPoint!
          const near = nearbySpaceId === space.id
          const isObject = !space.buildingRect
          return (
            <g
              key={space.id}
              transform={`translate(${p.x}, ${p.y})`}
              className={`hotspot-marker${near ? " is-near" : ""}`}
              onPointerDown={(e) => {
                e.stopPropagation()
                onSpaceClick(space.id)
              }}
              role="button"
              aria-label={`Ir a ${space.name}`}
            >
              {isObject ? (
                <circle r={40} fill="rgba(0,0,0,0)" stroke="none" />
              ) : (
                <>
                  <rect className="hotspot-marker__plate" x={-11} y={-11} width={22} height={22} />
                  <line className="hotspot-marker__cross" x1={-5} y1={0} x2={5} y2={0} />
                  <line className="hotspot-marker__cross" x1={0} y1={-5} x2={0} y2={5} />
                </>
              )}
            </g>
          )
        })}
      </g>

      {/* marcador de clic + visitante (inyectados por el mundo) */}
      {children}

      {/* ---------- DEBUG ---------- */}
      {showDebugLayer && <DebugLayer />}
    </svg>
  )
}

// ============================================================
// Edificio genérico con extrusión 2.5D + detalles por tipo
// ============================================================
function Building({ space, onActivate }: { space: WorkshopSpace; onActivate: () => void }) {
  const r = space.buildingRect!
  const occupied = space.type === "resident"
  const roofFill = occupied ? C.roofOcc : C.roof
  const frontFill = occupied ? C.frontOcc : C.front
  const roofH = r.height - EXTRUDE
  const cx = r.x + r.width / 2

  return (
    <g
      className="building"
      onPointerDown={(e) => {
        e.stopPropagation()
        onActivate()
      }}
      aria-label={space.name}
    >
      {/* sombra arrojada */}
      <rect x={r.x + 10} y={r.y + 12} width={r.width} height={r.height} fill="#000" opacity={0.07} />
      {/* techo */}
      <rect x={r.x} y={r.y} width={r.width} height={roofH} fill={roofFill} />
      {/* fachada sur (extrusión) */}
      <rect x={r.x} y={r.y + roofH} width={r.width} height={EXTRUDE} fill={frontFill} />
      {/* contorno */}
      <rect
        x={r.x}
        y={r.y}
        width={r.width}
        height={r.height}
        fill="none"
        stroke={C.ink}
        strokeWidth={1.4}
        opacity={0.75}
      />
      <line
        x1={r.x}
        y1={r.y + roofH}
        x2={r.x + r.width}
        y2={r.y + roofH}
        stroke={C.ink}
        strokeWidth={0.8}
        opacity={0.4}
      />

      <BuildingDetail space={space} roofH={roofH} cx={cx} />
    </g>
  )
}

function BuildingDetail({
  space,
  roofH,
  cx,
}: {
  space: WorkshopSpace
  roofH: number
  cx: number
}) {
  const r = space.buildingRect!
  const midY = r.y + roofH / 2

  // NAVES — techumbre industrial con crujías y tragaluz
  if (space.id.startsWith("nave")) {
    const bays: number[] = []
    for (let x = r.x + 72; x < r.x + r.width - 30; x += 72) bays.push(x)
    return (
      <g>
        {bays.map((x, i) => (
          <g key={x}>
            <line x1={x} y1={r.y + 8} x2={x} y2={r.y + roofH - 8} stroke={C.ink} strokeWidth={1} opacity={0.07} />
            {i % 2 === 0 && (
              <rect x={x} y={r.y + 2} width={Math.min(72, r.x + r.width - x - 2)} height={roofH - 4} fill="#000" opacity={0.02} />
            )}
          </g>
        ))}
        <rect
          x={r.x + 26}
          y={r.y + 34}
          width={r.width - 52}
          height={22}
          fill={C.skylight}
          stroke={C.ink}
          strokeWidth={0.8}
          opacity={0.85}
        />
        <text x={cx} y={midY + 16} textAnchor="middle" fontSize={42} fontWeight={600} letterSpacing="0.24em" fill={C.ink} opacity={0.32}>
          {space.name}
        </text>
        <text x={cx} y={midY + 52} textAnchor="middle" fontSize={18} letterSpacing="0.3em" fill={C.ink} opacity={0.26}>
          {space.areaM2} M²
        </text>
        {/* portón hacia el patio (norte) */}
        <rect x={cx - 26} y={r.y - 1} width={52} height={7} fill={C.door} opacity={0.75} />
      </g>
    )
  }

  // PABELLONES — losa limpia con índice arquitectónico
  if (space.id.startsWith("pabellon")) {
    const num = space.number?.replace("P", "") ?? ""
    return (
      <g>
        <rect
          x={r.x + 12}
          y={r.y + 12}
          width={r.width - 24}
          height={roofH - 24}
          fill="none"
          stroke={C.ink}
          strokeWidth={1}
          opacity={0.08}
        />
        <text x={cx} y={midY - 22} textAnchor="middle" fontSize={21} letterSpacing="0.34em" fill={C.ink} opacity={0.3}>
          PABELLÓN
        </text>
        <text x={cx} y={midY + 30} textAnchor="middle" fontSize={52} fontWeight={600} letterSpacing="0.1em" fill={C.ink} opacity={0.32}>
          {num}
        </text>
        <text x={cx} y={midY + 62} textAnchor="middle" fontSize={16} letterSpacing="0.28em" fill={C.ink} opacity={0.26}>
          {space.areaM2} M²
        </text>
      </g>
    )
  }

  if (space.id === "contraste") {
    return (
      <g>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={r.x + 52 + i * 72}
            y={r.y + 34}
            width={26}
            height={26}
            fill={C.skylight}
            stroke={C.ink}
            strokeWidth={0.8}
            opacity={0.9}
          />
        ))}
        <text x={r.x + 18} y={r.y + 24} fontSize={11} letterSpacing="0.22em" fill={C.ink} opacity={0.45}>
          01 / RESIDENTE
        </text>
        <text x={cx} y={midY + 18} textAnchor="middle" fontSize={33} fontWeight={600} letterSpacing="0.2em" fill={C.ink} opacity={0.5}>
          CONTRASTE
        </text>
        <text x={cx} y={midY + 46} textAnchor="middle" fontSize={15} letterSpacing="0.6em" fill={C.ink} opacity={0.42}>
          ATELIER
        </text>
        {/* puerta al patio + luz de taller activa */}
        <rect x={cx - 16} y={r.y + roofH - 3} width={32} height={EXTRUDE + 3} fill={C.door} />
        <circle className="ambient-glow" cx={cx} cy={r.y + roofH - 9} r={5} fill={C.glow} opacity={0.55} />
      </g>
    )
  }

  if (space.id === "veta") {
    const lines: number[] = []
    for (let x = r.x + 38; x < r.x + r.width - 20; x += 38) lines.push(x)
    return (
      <g>
        {lines.map((x) => (
          <line key={x} x1={x} y1={r.y + 10} x2={x} y2={r.y + roofH - 10} stroke={C.ink} strokeWidth={1} opacity={0.035} />
        ))}
        <g transform={`translate(${cx}, ${midY}) rotate(-90)`}>
          <text textAnchor="middle" fontSize={50} fontWeight={600} letterSpacing="0.4em" fill={C.ink} opacity={0.42}>
            VETA
          </text>
          <text y={38} textAnchor="middle" fontSize={13} letterSpacing="0.3em" fill={C.ink} opacity={0.3}>
            CARPINTERÍA
          </text>
        </g>
        {/* puerta hacia el patio (oriente) */}
        <rect x={r.x + r.width - 8} y={636} width={9} height={30} fill={C.door} />
      </g>
    )
  }

  if (space.id === "mannino") {
    return (
      <g>
        <text x={cx} y={midY + 8} textAnchor="middle" fontSize={23} fontWeight={600} letterSpacing="0.3em" fill={C.ink} opacity={0.42}>
          MANNINO
        </text>
        <rect x={r.x + r.width - 8} y={846} width={9} height={28} fill={C.door} />
      </g>
    )
  }

  return null
}

// ============================================================
// Capa de calibración (DEBUG_WORLD o ?debug)
// ============================================================
function DebugLayer() {
  const points = WALKABLE_AREA.map(([x, y]) => `${x},${y}`).join(" ")
  return (
    <g id="debug" style={{ pointerEvents: "none" }}>
      <polygon
        points={points}
        fill="rgba(230, 60, 60, 0.06)"
        stroke="#e03d3d"
        strokeWidth={2}
        strokeDasharray="8 6"
      />
      {WAYPOINTS.map((w, i) => (
        <g key={i}>
          <circle cx={w.x} cy={w.y} r={6} fill="#2b6ef2" opacity={0.85} />
          <text x={w.x + 10} y={w.y + 4} fontSize={13} fill="#2b6ef2">
            W{i}
          </text>
        </g>
      ))}
      {OBSTACLES.map((o) => (
        <circle
          key={o.id}
          cx={o.x}
          cy={o.y}
          r={o.radius}
          fill="rgba(224,138,46,0.15)"
          stroke="#e08a2e"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      ))}
      {WORLD_SPACES.map((s) => {
        const p = s.interactionPoint!
        return (
          <g key={s.id}>
            <circle cx={p.x} cy={p.y} r={s.interactionRadius} fill="none" stroke="#1fa196" strokeWidth={1.2} strokeDasharray="5 5" opacity={0.5} />
            <line x1={p.x - 7} y1={p.y} x2={p.x + 7} y2={p.y} stroke="#1fa196" strokeWidth={2} />
            <line x1={p.x} y1={p.y - 7} x2={p.x} y2={p.y + 7} stroke="#1fa196" strokeWidth={2} />
            <text x={p.x + 10} y={p.y - 8} fontSize={12} fill="#0e7a71">
              {s.id}
            </text>
          </g>
        )
      })}
      <circle cx={SPAWN_POINT.x} cy={SPAWN_POINT.y} r={7} fill="#28a745" />
      <text x={SPAWN_POINT.x + 12} y={SPAWN_POINT.y + 4} fontSize={13} fill="#1c7a33">
        SPAWN
      </text>
    </g>
  )
}
