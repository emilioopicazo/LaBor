import { useEffect, useMemo, useState } from "react"
import { INTRO_AUTO_MS, INTRO_RETURN_MS, INTRO_SEEN_KEY, LOCATION } from "../../config/world"
import { PLAN } from "../../data/plan.generated"
import { CONTACT, whatsappLink } from "../../data/spaces"

interface IntroProps {
  /** sprites precargados */
  ready: boolean
  /** portón abriéndose (fase de entrada) */
  opening: boolean
  /** contenido oculto (el selector de personaje va encima) */
  hidden?: boolean
  onDone: () => void
}

/** 1 m del plano = PX px del SVG (el viewBox se calcula del predio + calle) */
const PX = 10
const PAD = 1.2

function hasSeenIntro(): boolean {
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) === "1"
  } catch {
    return false
  }
}

function markSeenIntro() {
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, "1")
  } catch {
    // sin almacenamiento: el intro se repite, nada más
  }
}

/**
 * Intro como hoja de plano: el predio real se dibuja solo (trazo),
 * los edificios se etiquetan uno a uno y el visitante aparece en el
 * INGRESO. Un dato de renta, un botón. Tocar entra; si no, el portón
 * se abre solo. Quien ya entró antes casi no espera.
 */
export function Intro({ ready, opening, hidden = false, onDone }: IntroProps) {
  const returning = useMemo(() => hasSeenIntro(), [])
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setDrawn(true), 1500)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (opening || !ready) return
    const t = window.setTimeout(() => {
      markSeenIntro()
      onDone()
    }, returning ? INTRO_RETURN_MS : INTRO_AUTO_MS)
    return () => window.clearTimeout(t)
  }, [ready, opening, onDone, returning])

  const enter = () => {
    if (opening || !ready) return
    markSeenIntro()
    onDone()
  }

  // geometría del plano (metros → px del SVG)
  const xs = [...PLAN.boundary.map((p) => p[0]), PLAN.streetX]
  const ys = PLAN.boundary.map((p) => p[1])
  const minX = Math.min(...xs) - PAD
  const minY = Math.min(...ys) - PAD
  const w = Math.max(...xs) - minX + PAD
  const h = Math.max(...ys) - minY + PAD
  const X = (m: number) => ((m - minX) * PX).toFixed(1)
  const Y = (m: number) => ((m - minY) * PX).toFixed(1)
  const pts = (poly: ReadonlyArray<readonly [number, number]>) => poly.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")
  const centroid = (poly: ReadonlyArray<readonly [number, number]>) => {
    const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length
    const cy = poly.reduce((a, p) => a + p[1], 0) / poly.length
    return { x: Number(X(cx)), y: Number(Y(cy)) }
  }
  const shortLabel = (label: string) => label.replace("PABELLÓN ", "P").replace("PRÓXIMAMENTE", "")

  return (
    <div
      className={`entrance${opening ? " entrance--opening" : ""}${hidden ? " entrance--hidden" : ""}${drawn ? " entrance--drawn" : ""}`}
      aria-hidden={opening}
      onPointerDown={enter}
      role="presentation"
    >
      <div className="entrance__panel entrance__panel--left" />
      <div className="entrance__panel entrance__panel--right" />
      <div className="entrance__seam" />

      <div className="plan" aria-label="Plano de La Bor">
        <header className="plan__head">
          <p className="plan__brand">LA BOR</p>
          <p className="plan__sub">TALLERES · LA VELETA, TULUM</p>
        </header>

        <svg className="plan__svg" viewBox={`0 0 ${(w * PX).toFixed(0)} ${(h * PX).toFixed(0)}`} role="img" aria-hidden="true">
          {/* calle 12 sur */}
          <rect className="plan__street" x={X(34.9)} y={Y(minY + PAD)} width={((PLAN.streetX - 34.9 + PAD) * PX).toFixed(1)} height={((h - PAD) * PX).toFixed(1)} />
          <text className="plan__street-label" x={X(37.2)} y={Y(13)} transform={`rotate(90 ${X(37.2)} ${Y(13)})`}>
            CALLE 12 SUR
          </text>
          {/* predio */}
          <polygon className="plan__boundary" points={pts(PLAN.boundary)} />
          {/* edificios */}
          {PLAN.buildings.map((b, i) => (
            <polygon
              key={b.id}
              className={`plan__building${b.interior ? " is-open" : ""}${b.construction ? " is-site" : ""}${!b.enterable ? " is-soon" : ""}`}
              points={pts(b.poly)}
              style={{ animationDelay: `${160 + i * 70}ms` }}
            />
          ))}
          {/* árbol */}
          <circle className="plan__tree" cx={X(PLAN.tree.x)} cy={Y(PLAN.tree.y)} r={(PLAN.tree.r * PX).toFixed(1)} />
          {/* etiquetas */}
          {PLAN.buildings.map((b, i) => {
            const c = centroid(b.poly)
            const label = shortLabel(b.label)
            if (!label) return null
            return (
              <text key={`${b.id}-t`} className={`plan__label${b.construction ? " is-site" : ""}`} x={c.x} y={c.y + 3} style={{ animationDelay: `${900 + i * 90}ms` }}>
                {label}
                {b.construction && (
                  <tspan x={c.x} dy="11" className="plan__label-meta">
                    EN OBRA
                  </tspan>
                )}
              </text>
            )
          })}
          {/* tú estás aquí: el ingreso */}
          <g transform={`translate(${X(PLAN.ingreso.x)} ${Y(PLAN.ingreso.y)})`}>
            <g className="plan__you">
              <circle className="plan__you-ring" r="9" />
              <circle className="plan__you-dot" r="3.2" />
              <text className="plan__you-label" x="13" y="3.5">
                INGRESO
              </text>
            </g>
          </g>
        </svg>

        <p className="plan__facts">CARPINTERÍA · HERRERÍA · JOYERÍA · PABELLONES Y NAVES EN RENTA</p>

        <div className="plan__actions">
          <button type="button" className="plan__enter" disabled={!ready} onClick={enter}>
            <span className="plan__enter-label">{ready ? "ENTRAR AL PATIO" : "CARGANDO"}</span>
            {ready && !opening && <span className="plan__enter-bar" style={{ animationDuration: `${returning ? INTRO_RETURN_MS : INTRO_AUTO_MS}ms` }} aria-hidden="true" />}
          </button>
          <a
            className="plan__link"
            href={whatsappLink("Hola La Bor, quiero informes de los espacios en renta (pabellones y naves).")}
            target="_blank"
            rel="noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
          >
            SOLO QUIERO INFORMES · WHATSAPP {CONTACT.phoneDisplay}
          </a>
        </div>
      </div>

      <p className="entrance__coords">
        {LOCATION.lat.toFixed(7)}, {LOCATION.lng.toFixed(7)} · <a href="/acerca/" onPointerDown={(e) => e.stopPropagation()}>ACERCA</a>
      </p>
    </div>
  )
}
