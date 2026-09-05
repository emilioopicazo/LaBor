import { useCallback, useEffect, useState } from "react"
import { GameStage } from "./components/game/GameStage"
import { AvatarSelector } from "./components/experience/AvatarSelector"
import { Intro } from "./components/experience/Intro"
import { ENTRANCE_GATE_MS, prefersReducedMotion } from "./config/world"
import { useProfile } from "./game/profile"

type Phase = "intro" | "avatar" | "entering" | "world"

/**
 * INTRO → (ELIGE TU PERSONAJE la primera vez) → el portón se abre → patio.
 * El mundo (Phaser) se monta desde el principio, detrás de la intro, para
 * que cargue mientras se lee; recibe input solo en la fase "world".
 */
export default function App() {
  const [phase, setPhase] = useState<Phase>("intro")
  const prof = useProfile()

  const handleIntroDone = useCallback(() => {
    setPhase((p) => (p === "intro" ? (prof.avatarId ? "entering" : "avatar") : p))
  }, [prof.avatarId])

  useEffect(() => {
    if (phase !== "entering") return
    const duration = prefersReducedMotion() ? 180 : ENTRANCE_GATE_MS
    const t = window.setTimeout(() => setPhase("world"), duration)
    return () => window.clearTimeout(t)
  }, [phase])

  return (
    <div className="app">
      <GameStage active={phase === "world"} />
      {phase === "avatar" && <AvatarSelector mode="first" onConfirm={() => setPhase("entering")} />}
      {phase !== "world" && <Intro ready opening={phase === "entering"} hidden={phase === "avatar"} onDone={handleIntroDone} />}
    </div>
  )
}
