// ============================================================
// LA BOR — reproductor de ambiente
// Un <audio> en loop a volumen bajo. Los navegadores bloquean el sonido
// automático hasta el primer gesto: la intro / el selector / cualquier
// toque lo desbloquea (installAutoplayUnlock). Pausar desde el menú se
// recuerda (labor.audio.v1) para no volver a sonar contra la voluntad
// de quien lo apagó.
// ============================================================

import { useSyncExternalStore } from "react"
import { AMBIENT_VOLUME, FADE_IN_MS, TRACKS, type Track } from "../data/music"

export interface MusicState {
  /** el visitante quiere música (no la ha pausado) */
  enabled: boolean
  /** está sonando ahora mismo */
  playing: boolean
  trackId: string
  /** el navegador bloqueó el autoplay: hace falta un toque */
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
  el.preload = "auto"
  el.volume = 0
  el.setAttribute("aria-hidden", "true")
  applySources(el, currentTrack())
  el.addEventListener("pause", () => set({ playing: false }))
  el.addEventListener("play", () => set({ playing: true }))
  el.addEventListener("error", () => set({ playing: false }))
  return el
}

function fadeTo(target: number) {
  const a = ensureElement()
  window.clearInterval(fadeTimer)
  const start = a.volume
  const t0 = performance.now()
  fadeTimer = window.setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / FADE_IN_MS)
    a.volume = start + (target - start) * k
    if (k >= 1) window.clearInterval(fadeTimer)
  }, 50)
}

/** Debe llamarse de forma síncrona dentro de un gesto del usuario para que iOS lo permita. */
function attemptPlay(): void {
  const a = ensureElement()
  const p = a.play()
  if (!p) return
  p.then(
    () => {
      set({ playing: true, blocked: false, unsupported: false })
      fadeTo(AMBIENT_VOLUME)
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

  /** gesto del usuario: si quiere música y no suena, arranca */
  unlock() {
    if (!state.enabled || state.playing) return
    attemptPlay()
  },

  play() {
    persist(true)
    set({ enabled: true })
    attemptPlay()
  },

  pause() {
    persist(false)
    window.clearInterval(fadeTimer)
    el?.pause()
    set({ enabled: false, playing: false })
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

// hook de pruebas (Playwright)
if (typeof window !== "undefined") (window as unknown as { __LABOR_MUSIC__: unknown }).__LABOR_MUSIC__ = music

export function useMusic(): MusicState {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

/**
 * Autoplay: el primer gesto en cualquier parte (intro, selector, patio)
 * arranca la música si está habilitada. Se retira solo cuando ya suena o
 * cuando el visitante la apagó.
 */
export function installAutoplayUnlock(): () => void {
  const events: Array<keyof DocumentEventMap> = ["pointerup", "touchend", "keydown", "click"]
  const handler = () => {
    if (!state.enabled || state.playing) {
      if (state.playing || !state.enabled) remove()
      return
    }
    music.unlock()
  }
  const remove = () => events.forEach((e) => document.removeEventListener(e, handler, true))
  events.forEach((e) => document.addEventListener(e, handler, true))
  // precarga silenciosa mientras se lee la intro
  if (state.enabled) ensureElement()
  return remove
}
