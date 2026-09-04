import type { Point, SceneGeometry } from "../../data/map"
import type { Poi } from "../../hooks/useExperienceEngine"

/** Capa de calibración (DEBUG_WORLD o ?debug) para cualquier escena. */
export function DebugLayer({ geo, pois, spawn }: { geo: SceneGeometry; pois: Poi[]; spawn: Point }) {
  const points = geo.walkable.map(([x, y]) => `${x},${y}`).join(" ")
  return (
    <g id="debug" style={{ pointerEvents: "none" }}>
      <polygon points={points} fill="rgba(230, 60, 60, 0.08)" stroke="#ff5a5a" strokeWidth={2} strokeDasharray="8 6" />
      {geo.waypoints.map((w, i) => (
        <g key={i}>
          <circle cx={w.x} cy={w.y} r={6} fill="#5b9cff" opacity={0.9} />
          <text x={w.x + 10} y={w.y + 4} fontSize={13} fill="#8fbaff">
            W{i}
          </text>
        </g>
      ))}
      {geo.obstacles.map((o) => (
        <circle
          key={o.id}
          cx={o.x}
          cy={o.y}
          r={o.radius}
          fill="rgba(224,138,46,0.18)"
          stroke="#ffb35c"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      ))}
      {pois.map((p) => (
        <g key={p.id}>
          <circle cx={p.x} cy={p.y} r={p.radius} fill="none" stroke="#3ddbc9" strokeWidth={1.2} strokeDasharray="5 5" opacity={0.6} />
          <line x1={p.x - 7} y1={p.y} x2={p.x + 7} y2={p.y} stroke="#3ddbc9" strokeWidth={2} />
          <line x1={p.x} y1={p.y - 7} x2={p.x} y2={p.y + 7} stroke="#3ddbc9" strokeWidth={2} />
          <text x={p.x + 10} y={p.y - 8} fontSize={12} fill="#7fe9dc">
            {p.id}
          </text>
        </g>
      ))}
      <circle cx={spawn.x} cy={spawn.y} r={7} fill="#4ade80" />
      <text x={spawn.x + 12} y={spawn.y + 4} fontSize={13} fill="#86efac">
        SPAWN
      </text>
    </g>
  )
}
