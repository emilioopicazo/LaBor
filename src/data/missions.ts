// ============================================================
// LA BOR — misiones (contenido)
// LA PIEZA CENTRAL: una instalación colaborativa. Cada taller
// residente aporta un componente que se gana en su minijuego; el
// patio guarda el resultado. Pasos en orden fijo (línea de objetivo
// corta en móvil); instalar se puede en cuanto se lleva algo.
// ============================================================

import type { MinigameId } from "../game/minigames/contract"

export interface MissionComponent {
  id: string
  label: string
  /** nombre corto para la línea de misión (MADERA / METAL / PLATA) */
  short: string
  spaceId: string
  minigameId: MinigameId
  /** bandera temporal de mundo al instalarse */
  installFlag: string
}

export interface MissionStep {
  id: string
  /** texto de objetivo (una línea) */
  objective: string
  /** espacio al que hay que ir (para viaje rápido / hint) */
  spaceId?: string
}

export interface MissionDef {
  id: string
  title: string
  /** nombre corto para el HUD */
  short: string
  description: string
  components: MissionComponent[]
  /** paso final: instalar en el patio */
  finalStep: MissionStep
  completeFlag: string
  reward: { title: string; text: string }
}

export const PIEZA_CENTRAL: MissionDef = {
  id: "pieza-central",
  title: "LA PIEZA CENTRAL",
  short: "LA PIEZA",
  description:
    "Una instalación colaborativa construida entre los talleres de La Bor. Gana un componente en cada taller residente y ármala en el pedestal del patio.",
  components: [
    { id: "base-madera", label: "BASE DE MADERA", short: "MADERA", spaceId: "veta", minigameId: "gato", installFlag: "pieza.baseInstalled" },
    { id: "componente-metal", label: "COMPONENTE DE METAL", short: "METAL", spaceId: "mannno", minigameId: "conecta4", installFlag: "pieza.metalInstalled" },
    { id: "detalle-plata", label: "DETALLE EN PLATA", short: "PLATA", spaceId: "contraste", minigameId: "memoria", installFlag: "pieza.detailInstalled" },
  ],
  finalStep: { id: "instalar", objective: "INSTALA LA PIEZA EN EL PATIO", spaceId: "pieza-central" },
  completeFlag: "pieza.complete",
  reward: {
    title: "LA PIEZA QUEDÓ EN EL PATIO",
    text: "Ya conoces los tres talleres residentes. Lo que sigue es venir en persona: agenda una visita y te enseñamos los espacios disponibles.",
  },
}

export const MISSIONS: Record<string, MissionDef> = { [PIEZA_CENTRAL.id]: PIEZA_CENTRAL }

export function getMission(id: string): MissionDef | undefined {
  return MISSIONS[id]
}
