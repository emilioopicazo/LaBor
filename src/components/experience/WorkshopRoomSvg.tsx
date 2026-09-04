import type { ReactNode } from "react"
import type { SceneGeometry } from "../../data/map"
import type { WorkshopSceneDef } from "../../data/scenes"
import type { Poi } from "../../hooks/useExperienceEngine"
import { DebugLayer } from "./DebugLayer"
import { DepthLayer, PoiMarkers, WorldLabel } from "./WorldSprite"

interface WorkshopRoomSvgProps {
  scene: WorkshopSceneDef
  pois: Poi[]
  nearbyPoiId: string | null
  playerDepthIndex: number
  showDebugLayer: boolean
  geo: SceneGeometry
  onPoiClick: (id: string) => void
  marker: ReactNode
  player: ReactNode
}

// Paleta de madera / interior (sistema de diseño)
const WOOD = { dark: "#4a3420", base: "#5b4025", light: "#6b4c2d", plank: "#7a5a37" }

/**
 * Interior de taller (cuarto jugable). El arte del cuarto es
 * placeholder construido con los sprites del sistema (mesa, madera,
 * tarimas) sobre un piso de duela; los futuros assets de interior
 * (docs/LABOR_ART_DIRECTION_ASSETS.md §32) lo sustituyen sin tocar
 * la geometría en src/data/scenes.ts.
 */
export function WorkshopRoomSvg({
  scene,
  pois,
  nearbyPoiId,
  playerDepthIndex,
  showDebugLayer,
  geo,
  onPoiClick,
  marker,
  player,
}: WorkshopRoomSvgProps) {
  const W = scene.width
  const H = scene.height
  const planks: number[] = []
  for (let y = 214; y < 940; y += 34) planks.push(y)
  const exit = scene.exit.position

  return (
    <svg className="world-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={scene.name}>
      <defs>
        <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0ac5c" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e0ac5c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* vacío exterior + muros */}
      <rect x={0} y={0} width={W} height={H} fill="#14120f" />
      <rect x={40} y={0} width={W - 80} height={200} fill="#2b2723" />
      <rect x={40} y={180} width={W - 80} height={22} fill="#1f1c18" />
      {[300, 620, 940].map((x) => (
        <g key={x}>
          <rect x={x} y={54} width={160} height={78} fill="#a9c4c2" opacity={0.5} />
          <rect x={x} y={54} width={160} height={78} fill="none" stroke="#4e463c" strokeWidth={3} />
          <line x1={x + 80} y1={54} x2={x + 80} y2={132} stroke="#4e463c" strokeWidth={3} />
        </g>
      ))}
      {/* cable + lámpara colgante sobre el banco */}
      <path d="M 40 30 Q 700 90 1360 30" fill="none" stroke="#4e463c" strokeWidth={2.5} className="cable-sway" />
      <line x1={700} y1={0} x2={700} y2={320} stroke="#4e463c" strokeWidth={3} />
      <circle className="ambient-glow" cx={700} cy={380} r={120} fill="url(#lamp-glow)" />
      <rect x={672} y={318} width={56} height={14} fill="#332e28" />
      <circle cx={700} cy={332} r={14} fill="#e0ac5c" opacity={0.95} />

      {/* piso de duela */}
      <rect x={40} y={200} width={W - 80} height={740} fill={WOOD.base} />
      {planks.map((y, i) => (
        <g key={y}>
          <rect x={40} y={y} width={W - 80} height={34} fill={i % 3 === 0 ? WOOD.light : i % 3 === 1 ? WOOD.base : WOOD.plank} opacity={0.9} />
          <line x1={40} y1={y} x2={W - 40} y2={y} stroke={WOOD.dark} strokeWidth={2} />
          <line x1={140 + (i * 137) % 900} y1={y} x2={140 + (i * 137) % 900} y2={y + 34} stroke={WOOD.dark} strokeWidth={2} />
        </g>
      ))}
      {/* aserrín alrededor del banco */}
      <ellipse cx={700} cy={600} rx={230} ry={70} fill="#a87f4c" opacity={0.14} />
      <ellipse cx={640} cy={640} rx={90} ry={26} fill="#a87f4c" opacity={0.12} />

      {/* muros laterales + umbral de salida */}
      <rect x={0} y={0} width={40} height={H} fill="#1f1c18" />
      <rect x={W - 40} y={0} width={40} height={H} fill="#1f1c18" />
      <rect x={40} y={940} width={exit.x - 60 - 40} height={20} fill="#1f1c18" />
      <rect x={exit.x + 60} y={940} width={W - 40 - exit.x - 60} height={20} fill="#1f1c18" />
      <rect x={exit.x - 60} y={904} width={120} height={56} fill="#8a6238" />
      <rect x={exit.x - 60} y={904} width={120} height={56} fill="none" stroke="#332e28" strokeWidth={2} />

      <WorldLabel x={60} y={30} text={scene.name} accent="#c98f42" size={15} />
      <WorldLabel x={556} y={332} text="BANCO DE TRABAJO" size={12} />
      <WorldLabel x={exit.x - 52} y={874} text="SALIR AL PATIO" size={11} />

      {marker}

      <DepthLayer props={scene.props} playerIndex={playerDepthIndex}>
        {player}
      </DepthLayer>

      <PoiMarkers pois={pois} nearbyId={nearbyPoiId} onPoiClick={onPoiClick} />

      {/* polvo del taller */}
      <circle className="dust dust--1" cx={520} cy={520} r={2.4} fill="#f7f2e6" opacity={0.18} />
      <circle className="dust dust--2" cx={900} cy={700} r={2} fill="#f7f2e6" opacity={0.16} />
      <circle className="dust dust--3" cx={760} cy={430} r={2.2} fill="#f7f2e6" opacity={0.18} />

      {showDebugLayer && <DebugLayer geo={geo} pois={pois} spawn={scene.spawnPoint} />}
    </svg>
  )
}
