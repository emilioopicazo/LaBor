// ============================================================
// LA BOR — perfil del visitante (persistente)
// Solo lo que debe sobrevivir a una misión: avatar, apodo opcional
// y un resumen de logros. localStorage: labor.profile.v1
// ============================================================

import { useSyncExternalStore } from "react"
import type { AvatarId } from "../data/avatars"

export interface PlayerProfile {
  version: 1
  avatarId: AvatarId | null
  nickname?: string
  /** misiones completadas (id → veces) */
  completed: Record<string, number>
  /** el visitante ya vio el hint de controles */
  seenControls: boolean
}

const KEY = "labor.profile.v1"

const EMPTY: PlayerProfile = { version: 1, avatarId: null, completed: {}, seenControls: false }

function load(): PlayerProfile {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>
    if (parsed.version !== 1) return EMPTY
    return { ...EMPTY, ...parsed, completed: { ...(parsed.completed ?? {}) } }
  } catch {
    return EMPTY
  }
}

let state: PlayerProfile = typeof window === "undefined" ? EMPTY : load()
const listeners = new Set<() => void>()

function commit(next: PlayerProfile) {
  state = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // sin almacenamiento: sigue en memoria
  }
  listeners.forEach((fn) => fn())
}

const subscribe = (fn: () => void) => {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
const snapshot = () => state

export function useProfile(): PlayerProfile {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

export const profile = {
  get: () => state,
  setAvatar(avatarId: AvatarId) {
    if (state.avatarId === avatarId) return
    commit({ ...state, avatarId })
  },
  setNickname(nickname: string) {
    commit({ ...state, nickname: nickname.trim() || undefined })
  },
  markControlsSeen() {
    if (state.seenControls) return
    commit({ ...state, seenControls: true })
  },
  recordCompletion(missionId: string) {
    commit({ ...state, completed: { ...state.completed, [missionId]: (state.completed[missionId] ?? 0) + 1 } })
  },
  reset() {
    commit(EMPTY)
  },
}
