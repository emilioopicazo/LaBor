import { useCallback, useEffect, useState } from "react"
import { Intro } from "./components/experience/Intro"
import { WorkshopWorld } from "./components/experience/WorkshopWorld"
import { ENTRANCE_GATE_MS, prefersReducedMotion } from "./config/world"
import { allSpriteSrcs } from "./data/assets"

type Phase = "intro" | "entering" | "world"

/** Precarga los sprites del mundo durante la intro (§61). */
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
  const [phase, setPhase] = useState<Phase>("intro")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    preloadSprites().then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])

  const handleIntroDone = useCallback(() => {
    setPhase((p) => (p === "intro" ? "entering" : p))
  }, [])

  useEffect(() => {
    if (phase !== "entering") return
    const duration = prefersReducedMotion() ? 180 : ENTRANCE_GATE_MS
    const t = window.setTimeout(() => setPhase("world"), duration)
    return () => window.clearTimeout(t)
  }, [phase])

  return (
    <div className="app">
      {phase !== "intro" && <WorkshopWorld />}
      {phase !== "world" && <Intro ready={ready} opening={phase === "entering"} onDone={handleIntroDone} />}
    </div>
  )
}
