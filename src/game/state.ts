// ============================================================
// LA BOR — estado de juego (inventario, oficio, banderas)
// Persistido en localStorage. Sin backend. Un store mínimo con
// suscripción para React (useSyncExternalStore).
// ============================================================

import { useSyncExternalStore } from "react"

export interface Inventory {
  materials: { madera: number; metal: number; plata: number }
  components: string[]
  completedObjects: string[]
}

export interface SaveState {
  version: 1
  inventory: Inventory
  oficio: number
  /** banderas de mundo / quest (p. ej. "pieza.baseInstalled") */
  flags: Record<string, boolean>
}

export interface Toast {
  id: number
  text: string
  kind?: "material" | "oficio" | "quest" | "info"
}

const STORAGE_KEY = "labor.save.v1"

const EMPTY: SaveState = {
  version: 1,
  inventory: {
    materials: { madera: 0, metal: 0, plata: 0 },
    components: [],
    completedObjects: [],
  },
  oficio: 0,
  flags: {},
}

function load(): SaveState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<SaveState>
    if (parsed.version !== 1) return EMPTY
    return {
      ...EMPTY,
      ...parsed,
      inventory: { ...EMPTY.inventory, ...(parsed.inventory ?? {}) },
      flags: { ...(parsed.flags ?? {}) },
    }
  } catch {
    return EMPTY
  }
}

let state: SaveState = typeof window === "undefined" ? EMPTY : load()
const listeners = new Set<() => void>()
const toastListeners = new Set<(t: Toast) => void>()
let toastSeq = 0

function commit(next: SaveState) {
  state = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // almacenamiento no disponible: el juego sigue en memoria
  }
  listeners.forEach((fn) => fn())
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function getSnapshot() {
  return state
}

export function useGameState(): SaveState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function subscribeToasts(fn: (t: Toast) => void) {
  toastListeners.add(fn)
  return () => {
    toastListeners.delete(fn)
  }
}

export const game = {
  get: () => state,

  toast(text: string, kind: Toast["kind"] = "info") {
    const t = { id: ++toastSeq, text, kind }
    toastListeners.forEach((fn) => fn(t))
  },

  hasComponent(id: string) {
    return state.inventory.components.includes(id)
  },

  hasFlag(key: string) {
    return state.flags[key] === true
  },

  setFlag(key: string, value = true) {
    if (state.flags[key] === value) return
    commit({ ...state, flags: { ...state.flags, [key]: value } })
  },

  addMaterial(id: keyof Inventory["materials"], n: number) {
    commit({
      ...state,
      inventory: {
        ...state.inventory,
        materials: { ...state.inventory.materials, [id]: state.inventory.materials[id] + n },
      },
    })
  },

  grantComponent(id: string) {
    if (state.inventory.components.includes(id)) return
    commit({
      ...state,
      inventory: { ...state.inventory, components: [...state.inventory.components, id] },
    })
  },

  consumeComponent(id: string): boolean {
    if (!state.inventory.components.includes(id)) return false
    commit({
      ...state,
      inventory: {
        ...state.inventory,
        components: state.inventory.components.filter((c) => c !== id),
      },
    })
    return true
  },

  completeObject(id: string) {
    if (state.inventory.completedObjects.includes(id)) return
    commit({
      ...state,
      inventory: {
        ...state.inventory,
        completedObjects: [...state.inventory.completedObjects, id],
      },
    })
  },

  addOficio(n: number) {
    commit({ ...state, oficio: state.oficio + n })
  },

  reset() {
    commit(EMPTY)
  },
}
