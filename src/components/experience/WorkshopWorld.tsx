import { useCallback, useEffect, useRef } from "react"
import { SCENES, type WorkshopStation } from "../../data/scenes"
import { getSpace } from "../../data/spaces"
import { discoverPieza, onBaseCrafted } from "../../game/quests"
import { game, useGameState } from "../../game/state"
import { OVERWORLD_ID, useExperienceEngine } from "../../hooks/useExperienceEngine"
import { DebugPanel } from "./DebugPanel"
import { FastMenu } from "./FastMenu"
import { HotspotLabel } from "./HotspotLabel"
import { PiezaOverlay } from "./PiezaOverlay"
import { ClickMarker, Player } from "./Player"
import { SpaceOverlay } from "./SpaceOverlay"
import { StationPanel } from "./StationPanel"
import { Toasts } from "./Toasts"
import { WorkshopRoomSvg } from "./WorkshopRoomSvg"
import { WorkshopSvg } from "./WorkshopSvg"
import { WorldHUD } from "./WorldHUD"

/**
 * El mundo espacial a pantalla completa: patio o cuarto de taller +
 * visitante + cámara + interfaz mínima. No hay scroll de navegador;
 * todo el recorrido sucede dentro de este viewport.
 */
export function WorkshopWorld() {
  const worldRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<SVGGElement>(null)
  const figureRef = useRef<SVGGElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<SVGGElement>(null)

  const engine = useExperienceEngine({ worldRef, playerRef, figureRef, labelRef, markerRef })
  const save = useGameState()

  const inRoom = engine.sceneId !== OVERWORLD_ID
  const roomDef = inRoom ? SCENES[engine.sceneId] : undefined
  const activeSpace = engine.activeSpaceId ? getSpace(engine.activeSpaceId) : undefined
  const activeStation = roomDef && engine.activeStationId ? roomDef.stations.find((s) => s.id === engine.activeStationId) : undefined
  const labelVisible = engine.nearbyPoi && !activeSpace && !activeStation && !engine.menuOpen && !engine.transitioning

  // Descubrir el sitio de la instalación al acercarse por primera vez
  useEffect(() => {
    if (engine.nearbyPoiId === "pieza") discoverPieza()
  }, [engine.nearbyPoiId])

  const handleCraft = useCallback((station: WorkshopStation) => {
    if (station.craft.componentId === "base-madera") {
      onBaseCrafted()
      return
    }
    game.grantComponent(station.craft.componentId)
    game.toast(`+ ${station.craft.label}`, "material")
    game.addOficio(station.craft.oficio)
    game.toast(`+${station.craft.oficio} OFICIO`, "oficio")
  }, [])

  const player = <Player playerRef={playerRef} figureRef={figureRef} />
  const marker = <ClickMarker markerRef={markerRef} />

  return (
    <div
      className={`viewport${inRoom ? " viewport--room" : ""}`}
      onPointerDown={engine.onWorldPointerDown}
      onPointerMove={engine.onWorldPointerMove}
      onContextMenu={engine.onWorldContextMenu}
    >
      <div ref={worldRef} className="world" style={{ width: engine.runtime.width, height: engine.runtime.height }}>
        {roomDef ? (
          <WorkshopRoomSvg
            scene={roomDef}
            pois={engine.runtime.pois}
            nearbyPoiId={engine.nearbyPoiId}
            playerDepthIndex={engine.playerDepthIndex}
            showDebugLayer={engine.debugEnabled}
            geo={engine.runtime.geo}
            onPoiClick={(id) => engine.goToPoi(id)}
            marker={marker}
            player={player}
          />
        ) : (
          <WorkshopSvg
            pois={engine.runtime.pois}
            nearbyPoiId={engine.nearbyPoiId}
            playerDepthIndex={engine.playerDepthIndex}
            showDebugLayer={engine.debugEnabled}
            geo={engine.runtime.geo}
            worldFlags={save.flags}
            onSpaceClick={(id) => engine.goToSpace(id)}
            onPoiClick={(id) => engine.goToPoi(id)}
            marker={marker}
            player={player}
          />
        )}
      </div>

      <div className={`scene-fade${engine.transitioning ? " is-active" : ""}`} aria-hidden="true" />

      {labelVisible && engine.nearbyPoi && (
        <HotspotLabel
          name={engine.nearbyPoi.name}
          action={engine.nearbyPoi.action}
          labelRef={labelRef}
          onOpen={() => engine.activatePoi(engine.nearbyPoi!.id)}
        />
      )}

      <WorldHUD hasMoved={engine.hasMoved} oficio={save.oficio} sceneName={roomDef?.name ?? null} onReset={engine.resetToSpawn} />

      <FastMenu
        open={engine.menuOpen}
        setOpen={engine.setMenuOpen}
        onTravel={(id) => engine.goToSpace(id, { fast: true })}
        onDirect={engine.openSpace}
      />

      {activeSpace && activeSpace.id === "pieza" && (
        <PiezaOverlay onClose={engine.closeOverlay} onGoTo={(id) => engine.goToSpace(id, { fast: true })} />
      )}

      {activeSpace && activeSpace.id !== "pieza" && (
        <SpaceOverlay
          space={activeSpace}
          onClose={engine.closeOverlay}
          onNavigate={engine.openSpace}
          onEnterScene={(sceneId) => engine.enterScene(sceneId)}
        />
      )}

      {activeStation && roomDef && (
        <StationPanel
          station={activeStation}
          sceneName={roomDef.name}
          onCraft={handleCraft}
          onClose={engine.closeStation}
          onExit={engine.exitScene}
        />
      )}

      <Toasts />

      {engine.debugEnabled && <DebugPanel debug={engine.debug} save={save} onReset={() => game.reset()} />}
    </div>
  )
}
