// ============================================================
// LA BOR — puente React ↔ Phaser
// React manda comandos (entrar a un taller, teletransportar, pausar,
// cambiar avatar…). Phaser emite eventos (acción disponible, escena,
// interacción disparada, posición). Ninguno importa al otro: los dos
// hablan a través de este módulo, que no depende de Phaser ni de React.
// ============================================================

export type InteractKind = "door" | "poi" | "station" | "exit" | "sign"

export interface Interactable {
  id: string
  kind: InteractKind
  /** etiqueta del botón contextual (ENTRAR, VER, JUGAR, USAR, INSTALAR, SALIR) */
  action: string
  /** nombre corto para el hint (VETA, LA PIEZA CENTRAL…) */
  label: string
  x: number
  y: number
  radius: number
  spaceId?: string
  sceneId?: string
  minigameId?: MinigameId
}

import type { MinigameId } from "./minigames/contract"
import type { JoystickState } from "./phaser/Joystick"

export interface GameEvents {
  /** estado del joystick flotante (visuales en el DOM) */
  joystick: JoystickState
  /** la escena terminó de construirse y acepta comandos */
  ready: { sceneId: string; spaceId: string | null }
  /** el interactuable más cercano cambió (null = nada cerca) */
  action: { target: Interactable | null }
  /** el visitante disparó la acción contextual */
  interact: { target: Interactable }
  /** posición del visitante (para debug / hints) — se emite a ~10 Hz */
  player: { x: number; y: number; moving: boolean; sceneId: string }
  /** primer movimiento manual (para retirar el hint inicial) */
  moved: Record<string, never>
  /** tecla ESC dentro del canvas */
  escape: Record<string, never>
  /** viaje rápido terminado: el visitante llegó al objetivo */
  arrived: { targetId: string }
}

type Listener<T> = (payload: T) => void

class Emitter<E extends object> {
  private map = new Map<keyof E, Set<Listener<never>>>()

  on<K extends keyof E>(key: K, fn: Listener<E[K]>): () => void {
    if (!this.map.has(key)) this.map.set(key, new Set())
    this.map.get(key)!.add(fn as Listener<never>)
    return () => this.off(key, fn)
  }

  off<K extends keyof E>(key: K, fn: Listener<E[K]>) {
    this.map.get(key)?.delete(fn as Listener<never>)
  }

  emit<K extends keyof E>(key: K, payload: E[K]) {
    this.map.get(key)?.forEach((fn) => (fn as Listener<E[K]>)(payload))
  }
}

export const gameEvents = new Emitter<GameEvents>()

/** Comandos que React le da al mundo. Los implementa la escena activa. */
export interface GameCommands {
  /** entra a un cuarto de taller (escena) por su id */
  enterRoom(sceneId: string): void
  /** sale del cuarto actual al patio, frente a su puerta */
  exitRoom(): void
  /** viaje rápido: camina (rápido) hasta un interactuable del patio y avisa `arrived` */
  goTo(targetId: string): void
  /** coloca al visitante (x, y de mundo) en la escena actual */
  teleport(x: number, y: number): void
  /** cambia el avatar (cosmético) sin mover al visitante */
  setAvatar(avatarId: string): void
  /** overlays abiertos → el mundo no recibe input ni mueve al visitante */
  setPaused(paused: boolean): void
  /** banderas de mundo de la corrida actual (etapas de la escultura) */
  setWorldFlags(flags: string[]): void
  /** dispara la acción contextual (botón HUD) */
  triggerAction(): void
  /** hace zoom sutil hacia un objetivo (foco de interacción) o lo suelta */
  focus(target: { x: number; y: number } | null): void
}

let controller: GameCommands | null = null
const queue: Array<(c: GameCommands) => void> = []

/** La escena activa se registra aquí al crearse. */
export function registerController(c: GameCommands | null) {
  controller = c
  if (c) {
    const pending = queue.splice(0)
    pending.forEach((fn) => fn(c))
  }
}

function run(fn: (c: GameCommands) => void) {
  if (controller) fn(controller)
  else queue.push(fn)
}

export const gameCommands: GameCommands = {
  enterRoom: (sceneId) => run((c) => c.enterRoom(sceneId)),
  exitRoom: () => run((c) => c.exitRoom()),
  goTo: (id) => run((c) => c.goTo(id)),
  teleport: (x, y) => run((c) => c.teleport(x, y)),
  setAvatar: (id) => run((c) => c.setAvatar(id)),
  setPaused: (p) => run((c) => c.setPaused(p)),
  setWorldFlags: (f) => run((c) => c.setWorldFlags(f)),
  triggerAction: () => run((c) => c.triggerAction()),
  focus: (t) => run((c) => c.focus(t)),
}
