import type { MissionView } from "../../game/mission"

interface MissionLineProps {
  view: MissionView
  onClick: () => void
}

/** Solo el objetivo actual: "LA PIEZA · 2/4 · MANNNO: CONECTA 4" */
export function MissionLine({ view, onClick }: MissionLineProps) {
  return (
    <button type="button" className={`mission-line${view.complete ? " mission-line--done" : ""}`} onClick={onClick}>
      <span className="mission-line__title">{view.def.short}</span>
      <span className="mission-line__sep">·</span>
      <span className="mission-line__progress">{view.progress}</span>
      <span className="mission-line__sep">·</span>
      <span className="mission-line__objective">{view.objective}</span>
    </button>
  )
}
