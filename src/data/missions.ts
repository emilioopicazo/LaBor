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
  /** minijuegos del taller: al usar la estación se elige uno al azar */
  minigameIds: MinigameId[]
  /** bandera temporal de mundo al instalarse */
  installFlag: string
  /** icono del componente (clave en ASSETS) */
  icon: string
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
  title: "LA HORA",
  short: "LA HORA",
  description:
    "Un reloj de sol de los tres talleres: el disco de madera de VETA, la aguja forjada por MANNNO y las marcas de plata de CONTRASTE. La aguja está a 20.2°, la latitud de Tulum: la pieza da la hora de verdad. Gana cada componente en su taller y ármala en el pedestal del patio.",
  components: [
    { id: "base-madera", label: "DISCO DE MADERA", short: "MADERA", spaceId: "veta", minigameIds: ["gato", "corte"], installFlag: "pieza.baseInstalled", icon: "iconMadera" },
    { id: "componente-metal", label: "AGUJA DE METAL", short: "METAL", spaceId: "mannno", minigameIds: ["conecta4", "ritmo"], installFlag: "pieza.metalInstalled", icon: "iconMetal" },
    { id: "detalle-plata", label: "MARCAS DE PLATA", short: "PLATA", spaceId: "contraste", minigameIds: ["memoria", "balanza"], installFlag: "pieza.detailInstalled", icon: "iconPlata" },
  ],
  finalStep: { id: "instalar", objective: "INSTALA LA HORA EN EL PATIO", spaceId: "pieza-central" },
  completeFlag: "pieza.complete",
  reward: {
    title: "LA HORA YA MARCA EL PATIO",
    text: "La sombra ya cruza los tres talleres. Lo que sigue es venir en persona: agenda una visita y te enseñamos los espacios disponibles.",
  },
}

export const MISSIONS: Record<string, MissionDef> = { [PIEZA_CENTRAL.id]: PIEZA_CENTRAL }

export function getMission(id: string): MissionDef | undefined {
  return MISSIONS[id]
}
