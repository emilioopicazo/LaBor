import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { isCoarsePointer } from "../../config/world"
import { DEFAULT_AVATAR } from "../../data/avatars"
import { getSpace } from "../../data/spaces"
import { gameCommands, gameEvents, type Interactable } from "../../game/bridge"
import { mission, missionView, useMissionRun } from "../../game/mission"
import { useProfile } from "../../game/profile"
import { AvatarSelector } from "../experience/AvatarSelector"
import { FastMenu } from "../experience/FastMenu"
import { MissionOverlay } from "../experience/MissionOverlay"
import { SpaceOverlay } from "../experience/SpaceOverlay"
import { Toasts } from "../experience/Toasts"
import { ActionButton } from "../hud/ActionButton"
import { AvatarChip } from "../hud/AvatarChip"
import { ControlsHint } from "../hud/ControlsHint"
import { DebugPanel } from "../hud/DebugPanel"
import { JoystickView } from "../hud/JoystickView"
import { MissionLine } from "../hud/MissionLine"
import { MinigameHost } from "../minigames/MinigameHost"
import type { MinigameId } from "../../game/minigames/contract"

type Overlay =
  | { type: "space"; id: string }
  | { type: "mission" }
  | { type: "minigame"; minigameId: MinigameId; stationId: string }
  | { type: "avatar" }

interface GameStageProps {
  /** el mundo recibe input (intro y selector cerrados) */
  active: boolean
}

/**
 * Monta Phaser dentro de React y le pone encima la interfaz mínima:
 * chip de avatar, línea de misión, menú, botón de acción y joystick.
 * Phaser manda eventos (acción cercana, interacción, escena) y React
 * decide qué significa cada uno: entrar, ver, jugar, instalar.
 */
export function GameStage({ active }: GameStageProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const prof = useProfile()
  const run = useMissionRun()
  const view = useMemo(() => missionView(run), [run])
  const coarse = useMemo(() => isCoarsePointer(), [])
  const [ready, setReady] = useState(false)
  const [sceneId, setSceneId] = useState("overworld")
  const [target, setTarget] = useState<Interactable | null>(null)
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const pendingTravel = useRef<string | null>(null)
  const debug = useMemo(() => new URLSearchParams(window.location.search).has("debug") || new URLSearchParams(window.location.search).get("mapdebug") === "1", [])

  // ---- montar / desmontar Phaser ------------------------------------------
  useEffect(() => {
    let cancelled = false
    let game: { destroy: (removeCanvas: boolean) => void } | null = null
    const host = hostRef.current
    if (!host) return
    import("../../game/phaser/createGame").then((m) => {
      if (cancelled || !host.isConnected) return
      game = m.createGame({
        parent: host,
        avatarId: prof.avatarId ?? DEFAULT_AVATAR,
        worldFlags: mission.get()?.temporaryWorldFlags ?? [],
      })
    })
    return () => {
      cancelled = true
      game?.destroy(true)
    }
    // solo al montar: avatar y banderas se sincronizan por comandos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- eventos del mundo -----------------------------------------------------
  const handleInteract = useCallback((t: Interactable) => {
    switch (t.kind) {
      case "door":
        if (t.action === "ENTRAR" && t.sceneId) gameCommands.enterRoom(t.sceneId)
        else if (t.spaceId) setOverlay({ type: "space", id: t.spaceId })
        return
      case "poi":
        if (t.id === "pieza-central") {
          const v = missionView(mission.get())
          if (v && v.installable.length > 0) {
            mission.installNext()
            return
          }
          setOverlay({ type: "mission" })
          return
        }
        setOverlay({ type: "space", id: t.id })
        return
      case "station":
        if (t.minigameId) setOverlay({ type: "minigame", minigameId: t.minigameId, stationId: t.id })
        return
      case "exit":
        gameCommands.exitRoom()
        return
      case "sign":
        if (t.spaceId) setOverlay({ type: "space", id: t.spaceId })
        return
    }
  }, [])

  useEffect(() => {
    const offs = [
      gameEvents.on("ready", ({ sceneId: id }) => {
        setReady(true)
        setSceneId(id)
        setTarget(null)
        const travel = pendingTravel.current
        if (travel && id === "overworld") {
          pendingTravel.current = null
          gameCommands.goTo(travel)
        }
      }),
      gameEvents.on("action", ({ target: t }) => setTarget(t)),
      gameEvents.on("interact", ({ target: t }) => handleInteract(t)),
      gameEvents.on("arrived", () => gameCommands.triggerAction()),
      gameEvents.on("moved", () => setHasMoved(true)),
      gameEvents.on("escape", () => {
        setOverlay(null)
        setMenuOpen(false)
      }),
    ]
    return () => offs.forEach((off) => off())
  }, [handleInteract])

  // ---- sincronía React → mundo ----------------------------------------------
  const paused = !active || overlay !== null || menuOpen
  useEffect(() => {
    gameCommands.setPaused(paused)
  }, [paused])

  useEffect(() => {
    gameCommands.setWorldFlags(run?.temporaryWorldFlags ?? [])
  }, [run?.temporaryWorldFlags])

  useEffect(() => {
    if (prof.avatarId) gameCommands.setAvatar(prof.avatarId)
  }, [prof.avatarId])

  useEffect(() => {
    if (!overlay) {
      gameCommands.focus(null)
      return
    }
    if (overlay.type === "space" || overlay.type === "mission" || overlay.type === "minigame") {
      gameCommands.focus(target ? { x: target.x, y: target.y } : null)
    }
    // solo al abrir/cerrar: el foco no debe seguir al objetivo mientras se lee
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay])

  // ---- navegación (menú) -------------------------------------------------------
  const travelTo = useCallback(
    (spaceId: string) => {
      setMenuOpen(false)
      setOverlay(null)
      const targetId = getSpace(spaceId)?.type === "available" || getSpace(spaceId)?.type === "resident" ? `${spaceId}-door` : spaceId
      if (sceneId !== "overworld") {
        pendingTravel.current = targetId
        gameCommands.exitRoom()
        return
      }
      gameCommands.goTo(targetId)
    },
    [sceneId],
  )

  const openDirect = useCallback((id: string) => {
    setMenuOpen(false)
    if (id === "pieza-central") setOverlay({ type: "mission" })
    else setOverlay({ type: "space", id })
  }, [])

  const closeOverlay = useCallback(() => setOverlay(null), [])

  // etiqueta del botón contextual: el mundo reporta el objetivo, React decide el verbo
  const actionLabel = useMemo(() => {
    if (!target) return null
    if (target.id === "pieza-central") return view && view.installable.length > 0 ? "INSTALAR" : run ? "VER" : "VER"
    return target.action
  }, [target, view, run])

  const activeSpace = overlay?.type === "space" ? getSpace(overlay.id) : undefined
  const inRoom = sceneId !== "overworld"
  const roomSpace = inRoom ? getSpace(sceneId.replace(/-room$/, "")) : undefined

  return (
    <div className={`stage${inRoom ? " stage--room" : ""}`}>
      <div ref={hostRef} className="stage__canvas" />

      {active && ready && (
        <div className="hud">
          <AvatarChip avatarId={prof.avatarId ?? DEFAULT_AVATAR} sceneName={roomSpace?.shortName ?? null} onClick={() => setOverlay({ type: "avatar" })} />
          {view && !overlay && <MissionLine view={view} onClick={() => setOverlay({ type: "mission" })} />}
          <FastMenu open={menuOpen} setOpen={setMenuOpen} onTravel={travelTo} onDirect={openDirect} onChangeAvatar={() => { setMenuOpen(false); setOverlay({ type: "avatar" }) }} />
          {!overlay && !menuOpen && <ActionButton label={actionLabel} caption={target?.label ?? null} coarse={coarse} onPress={() => gameCommands.triggerAction()} />}
          {coarse && <JoystickView />}
          {!hasMoved && !overlay && !menuOpen && <ControlsHint coarse={coarse} />}
        </div>
      )}

      {overlay?.type === "space" && activeSpace && (
        <SpaceOverlay
          space={activeSpace}
          onClose={closeOverlay}
          onNavigate={(id) => setOverlay({ type: "space", id })}
          onEnterScene={(id) => {
            setOverlay(null)
            gameCommands.enterRoom(id)
          }}
          currentSceneId={sceneId}
        />
      )}

      {overlay?.type === "mission" && <MissionOverlay onClose={closeOverlay} onGoTo={travelTo} />}

      {overlay?.type === "minigame" && (
        <MinigameHost minigameId={overlay.minigameId} onClose={closeOverlay} onExitRoom={() => { setOverlay(null); gameCommands.exitRoom() }} />
      )}

      {overlay?.type === "avatar" && <AvatarSelector mode="change" onClose={closeOverlay} />}

      <Toasts />

      {debug && ready && <DebugPanel onTravel={travelTo} onOpenMinigame={(id) => setOverlay({ type: "minigame", minigameId: id, stationId: "debug" })} />}
    </div>
  )
}
