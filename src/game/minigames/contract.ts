// ============================================================
// LA BOR — contrato de minijuegos
// Un minijuego no toca el estado de la misión: devuelve un resultado y
// el controlador de misión decide la recompensa. Cada taller tiene dos
// juegos; al usar la estación se elige uno al azar.
// ============================================================

export type MinigameId = "gato" | "corte" | "conecta4" | "ritmo" | "memoria" | "balanza"

export interface MinigameResult {
  gameId: MinigameId
  success: boolean
  score?: number
  durationMs: number
}

export interface MinigameMeta {
  id: MinigameId
  title: string
  /** una sola frase de instrucción (docs §7) */
  hint: string
  /** taller donde vive */
  spaceId: string
}

export const MINIGAMES: Record<MinigameId, MinigameMeta> = {
  gato: { id: "gato", title: "GATO", hint: "Haz tres en línea antes que la carpintería.", spaceId: "veta" },
  corte: { id: "corte", title: "CORTE A MEDIDA", hint: "Toca la tabla cuando la marca pase por la línea: tres cortes buenos de cinco.", spaceId: "veta" },
  conecta4: { id: "conecta4", title: "CONECTA 4", hint: "Alinea cuatro rondanas antes que la herrería.", spaceId: "mannno" },
  ritmo: { id: "ritmo", title: "RITMO DE FRAGUA", hint: "Mira en qué yunques cae el martillo y repite el orden.", spaceId: "mannno" },
  memoria: { id: "memoria", title: "MEMORIA", hint: "Encuentra los seis pares de piezas.", spaceId: "contraste" },
  balanza: { id: "balanza", title: "LA BALANZA", hint: "Elige las piedras que pesan exactamente lo que pide la balanza.", spaceId: "contraste" },
}

export function pickMinigame(pool: MinigameId[], rnd: () => number = Math.random): MinigameId {
  return pool[Math.floor(rnd() * pool.length)] ?? pool[0]
}
