import type { SaveState } from "../../game/state"
import type { DebugInfo } from "../../hooks/useExperienceEngine"

/**
 * Panel de calibración. Se activa con DEBUG_WORLD=true en
 * src/config/world.ts o con ?debug en la URL. El clic derecho
 * sobre el mundo imprime la coordenada en consola y aquí.
 */
export function DebugPanel({ debug, save, onReset }: { debug: DebugInfo | null; save: SaveState; onReset: () => void }) {
  if (!debug) return null
  const flags = Object.entries(save.flags)
    .filter(([, v]) => v)
    .map(([k]) => k)
  return (
    <div className="debug-panel">
      <p className="debug-panel__title">DEBUG — LA BOR</p>
      <table>
        <tbody>
          <tr>
            <td>scene</td>
            <td>{debug.scene}</td>
          </tr>
          <tr>
            <td>player</td>
            <td>
              {debug.player.x}, {debug.player.y}
            </td>
          </tr>
          <tr>
            <td>target</td>
            <td>{debug.target ? `${debug.target.x}, ${debug.target.y}` : "—"}</td>
          </tr>
          <tr>
            <td>camera</td>
            <td>
              {debug.camera.x}, {debug.camera.y} · z {debug.camera.zoom}
            </td>
          </tr>
          <tr>
            <td>mouse</td>
            <td>{debug.mouseWorld ? `${debug.mouseWorld.x}, ${debug.mouseWorld.y}` : "—"}</td>
          </tr>
          <tr>
            <td>depth</td>
            <td>
              idx {debug.depthIndex} · near {debug.nearby ?? "—"}
            </td>
          </tr>
          <tr>
            <td>fps</td>
            <td>{debug.fps}</td>
          </tr>
          <tr>
            <td>inv</td>
            <td>
              {save.inventory.components.join(", ") || "—"} · oficio {save.oficio}
            </td>
          </tr>
          <tr>
            <td>flags</td>
            <td>{flags.join(", ") || "—"}</td>
          </tr>
          {debug.lastLogged && (
            <tr>
              <td>logged</td>
              <td>
                {debug.lastLogged.x}, {debug.lastLogged.y}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="debug-panel__hint">clic derecho = log coordenada</p>
      <button type="button" className="debug-panel__reset" onPointerDown={(e) => e.stopPropagation()} onClick={onReset}>
        RESET SAVE
      </button>
    </div>
  )
}
