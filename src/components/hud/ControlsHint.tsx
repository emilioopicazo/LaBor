import { useEffect, useState } from "react"

/** Guía de primer uso; se retira sola al primer movimiento o a los 7 s. */
export function ControlsHint({ coarse }: { coarse: boolean }) {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setGone(true), 7000)
    return () => window.clearTimeout(t)
  }, [])
  if (gone) return null
  return (
    <p className="hint">
      {coarse ? "PULGAR IZQUIERDO: CAMINAR · BOTÓN DERECHO: ACTUAR" : "WASD / FLECHAS: CAMINAR · E: ACTUAR · CLIC: IR AHÍ"}
    </p>
  )
}
