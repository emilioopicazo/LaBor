import type { ReactNode } from "react"
import { ASSETS } from "../../data/assets"
import type { SceneGeometry } from "../../data/map"
import type { WorkshopSceneDef } from "../../data/scenes"
import type { Poi } from "../../hooks/useExperienceEngine"
import { DebugLayer } from "./DebugLayer"
import { DepthLayer, PoiMarkers, SpriteRect, T, WorldLabel } from "./WorldSprite"

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

const WOOD = { dark: "#4a3420", base: "#5b4025", light: "#6b4c2d", plank: "#7a5a37" }

/**
 * Interior de taller (cuarto jugable). El arte es placeholder
 * construido con los sprites del sistema sobre un piso según el
 * estilo del cuarto (duela, concreto oscuro / claro, losa). Los
 * futuros assets de interior lo sustituyen sin tocar la geometría
 * en src/data/scenes.ts.
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
  const exit = scene.exit.position
  const station = scene.stations[0]

  return (
    <svg className="world-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={scene.name}>
      <defs>
        <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0ac5c" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e0ac5c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="forge-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e08a3c" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#e08a3c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* vacío exterior + muro de fondo */}
      <rect x={0} y={0} width={W} height={H} fill="#14120f" />
      <rect x={40} y={0} width={W - 80} height={200} fill={scene.style === "concrete-light" ? "#3a3631" : "#2b2723"} />
      <rect x={40} y={180} width={W - 80} height={22} fill="#1f1c18" />
      {[0.22, 0.5, 0.78].map((f) => (
        <g key={f}>
          <rect x={W * f - 80} y={54} width={160} height={78} fill="#a9c4c2" opacity={scene.style === "concrete-dark" ? 0.25 : 0.5} />
          <rect x={W * f - 80} y={54} width={160} height={78} fill="none" stroke="#4e463c" strokeWidth={3} />
          <line x1={W * f} y1={54} x2={W * f} y2={132} stroke="#4e463c" strokeWidth={3} />
        </g>
      ))}

      {/* piso según estilo */}
      <Floor scene={scene} />

      {/* lámpara colgante sobre la estación */}
      {station && (
        <g>
          <path d={`M 40 30 Q ${station.position.x} 90 ${W - 40} 30`} fill="none" stroke="#4e463c" strokeWidth={2.5} className="cable-sway" />
          <line x1={station.position.x} y1={0} x2={station.position.x} y2={station.position.y - 260} stroke="#4e463c" strokeWidth={3} />
          <circle
            className="ambient-glow"
            cx={station.position.x}
            cy={station.position.y - 200}
            r={130}
            fill={scene.style === "concrete-dark" ? "url(#forge-glow)" : "url(#lamp-glow)"}
          />
          <rect x={station.position.x - 28} y={station.position.y - 262} width={56} height={14} fill="#332e28" />
          <circle cx={station.position.x} cy={station.position.y - 248} r={14} fill={scene.style === "concrete-dark" ? "#e08a3c" : "#e0ac5c"} opacity={0.95} />
        </g>
      )}

      {/* muros laterales + umbral de salida */}
      <rect x={0} y={0} width={40} height={H} fill="#1f1c18" />
      <rect x={W - 40} y={0} width={40} height={H} fill="#1f1c18" />
      <rect x={40} y={H - 20} width={exit.x - 60 - 40} height={20} fill="#1f1c18" />
      <rect x={exit.x + 60} y={H - 20} width={W - 40 - exit.x - 60} height={20} fill="#1f1c18" />
      <rect x={exit.x - 60} y={H - 56} width={120} height={56} fill="#8a6238" />
      <rect x={exit.x - 60} y={H - 56} width={120} height={56} fill="none" stroke="#332e28" strokeWidth={2} />

      <WorldLabel x={60} y={30} text={scene.name} accent={scene.accent} size={16} />
      {station && <WorldLabel x={station.position.x - 150} y={station.position.y - 230} text={station.name} size={12} />}
      {scene.sign && (
        <g>
          <WorldLabel x={W / 2 - scene.sign.length * 6.3 - 14} y={H / 2 - 150} text={scene.sign} accent="#e08a3c" size={19} />
          <text x={W / 2} y={H / 2 - 60} textAnchor="middle" fontSize={13} fontWeight={800} letterSpacing="0.3em" fill={T.ochre2} opacity={0.9}>
            ESTE ESPACIO PODRÍA SER TUYO
          </text>
        </g>
      )}
      <WorldLabel x={exit.x + 74} y={H - 48} text="SALIR AL PATIO" size={11} />

      {marker}

      <DepthLayer props={scene.props} playerIndex={playerDepthIndex}>
        {player}
      </DepthLayer>

      <PoiMarkers pois={pois} nearbyId={nearbyPoiId} onPoiClick={onPoiClick} />

      <circle className="dust dust--1" cx={W * 0.35} cy={H * 0.55} r={2.4} fill="#f7f2e6" opacity={0.18} />
      <circle className="dust dust--2" cx={W * 0.65} cy={H * 0.7} r={2} fill="#f7f2e6" opacity={0.16} />
      <circle className="dust dust--3" cx={W * 0.55} cy={H * 0.45} r={2.2} fill="#f7f2e6" opacity={0.18} />

      {showDebugLayer && <DebugLayer geo={geo} pois={pois} spawn={scene.spawnPoint} />}
    </svg>
  )
}

function Floor({ scene }: { scene: WorkshopSceneDef }) {
  const W = scene.width
  const H = scene.height
  if (scene.style === "wood") {
    const planks: number[] = []
    for (let y = 214; y < H - 20; y += 34) planks.push(y)
    return (
      <g>
        <rect x={40} y={200} width={W - 80} height={H - 220} fill={WOOD.base} />
        {planks.map((y, i) => (
          <g key={y}>
            <rect x={40} y={y} width={W - 80} height={34} fill={i % 3 === 0 ? WOOD.light : i % 3 === 1 ? WOOD.base : WOOD.plank} opacity={0.9} />
            <line x1={40} y1={y} x2={W - 40} y2={y} stroke={WOOD.dark} strokeWidth={2} />
            <line x1={140 + ((i * 137) % (W - 300))} y1={y} x2={140 + ((i * 137) % (W - 300))} y2={y + 34} stroke={WOOD.dark} strokeWidth={2} />
          </g>
        ))}
        <ellipse cx={W / 2} cy={H * 0.62} rx={230} ry={70} fill="#a87f4c" opacity={0.14} />
      </g>
    )
  }
  if (scene.style === "concrete-dark" || scene.style === "concrete-light") {
    const dark = scene.style === "concrete-dark"
    const base = dark ? "#3a3631" : "#8f8778"
    const line = dark ? "#2b2824" : "#7a7365"
    const cols: number[] = []
    for (let x = 40 + 180; x < W - 40; x += 180) cols.push(x)
    const rows: number[] = []
    for (let y = 200 + 180; y < H - 20; y += 180) rows.push(y)
    return (
      <g>
        <rect x={40} y={200} width={W - 80} height={H - 220} fill={base} />
        {cols.map((x) => (
          <line key={`c${x}`} x1={x} y1={200} x2={x} y2={H - 20} stroke={line} strokeWidth={2} opacity={0.7} />
        ))}
        {rows.map((y) => (
          <line key={`r${y}`} x1={40} y1={y} x2={W - 40} y2={y} stroke={line} strokeWidth={2} opacity={0.7} />
        ))}
        {dark ? (
          <>
            <ellipse cx={W / 2} cy={H * 0.62} rx={220} ry={64} fill="#181411" opacity={0.35} />
            <ellipse cx={W * 0.3} cy={H * 0.5} rx={90} ry={30} fill="#181411" opacity={0.25} />
          </>
        ) : (
          <ellipse cx={W / 2} cy={H * 0.6} rx={220} ry={64} fill="#f7f2e6" opacity={0.08} />
        )}
      </g>
    )
  }
  // vacío: losa del patio
  return (
    <g>
      <SpriteRect asset={ASSETS.floorPatio} x={40} y={200} w={W - 80} h={H - 220} />
      <rect x={40} y={200} width={W - 80} height={H - 220} fill="#181411" opacity={0.12} />
    </g>
  )
}
