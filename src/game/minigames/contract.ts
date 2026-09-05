// ============================================================
// LA BOR — contrato de minijuegos
// Un minijuego no toca el estado de la misión: devuelve un resultado y
// el controlador de misión decide la recompensa.
// ============================================================

export type MinigameId = "gato" | "conecta4" | "memoria"

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
  conecta4: { id: "conecta4", title: "CONECTA 4", hint: "Alinea cuatro rondanas antes que la herrería.", spaceId: "mannno" },
  memoria: { id: "memoria", title: "MEMORIA", hint: "Encuentra los seis pares de piezas.", spaceId: "contraste" },
}
