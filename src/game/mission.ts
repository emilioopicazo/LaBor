// ============================================================
// LA BOR — corrida de misión (temporal, reseteable)
// Empezar una misión crea una corrida nueva: inventario temporal,
// minijuegos completados, banderas de mundo y etapas de la escultura
// nacen vacíos. El perfil (avatar) vive aparte y no se toca.
// localStorage: labor.run.v1 — recargar reanuda la corrida.
// ============================================================

import { useSyncExternalStore } from "react"
import { getMission, type MissionDef } from "../data/missions"
import type { MinigameId, MinigameResult } from "./minigames/contract"
import { profile } from "./profile"

export interface MissionRun {
  runId: string
  missionId: string
  startedAt: number
  currentStep: string
  temporaryInventory: string[]
  completedMinigames: string[]
  temporaryWorldFlags: string[]
  score: number
  completed: boolean
  /** componentes ya instalados (orden de instalación) */
  installed: string[]
}

export interface Toast {
  id: number
  text: string
  kind?: "material" | "quest" | "info" | "reward"
}

const KEY = "labor.run.v1"

function load(): MissionRun | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const r = JSON.parse(raw) as Partial<MissionRun>
    if (!r.runId || !r.missionId || !getMission(r.missionId)) return null
    return {
      runId: r.runId,
      missionId: r.missionId,
      startedAt: r.startedAt ?? Date.now(),
      currentStep: r.currentStep ?? "",
      temporaryInventory: r.temporaryInventory ?? [],
      completedMinigames: r.completedMinigames ?? [],
      temporaryWorldFlags: r.temporaryWorldFlags ?? [],
      score: r.score ?? 0,
      completed: r.completed ?? false,
      installed: r.installed ?? [],
    }
  } catch {
    return null
  }
}

let run: MissionRun | null = typeof window === "undefined" ? null : load()
const listeners = new Set<() => void>()
const toastListeners = new Set<(t: Toast) => void>()
let toastSeq = 0

function commit(next: MissionRun | null) {
  run = next
  try {
    if (next) window.localStorage.setItem(KEY, JSON.stringify(next))
    else window.localStorage.removeItem(KEY)
  } catch {
    // sin almacenamiento
  }
  listeners.forEach((fn) => fn())
}

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
const snapshot = () => run

export function useMissionRun(): MissionRun | null {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

export function subscribeToasts(fn: (t: Toast) => void) {
  toastListeners.add(fn)
  return () => {
    toastListeners.delete(fn)
  }
}

export function toast(text: string, kind: Toast["kind"] = "info") {
  const t = { id: ++toastSeq, text, kind }
  toastListeners.forEach((fn) => fn(t))
}

// ---- vista derivada (una sola línea de objetivo) --------------------------

export interface MissionView {
  def: MissionDef
  run: MissionRun
  /** índice de fase 1..N (N = componentes + 1 final) */
  phase: number
  phases: number
  /** "2/4" */
  progress: string
  /** línea de objetivo corta, p. ej. "MANNNO · CONECTA 4" */
  objective: string
  /** espacio objetivo actual */
  targetSpaceId: string | null
  /** componente que toca ganar ahora (null en la fase final) */
  currentComponentId: string | null
  /** componentes en inventario listos para instalar (en orden de misión) */
  installable: string[]
  complete: boolean
}

function newRunId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function missionView(r: MissionRun | null = run): MissionView | null {
  if (!r) return null
  const def = getMission(r.missionId)
  if (!def) return null
  const comps = def.components
  const phases = comps.length + 1
  const won = (c: (typeof comps)[number]) => r.temporaryInventory.includes(c.id) || r.installed.includes(c.id)
  const nextIdx = comps.findIndex((c) => !won(c))
  const installable = comps.filter((c) => r.temporaryInventory.includes(c.id)).map((c) => c.id)
  const complete = r.completed
  if (complete) {
    return {
      def,
      run: r,
      phase: phases,
      phases,
      progress: `${phases}/${phases}`,
      objective: "PIEZA COMPLETA",
      targetSpaceId: null,
      currentComponentId: null,
      installable,
      complete,
    }
  }
  if (nextIdx === -1) {
    return {
      def,
      run: r,
      phase: phases,
      phases,
      progress: `${phases}/${phases}`,
      objective: def.finalStep.objective,
      targetSpaceId: def.finalStep.spaceId ?? null,
      currentComponentId: null,
      installable,
      complete,
    }
  }
  const c = comps[nextIdx]
  const spaceLabel = c.spaceId.toUpperCase().replace("PABELLON", "PABELLÓN")
  const game = c.minigameId === "gato" ? "GATO" : c.minigameId === "conecta4" ? "CONECTA 4" : "MEMORIA"
  return {
    def,
    run: r,
    phase: nextIdx + 1,
    phases,
    progress: `${nextIdx + 1}/${phases}`,
    objective: `${spaceLabel} · ${game}`,
    targetSpaceId: c.spaceId,
    currentComponentId: c.id,
    installable,
    complete,
  }
}

// ---- controlador ---------------------------------------------------------

export const mission = {
  get: () => run,
  view: () => missionView(run),

  /** corrida nueva (descarta la anterior); el avatar no se toca */
  startMission(missionId: string) {
    const def = getMission(missionId)
    if (!def) return
    commit({
      runId: newRunId(),
      missionId,
      startedAt: Date.now(),
      currentStep: def.components[0]?.id ?? def.finalStep.id,
      temporaryInventory: [],
      completedMinigames: [],
      temporaryWorldFlags: [],
      score: 0,
      completed: false,
      installed: [],
    })
    toast(`${def.title} — MISIÓN INICIADA`, "quest")
  },

  restartMission() {
    if (!run) return
    this.startMission(run.missionId)
  },

  /** al cargar: la corrida guardada sigue viva (recargar no castiga) */
  resumeMission(): MissionRun | null {
    return run
  },

  clearRun() {
    commit(null)
  },

  /** el minijuego devolvió resultado: aquí se decide la recompensa */
  onMinigameResult(gameId: MinigameId, result: MinigameResult): { rewarded: string | null; message: string } {
    const view = missionView(run)
    if (!run || !view) {
      return { rewarded: null, message: result.success ? "GANASTE · Inicia la misión en el patio para ganar el componente." : "Inténtalo de nuevo." }
    }
    if (!result.success) return { rewarded: null, message: "Casi. Juega otra vez." }
    const comp = view.def.components.find((c) => c.minigameId === gameId)
    if (!comp) return { rewarded: null, message: "GANASTE" }
    const already = run.temporaryInventory.includes(comp.id) || run.installed.includes(comp.id)
    if (already) return { rewarded: null, message: `Ya tienes ${comp.label}. Llévala al pedestal del patio.` }
    const next = view.def.components.find((c) => !run!.temporaryInventory.includes(c.id) && !run!.installed.includes(c.id) && c.id !== comp.id)
    commit({
      ...run,
      temporaryInventory: [...run.temporaryInventory, comp.id],
      completedMinigames: run.completedMinigames.includes(gameId) ? run.completedMinigames : [...run.completedMinigames, gameId],
      score: run.score + (result.score ?? 0) + 100,
      currentStep: next ? next.id : view.def.finalStep.id,
    })
    toast(`+ ${comp.label}`, "material")
    return { rewarded: comp.id, message: `COMPONENTE COMPLETADO · + ${comp.short}` }
  },

  /** instala el siguiente componente que se lleva (en orden de misión) */
  installNext(): string | null {
    const view = missionView(run)
    if (!run || !view || view.installable.length === 0) return null
    const id = view.installable[0]
    const comp = view.def.components.find((c) => c.id === id)!
    const installed = [...run.installed, id]
    const flags = [...run.temporaryWorldFlags, comp.installFlag]
    const allDone = view.def.components.every((c) => installed.includes(c.id))
    const next: MissionRun = {
      ...run,
      temporaryInventory: run.temporaryInventory.filter((c) => c !== id),
      installed,
      temporaryWorldFlags: allDone ? [...flags, view.def.completeFlag] : flags,
      completed: allDone,
      score: run.score + 50,
      currentStep: allDone ? "completa" : run.currentStep,
    }
    commit(next)
    toast(`${comp.label} — INSTALADA`, "quest")
    if (allDone) {
      profile.recordCompletion(run.missionId)
      toast(`${view.def.title} — COMPLETA`, "reward")
    }
    return id
  },

  // ---- debug ---------------------------------------------------------------
  debugGive(componentId: string) {
    if (!run || run.temporaryInventory.includes(componentId) || run.installed.includes(componentId)) return
    commit({ ...run, temporaryInventory: [...run.temporaryInventory, componentId] })
  },
  debugSkipStep() {
    const view = missionView(run)
    if (!run || !view) return
    if (view.currentComponentId) this.debugGive(view.currentComponentId)
    else this.installNext()
  },
}
