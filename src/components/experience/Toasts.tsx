import { useEffect, useState } from "react"
import { subscribeToasts, type Toast } from "../../game/mission"

/** Feedback breve (+ MADERA · PIEZA 2/4 · COMPLETA). Desaparece solo. */
export function Toasts() {
  const [items, setItems] = useState<Toast[]>([])

  useEffect(() => {
    return subscribeToasts((t) => {
      setItems((prev) => [...prev.slice(-2), t])
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id))
      }, 2800)
    })
  }, [])

  if (items.length === 0) return null
  return (
    <div className="toasts" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind ?? "info"}`}>
          {t.text}
        </div>
      ))}
    </div>
  )
}
