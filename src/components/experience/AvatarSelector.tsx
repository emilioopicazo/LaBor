import { useCallback, useEffect, useRef, useState } from "react"
import { AVATARS, getAvatar, type AvatarId } from "../../data/avatars"
import { profile, useProfile } from "../../game/profile"
import { AvatarSprite } from "./AvatarSprite"

interface AvatarSelectorProps {
  /** "first": entrada (ELIGE TU PERSONAJE); "change": desde el menú (CAMBIAR PERSONAJE) */
  mode: "first" | "change"
  onConfirm?: (id: AvatarId) => void
  onClose?: () => void
}

/**
 * Selector de personaje: uno grande a la vez, flechas, swipe y una fila
 * de miniaturas. Cosmético: no cambia misión, recompensas ni posición.
 */
export function AvatarSelector({ mode, onConfirm, onClose }: AvatarSelectorProps) {
  const prof = useProfile()
  const startIdx = Math.max(0, AVATARS.findIndex((a) => a.id === (prof.avatarId ?? "creativa")))
  const [idx, setIdx] = useState(startIdx)
  const touch = useRef<{ x: number; t: number } | null>(null)
  const avatar = AVATARS[idx]

  const step = useCallback((d: number) => setIdx((i) => (i + d + AVATARS.length) % AVATARS.length), [])
  // pantallas bajas (teléfono horizontal): figura más chica para que quepa todo
  const [scale, setScale] = useState(() => (typeof window !== "undefined" && window.innerHeight < 520 ? 5 : 7))
  useEffect(() => {
    const onResize = () => setScale(window.innerHeight < 520 ? 5 : 7)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") step(-1)
      if (e.key === "ArrowRight") step(1)
      if (e.key === "Escape" && onClose) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [step, onClose])

  const confirm = () => {
    profile.setAvatar(avatar.id)
    onConfirm?.(avatar.id)
    onClose?.()
  }

  return (
    <div
      className={`selector selector--${mode}`}
      role="dialog"
      aria-modal="true"
      aria-label="Elige tu personaje"
      onPointerDown={(e) => {
        touch.current = { x: e.clientX, t: Date.now() }
      }}
      onPointerUp={(e) => {
        const t = touch.current
        touch.current = null
        if (!t) return
        const dx = e.clientX - t.x
        if (Math.abs(dx) > 48 && Date.now() - t.t < 700) step(dx < 0 ? 1 : -1)
      }}
    >
      <div className="selector__panel">
        <header className="selector__header">
          <p className="selector__kicker">{mode === "first" ? "ANTES DE ENTRAR" : "PERFIL"}</p>
          <h2 className="selector__title">{mode === "first" ? "ELIGE TU PERSONAJE" : "CAMBIAR PERSONAJE"}</h2>
          {onClose && (
            <button type="button" className="overlay__close" onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          )}
        </header>

        <div className="selector__stage">
          <button type="button" className="selector__arrow" onClick={() => step(-1)} aria-label="Anterior">
            ‹
          </button>
          <div className="selector__figure" key={avatar.id}>
            <AvatarSprite avatar={avatar} scale={scale} walking />
            <span className="selector__shadow" />
          </div>
          <button type="button" className="selector__arrow" onClick={() => step(1)} aria-label="Siguiente">
            ›
          </button>
        </div>

        <p className="selector__name" style={{ color: avatar.accent }}>
          {avatar.name}
        </p>
        <p className="selector__descriptor">{avatar.descriptor}</p>

        <div className="selector__thumbs" role="tablist" aria-label="Personajes">
          {AVATARS.map((a, i) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={i === idx}
              className={`selector__thumb${i === idx ? " is-active" : ""}`}
              onClick={() => setIdx(i)}
              title={a.name}
            >
              <AvatarSprite avatar={a} scale={2} />
            </button>
          ))}
        </div>

        <button type="button" className="selector__confirm" onClick={confirm}>
          {mode === "first" ? "ELEGIR Y ENTRAR" : getAvatar(prof.avatarId).id === avatar.id ? "SEGUIR CON ESTE" : "ELEGIR"}
        </button>
        <p className="selector__note">Solo cambia el look: misma velocidad, mismas misiones.</p>
      </div>
    </div>
  )
}
