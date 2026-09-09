// ============================================================
// LA BOR — música de recompensa
// La pista se estrena cuando se instala el último componente de LA
// PIEZA CENTRAL (mission.installNext la arranca dentro del mismo gesto
// del visitante, que es lo que exige el navegador para sonar). Queda
// desbloqueada en el perfil de quien la terminó; desde el menú se
// pausa o se reanuda. Pausar se recuerda (labor.audio.v1).
// ============================================================

import { useSyncExternalStore } from "react"
import { AMBIENT_VOLUME, FADE_IN_MS, FADE_OUT_MS, TRACKS, type Track } from "../data/music"

export interface MusicState {
  /** el visitante quiere música (no la ha pausado) */
  enabled: boolean
  /** está sonando ahora mismo */
  playing: boolean
  trackId: string
  /** el navegador bloqueó la reproducción: hace falta un toque */
  blocked: boolean
  /** el navegador no puede reproducir ninguna fuente */
  unsupported: boolean
}

const KEY = "labor.audio.v1"

function loadEnabled(): boolean {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return true
    const parsed = JSON.parse(raw) as { enabled?: boolean }
    return parsed.enabled !== false
  } catch {
    return true
  }
}

let state: MusicState = {
  enabled: typeof window === "undefined" ? true : loadEnabled(),
  playing: false,
  trackId: TRACKS[0].id,
  blocked: false,
  unsupported: false,
}
let el: HTMLAudioElement | null = null
let fadeTimer = 0
const listeners = new Set<() => void>()

function set(patch: Partial<MusicState>) {
  state = { ...state, ...patch }
  listeners.forEach((fn) => fn())
}

function persist(enabled: boolean) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ enabled }))
  } catch {
    // sin almacenamiento
  }
}

export function currentTrack(): Track {
  return TRACKS.find((t) => t.id === state.trackId) ?? TRACKS[0]
}

function applySources(a: HTMLAudioElement, track: Track) {
  a.innerHTML = ""
  track.sources.forEach((s) => {
    const source = document.createElement("source")
    source.src = s.src
    source.type = s.type
    a.appendChild(source)
  })
  a.load()
}

function ensureElement(): HTMLAudioElement {
  if (el) return el
  el = document.createElement("audio")
  el.loop = true
  el.preload = "none"
  el.volume = 0
  el.setAttribute("aria-hidden", "true")
  applySources(el, currentTrack())
  el.addEventListener("pause", () => set({ playing: false }))
  el.addEventListener("play", () => set({ playing: true }))
  el.addEventListener("error", () => set({ playing: false }))
  return el
}

function fade(target: number, ms: number, done?: () => void) {
  const a = ensureElement()
  window.clearInterval(fadeTimer)
  const start = a.volume
  const t0 = performance.now()
  fadeTimer = window.setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms)
    a.volume = start + (target - start) * k
    if (k >= 1) {
      window.clearInterval(fadeTimer)
      done?.()
    }
  }, 50)
}

/** Debe llamarse de forma síncrona dentro de un gesto del visitante (iOS lo exige). */
function attemptPlay(): void {
  const a = ensureElement()
  const p = a.play()
  if (!p) return
  p.then(
    () => {
      set({ playing: true, blocked: false, unsupported: false })
      fade(AMBIENT_VOLUME, FADE_IN_MS)
    },
    (err: unknown) => {
      const name = (err as { name?: string } | null)?.name
      // NotAllowedError = falta un gesto; NotSupportedError = sin códec / fuente
      set({ playing: false, blocked: name !== "NotSupportedError", unsupported: name === "NotSupportedError" })
    },
  )
}

export const music = {
  state: () => state,
  /** volumen actual del elemento (pruebas / depuración) */
  volume: () => el?.volume ?? null,

  /** empieza a sonar (desde un gesto: botón del menú o instalar el último componente) */
  play() {
    persist(true)
    set({ enabled: true })
    attemptPlay()
  },

  /** la pieza quedó completa: se estrena la pista aunque antes se hubiera pausado */
  celebrate() {
    this.play()
  },

  pause() {
    persist(false)
    window.clearInterval(fadeTimer)
    el?.pause()
    set({ enabled: false, playing: false })
  },

  /** se apaga con fade (nueva corrida): no cambia la preferencia del visitante */
  stop() {
    if (!el || !state.playing) return
    fade(0, FADE_OUT_MS, () => {
      el?.pause()
      set({ playing: false })
    })
  },

  toggle() {
    if (state.enabled && state.playing) this.pause()
    else this.play()
  },

  /** cambia de pista (para cuando haya varias); mantiene el estado de reproducción */
  select(trackId: string) {
    const track = TRACKS.find((t) => t.id === trackId)
    if (!track || track.id === state.trackId) return
    const wasPlaying = state.playing
    const a = ensureElement()
    a.volume = 0
    set({ trackId: track.id })
    applySources(a, track)
    if (wasPlaying) attemptPlay()
  },
}

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
const snapshot = () => state

export function useMusic(): MusicState {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

if (typeof window !== "undefined") {
  ;(window as unknown as { __LABOR_MUSIC__: typeof music }).__LABOR_MUSIC__ = music
}
