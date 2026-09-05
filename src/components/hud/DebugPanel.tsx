import { useEffect, useState } from "react"
import { PIEZA_CENTRAL } from "../../data/missions"
import { gameCommands, gameEvents } from "../../game/bridge"
import { mission, useMissionRun } from "../../game/mission"
import type { MinigameId } from "../../game/minigames/contract"
import { profile } from "../../game/profile"

interface DebugPanelProps {
  onTravel: (spaceId: string) => void
  onOpenMinigame: (id: MinigameId) => void
}

/** Menú de desarrollo (?debug / ?mapdebug=1): atajos de misión y posición. */
export function DebugPanel({ onTravel, onOpenMinigame }: DebugPanelProps) {
  const run = useMissionRun()
  const [pos, setPos] = useState({ x: 0, y: 0, sceneId: "" })
  useEffect(() => gameEvents.on("player", (p) => setPos({ x: Math.round(p.x), y: Math.round(p.y), sceneId: p.sceneId })), [])
  const B = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button type="button" className="debug-panel__btn" onClick={onClick}>
      {label}
    </button>
  )
  return (
    <aside className="debug-panel" aria-label="Debug">
      <p className="debug-panel__title">
        DEBUG · {pos.sceneId} · {pos.x},{pos.y} · {(pos.x / 48).toFixed(1)}m,{(pos.y / 48).toFixed(1)}m
      </p>
      <p className="debug-panel__hint">
        run: {run ? `${run.runId} · paso ${run.currentStep} · inv [${run.temporaryInventory.join(",")}] · inst [${run.installed.join(",")}]` : "—"}
      </p>
      <div className="debug-panel__row">
        <B label="START MISSION" onClick={() => mission.startMission(PIEZA_CENTRAL.id)} />
        <B label="RESTART" onClick={() => mission.restartMission()} />
        <B label="SKIP STEP" onClick={() => mission.debugSkipStep()} />
        <B label="CLEAR RUN" onClick={() => mission.clearRun()} />
        <B label="RESET PROFILE" onClick={() => profile.reset()} />
      </div>
      <div className="debug-panel__row">
        {PIEZA_CENTRAL.components.map((c) => (
          <B key={c.id} label={`GIVE ${c.short}`} onClick={() => mission.debugGive(c.id)} />
        ))}
        <B label="INSTALL" onClick={() => mission.installNext()} />
      </div>
      <div className="debug-panel__row">
        <B label="OPEN GATO" onClick={() => onOpenMinigame("gato")} />
        <B label="OPEN CONECTA 4" onClick={() => onOpenMinigame("conecta4")} />
        <B label="OPEN MEMORIA" onClick={() => onOpenMinigame("memoria")} />
      </div>
      <div className="debug-panel__row">
        {["veta", "mannno", "contraste", "pabellon-01", "nave-02"].map((id) => (
          <B key={id} label={`→ ${id}`} onClick={() => onTravel(id)} />
        ))}
        <B label="→ PIEZA" onClick={() => gameCommands.goTo("pieza-central")} />
        <B label="EXIT ROOM" onClick={() => gameCommands.exitRoom()} />
      </div>
    </aside>
  )
}
