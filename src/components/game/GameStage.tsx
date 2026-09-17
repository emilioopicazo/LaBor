import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { isCoarsePointer } from "../../config/world"
import { DEFAULT_AVATAR } from "../../data/avatars"
import { eventShortLabel, nextEvent } from "../../data/events"
import { EventPopup } from "../experience/EventPopup"
import { PersonOverlay } from "../experience/PersonOverlay"
import { ROOMS } from "../../data/rooms"
import { SPACES, getSpace } from "../../data/spaces"
import { gameCommands, gameEvents, type Interactable, type MarkerState } from "../../game/bridge"
import { mission, missionView, toast, useMissionRun } from "../../game/mission"
import { profile, useProfile } from "../../game/profile"
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
import { pickMinigame, type MinigameId } from "../../game/minigames/contract"

type Overlay =
  | { type: "space"; id: string }
  | { type: "mission" }
  | { type: "minigame"; minigameId: MinigameId; stationId: string }
  | { type: "avatar" }
  | { type: "event" }
  | { type: "person"; spaceId: string }

interface GameStageProps {
  /** el mundo recibe input (intro y selector cerrados) */
  active: boolean
  /** el portón se está abriendo: momento de la llegada visible */
  opening?: boolean
}

/**
 * Monta Phaser dentro de React y le pone encima la interfaz mínima:
 * chip de avatar, línea de misión, menú, botón de acción y joystick.
 * Phaser manda eventos (acción cercana, interacción, escena) y React
 * decide qué significa cada uno: entrar, ver, jugar, instalar.
 */
export function GameStage({ active, opening = false }: GameStageProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const prof = useProfile()
  const run = useMissionRun()
  const view = useMemo(() => missionView(run), [run])
  const coarse = useMemo(() => isCoarsePointer(), [])
  const [ready, setReady] = useState(false)
  const [sceneId, setSceneId] = useState("overworld")
  const [target, setTarget] = useState<Interactable | null>(null)
  const [overlay, setOverlay] = useState<Overlay | null>(null)
  // el "!" del letrero de eventos se apaga cuando se abre el anuncio (una vez por visita)
  const [noticeSeen, setNoticeSeen] = useState(false)
  const openEvent = useCallback(() => {
    setNoticeSeen(true)
    setOverlay({ type: "event" })
  }, [])
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
        if (t.id === "eventos-board") {
          openEvent()
          return
        }
        setOverlay({ type: "space", id: t.id })
        return
      case "station":
        // dos juegos por taller: se elige uno al azar en cada visita a la estación
        if (t.minigameIds && t.minigameIds.length > 0) setOverlay({ type: "minigame", minigameId: pickMinigame(t.minigameIds), stationId: t.id })
        return
      case "exit":
        gameCommands.exitRoom()
        return
      case "sign":
        if (t.spaceId) setOverlay({ type: "space", id: t.spaceId })
        return
      case "person":
        if (t.spaceId) setOverlay({ type: "person", spaceId: t.spaceId })
        return
    }
  }, [openEvent])

  useEffect(() => {
    const offs = [
      gameEvents.on("ready", ({ sceneId: id, spaceId }) => {
        setReady(true)
        setSceneId(id)
        setTarget(null)
        if (spaceId) profile.markVisited(spaceId)
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

  // llegada visible: cuando el portón se abre (o, si algo falla, al activarse el mundo)
  const arrived = useRef(false)
  useEffect(() => {
    if (!(opening || active) || arrived.current) return
    arrived.current = true
    gameCommands.arrive()
  }, [opening, active])
  useEffect(() => {
    gameCommands.setPaused(paused)
  }, [paused])

  // balizas (✓ hecho / ◆ objetivo) y chevrón de guía, a partir de misión + visitados
  useEffect(() => {
    const states: Record<string, MarkerState> = {}
    const comps = view?.def.components ?? []
    const won = (spaceId: string) => {
      const c = comps.find((x) => x.spaceId === spaceId)
      return !!c && !!run && (run.temporaryInventory.includes(c.id) || run.installed.includes(c.id))
    }
    const targetSpace = view && !view.complete ? view.targetSpaceId : null
    // paso final: ya se ganaron los tres componentes → toca instalar en el pedestal
    const finalStep = !!view && !view.complete && view.currentComponentId === null
    let guide: string | null = null
    if (sceneId === "overworld") {
      SPACES.forEach((sp) => {
        const id = `${sp.id}-door`
        if (sp.type === "resident" && won(sp.id)) states[id] = "done"
        else if (prof.visited.includes(sp.id) && sp.type !== "resident") states[id] = "done"
        if (targetSpace === sp.id) states[id] = "target"
      })
      if (view?.complete) states["pieza-central"] = "done"
      else if (!run || finalStep) states["pieza-central"] = "target"
      guide = !run ? "pieza-central" : view?.complete ? null : finalStep ? "pieza-central" : targetSpace ? `${targetSpace}-door` : null
      // novedad en el letrero de eventos: "!" hasta que se abre el anuncio
      if (nextEvent() && !noticeSeen) states["eventos-board"] = "notice"
    } else {
      const spaceId = sceneId.replace(/-room$/, "")
      const st = ROOMS[sceneId]?.stations[0]
      if (st) {
        if (won(spaceId)) states[st.id] = "done"
        else if (targetSpace === spaceId) states[st.id] = "target"
        guide = targetSpace === spaceId && !won(spaceId) ? st.id : run ? "exit" : null
      } else guide = null
    }
    gameCommands.setMarkers(states)
    gameCommands.setGuide(guide)
  }, [view, run, sceneId, prof.visited, ready, noticeSeen])

  // próximo evento: un aviso breve al entrar al patio (una vez por sesión)
  const eventToasted = useRef(false)
  useEffect(() => {
    if (!active || !ready || eventToasted.current) return
    eventToasted.current = true
    const ev = nextEvent()
    if (ev) window.setTimeout(() => toast(`${ev.kind} ${ev.name} · ${eventShortLabel(ev)} · ¡MIRA EL LETRERO!`, "quest"), 2500)
  }, [active, ready])

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
    else if (id === "eventos-board") openEvent()
    else setOverlay({ type: "space", id })
  }, [openEvent])

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

      {overlay?.type === "event" && <EventPopup onClose={closeOverlay} />}

      {overlay?.type === "person" && getSpace(overlay.spaceId) && (
        <PersonOverlay space={getSpace(overlay.spaceId)!} onClose={closeOverlay} onViewSpace={(id) => setOverlay({ type: "space", id })} />
      )}

      {overlay?.type === "minigame" && (
        <MinigameHost minigameId={overlay.minigameId} onClose={closeOverlay} onExitRoom={() => { setOverlay(null); gameCommands.exitRoom() }} />
      )}

      {overlay?.type === "avatar" && <AvatarSelector mode="change" onClose={closeOverlay} />}

      <Toasts />

      {debug && ready && !overlay && !menuOpen && <DebugPanel onTravel={travelTo} onOpenMinigame={(id) => setOverlay({ type: "minigame", minigameId: id, stationId: "debug" })} />}
    </div>
  )
}
