import { useEffect, useRef } from "react"
import { gameEvents } from "../../game/bridge"

/** Visual del joystick flotante: aparece donde cae el pulgar y desaparece al soltar. */
export function JoystickView() {
  const ring = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return gameEvents.on("joystick", (s) => {
      const r = ring.current
      const k = knob.current
      if (!r || !k) return
      if (!s.active) {
        r.classList.remove("is-active")
        return
      }
      r.classList.add("is-active")
      r.style.transform = `translate(${s.ox}px, ${s.oy}px)`
      k.style.transform = `translate(${s.kx - s.ox}px, ${s.ky - s.oy}px)`
    })
  }, [])

  return (
    <div ref={ring} className="joy" aria-hidden="true">
      <div ref={knob} className="joy__knob" />
    </div>
  )
}
