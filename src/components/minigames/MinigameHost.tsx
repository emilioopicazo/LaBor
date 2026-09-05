import { useCallback, useEffect, useRef, useState } from "react"
import { MINIGAMES, type MinigameId, type MinigameResult } from "../../game/minigames/contract"
import { mission } from "../../game/mission"
import { ConnectFourBoard } from "./ConnectFourBoard"
import { MemoryBoard } from "./MemoryBoard"
import { TicTacToeBoard } from "./TicTacToeBoard"

interface MinigameHostProps {
  minigameId: MinigameId
  onClose: () => void
  onExitRoom: () => void
}

/**
 * Anfitrión de minijuegos: título + una frase, el tablero, y al terminar
 * el resultado con OTRA VEZ / VOLVER AL TALLER. El tablero devuelve un
 * MinigameResult; el controlador de misión decide la recompensa.
 */
export function MinigameHost({ minigameId, onClose, onExitRoom }: MinigameHostProps) {
  const meta = MINIGAMES[minigameId]
  const [round, setRound] = useState(0)
  const [result, setResult] = useState<{ res: MinigameResult; message: string; rewarded: string | null } | null>(null)
  const startedAt = useRef(Date.now())

  useEffect(() => {
    startedAt.current = Date.now()
    setResult(null)
  }, [round])

  const handleComplete = useCallback(
    (success: boolean, score?: number) => {
      const res: MinigameResult = { gameId: minigameId, success, score, durationMs: Date.now() - startedAt.current }
      const verdict = mission.onMinigameResult(minigameId, res)
      setResult({ res, message: verdict.message, rewarded: verdict.rewarded })
    },
    [minigameId],
  )

  return (
    <div className={`minigame minigame--${minigameId}`} role="dialog" aria-modal="true" aria-label={meta.title}>
      <div className="minigame__panel">
        <header className="minigame__header">
          <div>
            <p className="minigame__kicker">{meta.spaceId.toUpperCase()} · MINIJUEGO</p>
            <h2 className="minigame__title">{meta.title}</h2>
          </div>
          <button type="button" className="overlay__close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>
        <p className="minigame__hint">{meta.hint}</p>

        <div className="minigame__board" key={round}>
          {minigameId === "gato" && <TicTacToeBoard onComplete={handleComplete} />}
          {minigameId === "conecta4" && <ConnectFourBoard onComplete={handleComplete} />}
          {minigameId === "memoria" && <MemoryBoard onComplete={handleComplete} />}
        </div>

        {result && (
          <div className={`minigame__result${result.res.success ? " is-success" : ""}`} role="status">
            <p className="minigame__result-text">{result.message}</p>
            <div className="minigame__actions">
              {result.rewarded ? (
                <button type="button" className="overlay__cta overlay__cta--primary" onClick={onExitRoom}>
                  VOLVER AL PATIO ↗
                </button>
              ) : (
                <button type="button" className="overlay__cta overlay__cta--primary" onClick={() => setRound((r) => r + 1)}>
                  OTRA VEZ
                </button>
              )}
              <button type="button" className="overlay__cta" onClick={onClose}>
                VOLVER AL TALLER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
