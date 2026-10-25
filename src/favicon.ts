// ============================================================
// LA BOR — favicon: "LB" negro sobre papel. Chrome/Safari no animan un
// SVG de favicon, así que cada ~7 s se cambian unos frames (el
// subrayado barra bajo las letras) y se vuelve al estático. Firefox
// además anima el SVG por sí solo (SMIL en /favicon.svg).
// ============================================================

const STATIC = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\"><rect width=\"32\" height=\"32\" rx=\"5\" fill=\"#ecebe9\"/><g fill=\"#141315\"><rect x=\"5\" y=\"6\" width=\"4.6\" height=\"19\"/><rect x=\"5\" y=\"20.4\" width=\"9.4\" height=\"4.6\"/></g><path d=\"M18.3 8.3h4.4a3.6 3.6 0 0 1 0 7.2h-4.4M18.3 15.5h5.3a3.95 3.95 0 0 1 0 7.9h-5.3\" fill=\"none\" stroke=\"#141315\" stroke-width=\"4.6\" stroke-linejoin=\"round\"/><rect x=\"16\" y=\"6\" width=\"4.6\" height=\"19\" fill=\"#141315\"/></svg>"
const FRAMES: string[] = ["<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\"><rect width=\"32\" height=\"32\" rx=\"5\" fill=\"#ecebe9\"/><g fill=\"#141315\"><rect x=\"5\" y=\"6\" width=\"4.6\" height=\"19\"/><rect x=\"5\" y=\"20.4\" width=\"9.4\" height=\"4.6\"/></g><path d=\"M18.3 8.3h4.4a3.6 3.6 0 0 1 0 7.2h-4.4M18.3 15.5h5.3a3.95 3.95 0 0 1 0 7.9h-5.3\" fill=\"none\" stroke=\"#141315\" stroke-width=\"4.6\" stroke-linejoin=\"round\"/><rect x=\"16\" y=\"6\" width=\"4.6\" height=\"19\" fill=\"#141315\"/><rect x=\"5\" y=\"27\" width=\"3.3\" height=\"1.6\" fill=\"#141315\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\"><rect width=\"32\" height=\"32\" rx=\"5\" fill=\"#ecebe9\"/><g fill=\"#141315\"><rect x=\"5\" y=\"6\" width=\"4.6\" height=\"19\"/><rect x=\"5\" y=\"20.4\" width=\"9.4\" height=\"4.6\"/></g><path d=\"M18.3 8.3h4.4a3.6 3.6 0 0 1 0 7.2h-4.4M18.3 15.5h5.3a3.95 3.95 0 0 1 0 7.9h-5.3\" fill=\"none\" stroke=\"#141315\" stroke-width=\"4.6\" stroke-linejoin=\"round\"/><rect x=\"16\" y=\"6\" width=\"4.6\" height=\"19\" fill=\"#141315\"/><rect x=\"5\" y=\"27\" width=\"7.7\" height=\"1.6\" fill=\"#141315\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\"><rect width=\"32\" height=\"32\" rx=\"5\" fill=\"#ecebe9\"/><g fill=\"#141315\"><rect x=\"5\" y=\"6\" width=\"4.6\" height=\"19\"/><rect x=\"5\" y=\"20.4\" width=\"9.4\" height=\"4.6\"/></g><path d=\"M18.3 8.3h4.4a3.6 3.6 0 0 1 0 7.2h-4.4M18.3 15.5h5.3a3.95 3.95 0 0 1 0 7.9h-5.3\" fill=\"none\" stroke=\"#141315\" stroke-width=\"4.6\" stroke-linejoin=\"round\"/><rect x=\"16\" y=\"6\" width=\"4.6\" height=\"19\" fill=\"#141315\"/><rect x=\"5\" y=\"27\" width=\"12.1\" height=\"1.6\" fill=\"#141315\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\"><rect width=\"32\" height=\"32\" rx=\"5\" fill=\"#ecebe9\"/><g fill=\"#141315\"><rect x=\"5\" y=\"6\" width=\"4.6\" height=\"19\"/><rect x=\"5\" y=\"20.4\" width=\"9.4\" height=\"4.6\"/></g><path d=\"M18.3 8.3h4.4a3.6 3.6 0 0 1 0 7.2h-4.4M18.3 15.5h5.3a3.95 3.95 0 0 1 0 7.9h-5.3\" fill=\"none\" stroke=\"#141315\" stroke-width=\"4.6\" stroke-linejoin=\"round\"/><rect x=\"16\" y=\"6\" width=\"4.6\" height=\"19\" fill=\"#141315\"/><rect x=\"5\" y=\"27\" width=\"16.5\" height=\"1.6\" fill=\"#141315\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\"><rect width=\"32\" height=\"32\" rx=\"5\" fill=\"#ecebe9\"/><g fill=\"#141315\"><rect x=\"5\" y=\"6\" width=\"4.6\" height=\"19\"/><rect x=\"5\" y=\"20.4\" width=\"9.4\" height=\"4.6\"/></g><path d=\"M18.3 8.3h4.4a3.6 3.6 0 0 1 0 7.2h-4.4M18.3 15.5h5.3a3.95 3.95 0 0 1 0 7.9h-5.3\" fill=\"none\" stroke=\"#141315\" stroke-width=\"4.6\" stroke-linejoin=\"round\"/><rect x=\"16\" y=\"6\" width=\"4.6\" height=\"19\" fill=\"#141315\"/><rect x=\"5\" y=\"27\" width=\"19.8\" height=\"1.6\" fill=\"#141315\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\"><rect width=\"32\" height=\"32\" rx=\"5\" fill=\"#ecebe9\"/><g fill=\"#141315\"><rect x=\"5\" y=\"6\" width=\"4.6\" height=\"19\"/><rect x=\"5\" y=\"20.4\" width=\"9.4\" height=\"4.6\"/></g><path d=\"M18.3 8.3h4.4a3.6 3.6 0 0 1 0 7.2h-4.4M18.3 15.5h5.3a3.95 3.95 0 0 1 0 7.9h-5.3\" fill=\"none\" stroke=\"#141315\" stroke-width=\"4.6\" stroke-linejoin=\"round\"/><rect x=\"16\" y=\"6\" width=\"4.6\" height=\"19\" fill=\"#141315\"/><rect x=\"5\" y=\"27\" width=\"22.0\" height=\"1.6\" fill=\"#141315\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\"><rect width=\"32\" height=\"32\" rx=\"5\" fill=\"#ecebe9\"/><g fill=\"#141315\"><rect x=\"5\" y=\"6\" width=\"4.6\" height=\"19\"/><rect x=\"5\" y=\"20.4\" width=\"9.4\" height=\"4.6\"/></g><path d=\"M18.3 8.3h4.4a3.6 3.6 0 0 1 0 7.2h-4.4M18.3 15.5h5.3a3.95 3.95 0 0 1 0 7.9h-5.3\" fill=\"none\" stroke=\"#141315\" stroke-width=\"4.6\" stroke-linejoin=\"round\"/><rect x=\"16\" y=\"6\" width=\"4.6\" height=\"19\" fill=\"#141315\"/><rect x=\"5\" y=\"27\" width=\"22.0\" height=\"1.6\" fill=\"#141315\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\"><rect width=\"32\" height=\"32\" rx=\"5\" fill=\"#ecebe9\"/><g fill=\"#141315\"><rect x=\"5\" y=\"6\" width=\"4.6\" height=\"19\"/><rect x=\"5\" y=\"20.4\" width=\"9.4\" height=\"4.6\"/></g><path d=\"M18.3 8.3h4.4a3.6 3.6 0 0 1 0 7.2h-4.4M18.3 15.5h5.3a3.95 3.95 0 0 1 0 7.9h-5.3\" fill=\"none\" stroke=\"#141315\" stroke-width=\"4.6\" stroke-linejoin=\"round\"/><rect x=\"16\" y=\"6\" width=\"4.6\" height=\"19\" fill=\"#141315\"/><rect x=\"5\" y=\"27\" width=\"22.0\" height=\"1.6\" fill=\"#141315\"/></svg>"]

const toHref = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`

export function startFavicon() {
  if (typeof document === "undefined") return
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')
  if (!link) return
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  link.href = toHref(STATIC)
  if (reduced) return
  let timer = 0
  const sweep = () => {
    if (document.hidden) return
    let i = 0
    const step = () => {
      if (i < FRAMES.length) {
        link.href = toHref(FRAMES[i++])
        timer = window.setTimeout(step, 70)
      } else link.href = toHref(STATIC)
    }
    step()
  }
  window.setInterval(sweep, 7000)
  window.addEventListener("beforeunload", () => window.clearTimeout(timer))
}
