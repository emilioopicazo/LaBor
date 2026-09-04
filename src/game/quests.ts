// ============================================================
// LA BOR — quests
// Sistema ligero: los pasos se derivan de banderas e inventario,
// así el estado guardado es mínimo y no puede desincronizarse.
// Quest principal: LA PIEZA CENTRAL (docs §92).
// ============================================================

import { game, type SaveState } from "./state"

export type StepStatus = "done" | "active" | "pending" | "soon"

export interface QuestStep {
  id: string
  text: string
  status: StepStatus
  /** espacio al que hay que ir para este paso (para el CTA) */
  spaceId?: string
}

export interface QuestView {
  id: string
  title: string
  description: string
  steps: QuestStep[]
  /** pasos hechos / pasos disponibles hoy */
  progress: string
  complete: boolean
}

export const FLAGS = {
  discovered: "pieza.discovered",
  baseCrafted: "pieza.baseCrafted",
  baseInstalled: "pieza.baseInstalled",
} as const

export const BASE_COMPONENT = "base-madera"

export function piezaCentral(s: SaveState): QuestView {
  const discovered = s.flags[FLAGS.discovered] === true
  const crafted = s.flags[FLAGS.baseCrafted] === true
  const installed = s.flags[FLAGS.baseInstalled] === true
  const hasBase = s.inventory.components.includes(BASE_COMPONENT)

  const steps: QuestStep[] = [
    {
      id: "discover",
      text: "Descubrir el sitio de la instalación en el patio",
      status: discovered ? "done" : "active",
    },
    {
      id: "craft-base",
      text: "Crear la base de madera en VETA",
      status: crafted ? "done" : discovered ? "active" : "pending",
      spaceId: "veta",
    },
    {
      id: "install-base",
      text: "Instalar la base en el pedestal",
      status: installed ? "done" : crafted || hasBase ? "active" : "pending",
      spaceId: "pieza",
    },
    {
      id: "metal",
      text: "Forjar el componente de metal en MANNINO",
      status: "soon",
      spaceId: "mannino",
    },
    {
      id: "silver",
      text: "Crear el detalle en plata en CONTRASTE",
      status: "soon",
      spaceId: "contraste",
    },
  ]

  const available = steps.filter((st) => st.status !== "soon")
  const done = available.filter((st) => st.status === "done").length

  return {
    id: "pieza-central",
    title: "LA PIEZA CENTRAL",
    description:
      "Una instalación colaborativa construida entre los talleres de La Bor. Cada taller aporta un componente; el patio guarda el resultado.",
    steps,
    progress: `${done} / ${available.length}`,
    complete: done === available.length,
  }
}

// ---- eventos de juego que avanzan la quest -------------------------

export function discoverPieza() {
  if (game.hasFlag(FLAGS.discovered)) return
  game.setFlag(FLAGS.discovered)
  game.toast("LA PIEZA CENTRAL — descubierta", "quest")
}

/** Llamado por la estación de VETA al terminar de lijar. */
export function onBaseCrafted() {
  game.grantComponent(BASE_COMPONENT)
  game.setFlag(FLAGS.baseCrafted)
  game.toast("+ BASE DE MADERA", "material")
  game.addOficio(10)
  game.toast("+10 OFICIO", "oficio")
  game.toast(`LA PIEZA CENTRAL — ${piezaCentral(game.get()).progress}`, "quest")
}

/** Instala la base en el pedestal: el mundo cambia. */
export function installBase(): boolean {
  if (game.hasFlag(FLAGS.baseInstalled)) return false
  if (!game.consumeComponent(BASE_COMPONENT)) return false
  game.setFlag(FLAGS.baseInstalled)
  game.completeObject("pieza-base")
  game.toast("BASE INSTALADA", "quest")
  game.addOficio(20)
  game.toast("+20 OFICIO", "oficio")
  game.toast(`LA PIEZA CENTRAL — ${piezaCentral(game.get()).progress}`, "quest")
  return true
}
