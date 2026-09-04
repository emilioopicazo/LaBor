import { useEffect, useState } from "react"
import { INTRO_TEXT_MS, INTRO_TITLE_MS, LOCATION } from "../../config/world"

interface IntroProps {
  /** sprites precargados */
  ready: boolean
  /** portón abriéndose (fase de entrada) */
  opening: boolean
  onDone: () => void
}

type Stage = "title" | "text"

/**
 * Intro automática: LA BOR → qué es La Bor → el portón se abre.
 * No hay que picar: cada pantalla se desvanece sola después de
 * unos segundos (suficiente para leerla). Tocar / clic adelanta.
 */
export function Intro({ ready, opening, onDone }: IntroProps) {
  const [stage, setStage] = useState<Stage>("title")

  useEffect(() => {
    if (opening) return
    if (stage === "title") {
      const t = window.setTimeout(() => setStage("text"), INTRO_TITLE_MS)
      return () => window.clearTimeout(t)
    }
    if (!ready) return
    const t = window.setTimeout(onDone, INTRO_TEXT_MS)
    return () => window.clearTimeout(t)
  }, [stage, ready, opening, onDone])

  const skip = () => {
    if (opening) return
    if (stage === "title") setStage("text")
    else if (ready) onDone()
  }

  return (
    <div
      className={`entrance${opening ? " entrance--opening" : ""}`}
      aria-hidden={opening}
      onPointerDown={skip}
      role="presentation"
    >
      <div className="entrance__panel entrance__panel--left" />
      <div className="entrance__panel entrance__panel--right" />
      <div className="entrance__seam" />

      <div className={`entrance__content${stage === "title" ? " is-visible" : ""}`} aria-hidden={stage !== "title"}>
        <p className="entrance__kicker">TALLERES</p>
        <h1 className="entrance__title">LA&nbsp;BOR</h1>
        <p className="entrance__place">TULUM, QROO.</p>
      </div>

      <div className={`intro${stage === "text" ? " is-visible" : ""}`} aria-hidden={stage !== "text"}>
        <p className="intro__kicker">LA BOR — TALLERES</p>
        <p className="intro__text">
          Un complejo de talleres creativos en Tulum. Siete talleres y tres naves alrededor de un patio
          compartido: joyería, carpintería, herrería y espacios abiertos a nuevos oficios.
        </p>
        <p className="intro__text intro__text--strong">Esto no es un sitio web. Es el taller. Recórrelo.</p>
        <div className="intro__progress" aria-hidden="true">
          <span
            className={ready ? "is-running" : ""}
            style={{ animationDuration: `${INTRO_TEXT_MS}ms` }}
          />
        </div>
        <p className="intro__hint">{ready ? "TOCA PARA ENTRAR" : "• • •"}</p>
      </div>

      <p className="entrance__coords">
        {LOCATION.lat.toFixed(7)}, {LOCATION.lng.toFixed(7)}
      </p>
    </div>
  )
}
