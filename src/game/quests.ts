// ============================================================
// LA BOR — quests
// Sistema ligero: los pasos se derivan de banderas e inventario,
// así el estado guardado es mínimo y no puede desincronizarse.
// Quest principal: LA PIEZA CENTRAL (docs §92) — tres componentes,
// uno por taller residente, instalados en orden sobre el pedestal.
// ============================================================

import { game, type SaveState } from "./state"

export type StepStatus = "done" | "active" | "pending"

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
  progress: string
  complete: boolean
  /** componente en inventario listo para instalarse (el siguiente en orden) */
  installable: PiezaComponent | null
  /** siguiente taller al que hay que ir (si falta crear algo) */
  nextSpaceId: string | null
}

export interface PiezaComponent {
  id: string
  label: string
  spaceId: string
  craftFlag: string
  installFlag: string
  craftText: string
  installText: string
}

export const FLAGS = {
  discovered: "pieza.discovered",
  complete: "pieza.complete",
} as const

export const COMPONENTS: PiezaComponent[] = [
  {
    id: "base-madera",
    label: "BASE DE MADERA",
    spaceId: "veta",
    craftFlag: "pieza.baseCrafted",
    installFlag: "pieza.baseInstalled",
    craftText: "Crear la base de madera en VETA",
    installText: "Instalar la base en el pedestal",
  },
  {
    id: "componente-metal",
    label: "COMPONENTE DE METAL",
    spaceId: "mannino",
    craftFlag: "pieza.metalCrafted",
    installFlag: "pieza.metalInstalled",
    craftText: "Forjar el componente de metal en MANNINO",
    installText: "Instalar el componente de metal",
  },
  {
    id: "detalle-plata",
    label: "DETALLE EN PLATA",
    spaceId: "contraste",
    craftFlag: "pieza.plataCrafted",
    installFlag: "pieza.plataInstalled",
    craftText: "Crear el detalle en plata en CONTRASTE",
    installText: "Instalar el detalle en plata",
  },
]

export function piezaCentral(s: SaveState): QuestView {
  const discovered = s.flags[FLAGS.discovered] === true
  const steps: QuestStep[] = [
    {
      id: "discover",
      text: "Descubrir el sitio de la instalación en el patio",
      status: discovered ? "done" : "active",
    },
  ]

  let installable: PiezaComponent | null = null
  let nextSpaceId: string | null = null
  let prevInstalled = discovered

  for (const c of COMPONENTS) {
    const crafted = s.flags[c.craftFlag] === true
    const installed = s.flags[c.installFlag] === true
    const hasIt = s.inventory.components.includes(c.id)
    steps.push({
      id: `craft-${c.id}`,
      text: c.craftText,
      status: crafted ? "done" : prevInstalled ? "active" : "pending",
      spaceId: c.spaceId,
    })
    steps.push({
      id: `install-${c.id}`,
      text: c.installText,
      status: installed ? "done" : crafted && prevInstalled ? "active" : "pending",
      spaceId: "pieza",
    })
    if (!installable && !installed && hasIt && prevInstalled) installable = c
    if (!nextSpaceId && !crafted && prevInstalled) nextSpaceId = c.spaceId
    prevInstalled = installed
  }

  const done = steps.filter((st) => st.status === "done").length
  return {
    id: "pieza-central",
    title: "LA PIEZA CENTRAL",
    description:
      "Una instalación colaborativa construida entre los talleres de La Bor. Cada taller aporta un componente; el patio guarda el resultado.",
    steps,
    progress: `${done} / ${steps.length}`,
    complete: done === steps.length,
    installable,
    nextSpaceId,
  }
}

// ---- eventos de juego que avanzan la quest -------------------------

export function discoverPieza() {
  if (game.hasFlag(FLAGS.discovered)) return
  game.setFlag(FLAGS.discovered)
  game.toast("LA PIEZA CENTRAL — descubierta", "quest")
}

/** Llamado por una estación de taller al terminar su interacción. */
export function onComponentCrafted(componentId: string, label: string, oficio: number) {
  const c = COMPONENTS.find((x) => x.id === componentId)
  game.grantComponent(componentId)
  if (c) game.setFlag(c.craftFlag)
  game.toast(`+ ${label}`, "material")
  game.addOficio(oficio)
  game.toast(`+${oficio} OFICIO`, "oficio")
  if (c) game.toast(`LA PIEZA CENTRAL — ${piezaCentral(game.get()).progress}`, "quest")
}

/** Instala el siguiente componente disponible: el mundo cambia. */
export function installNext(): boolean {
  const view = piezaCentral(game.get())
  const c = view.installable
  if (!c) return false
  if (!game.consumeComponent(c.id)) return false
  game.setFlag(c.installFlag)
  game.completeObject(`pieza-${c.id}`)
  game.toast(`${c.label} — INSTALADO`, "quest")
  game.addOficio(20)
  game.toast("+20 OFICIO", "oficio")
  const after = piezaCentral(game.get())
  if (after.complete && !game.hasFlag(FLAGS.complete)) {
    game.setFlag(FLAGS.complete)
    game.addOficio(50)
    game.toast("LA PIEZA CENTRAL — COMPLETA · +50 OFICIO", "quest")
  } else {
    game.toast(`LA PIEZA CENTRAL — ${after.progress}`, "quest")
  }
  return true
}
