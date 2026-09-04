import { useCallback, useEffect, useState } from "react"
import { Entrance } from "./components/experience/Entrance"
import { WorkshopWorld } from "./components/experience/WorkshopWorld"
import { ENTRANCE_GATE_MS, prefersReducedMotion } from "./config/world"
import { allSpriteSrcs } from "./data/assets"

type Phase = "entrance" | "entering" | "world"

/** Precarga los sprites del mundo antes de habilitar ENTRAR (§61). */
function preloadSprites(): Promise<void> {
  const srcs = allSpriteSrcs()
  return new Promise((resolve) => {
    let pending = srcs.length
    if (pending === 0) return resolve()
    const done = () => {
      pending -= 1
      if (pending <= 0) resolve()
    }
    srcs.forEach((src) => {
      const img = new Image()
      img.onload = done
      img.onerror = done
      img.src = src
    })
    window.setTimeout(resolve, 3000)
  })
}

export default function App() {
  const [phase, setPhase] = useState<Phase>("entrance")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    preloadSprites().then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])

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
      {phase !== "world" && <Entrance opening={phase === "entering"} ready={ready} onEnter={handleEnter} />}
    </div>
  )
}
