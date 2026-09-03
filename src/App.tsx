import { useCallback, useEffect, useState } from "react"
import { Entrance } from "./components/experience/Entrance"
import { WorkshopWorld } from "./components/experience/WorkshopWorld"
import { ENTRANCE_GATE_MS, prefersReducedMotion } from "./config/world"

type Phase = "entrance" | "entering" | "world"

export default function App() {
  const [phase, setPhase] = useState<Phase>("entrance")

  const handleEnter = useCallback(() => {
    setPhase((p) => (p === "entrance" ? "entering" : p))
  }, [])

  useEffect(() => {
    if (phase !== "entering") return
    const duration = prefersReducedMotion() ? 180 : ENTRANCE_GATE_MS
    const t = window.setTimeout(() => setPhase("world"), duration)
    return () => window.clearTimeout(t)
  }, [phase])

  return (
    <div className="app">
      {phase !== "entrance" && <WorkshopWorld />}
      {phase !== "world" && <Entrance opening={phase === "entering"} onEnter={handleEnter} />}
    </div>
  )
}
