import { useRef } from "react"
import { WORLD_HEIGHT, WORLD_WIDTH } from "../../config/world"
import { getSpace } from "../../data/spaces"
import { useExperienceEngine } from "../../hooks/useExperienceEngine"
import { DebugPanel } from "./DebugPanel"
import { FastMenu } from "./FastMenu"
import { HotspotLabel } from "./HotspotLabel"
import { ClickMarker, Player } from "./Player"
import { SpaceOverlay } from "./SpaceOverlay"
import { WorkshopSvg } from "./WorkshopSvg"
import { WorldHUD } from "./WorldHUD"

/**
 * El mundo espacial a pantalla completa: mapa SVG + visitante +
 * cámara + interfaz mínima. No hay scroll de navegador; todo el
 * recorrido sucede dentro de este viewport.
 */
export function WorkshopWorld() {
  const worldRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<SVGGElement>(null)
  const figureRef = useRef<SVGGElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<SVGGElement>(null)

  const engine = useExperienceEngine({ worldRef, playerRef, figureRef, labelRef, markerRef })

  const nearbySpace = engine.nearbySpaceId ? getSpace(engine.nearbySpaceId) : undefined
  const activeSpace = engine.activeSpaceId ? getSpace(engine.activeSpaceId) : undefined
  const labelVisible = nearbySpace && !activeSpace && !engine.menuOpen

  return (
    <div
      className="viewport"
      onPointerDown={engine.onWorldPointerDown}
      onPointerMove={engine.onWorldPointerMove}
      onContextMenu={engine.onWorldContextMenu}
    >
      <div
        ref={worldRef}
        className="world"
        style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}
      >
        <WorkshopSvg
          nearbySpaceId={engine.nearbySpaceId}
          showDebugLayer={engine.debugEnabled}
          onSpaceClick={(id) => engine.goToSpace(id)}
        >
          <ClickMarker markerRef={markerRef} />
          <Player playerRef={playerRef} figureRef={figureRef} />
        </WorkshopSvg>
      </div>

      {labelVisible && (
        <HotspotLabel space={nearbySpace} labelRef={labelRef} onOpen={engine.openSpace} />
      )}

      <WorldHUD hasMoved={engine.hasMoved} onReset={engine.resetToSpawn} />

      <FastMenu
        open={engine.menuOpen}
        setOpen={engine.setMenuOpen}
        onTravel={(id) => engine.goToSpace(id, { fast: true })}
        onDirect={engine.openSpace}
      />

      {activeSpace && (
        <SpaceOverlay
          space={activeSpace}
          onClose={engine.closeOverlay}
          onNavigate={engine.openSpace}
        />
      )}

      {engine.debugEnabled && <DebugPanel debug={engine.debug} />}
    </div>
  )
}
