// ============================================================
// LA BOR — avatares (cosméticos)
// Cinco arquetipos de Tulum. Mismo colisionador, misma velocidad,
// misma animación: solo cambia el arte. Cada sheet: 4 columnas ×
// 3 filas de 16×28 (fila 0 = frente, 1 = espalda, 2 = perfil derecho;
// columna 0 = idle, 1–3 = caminar). El perfil izquierdo se espeja.
// Sheets placeholder generados con scripts/gen-avatar-placeholders.mjs;
// reemplazar el PNG (mismo nombre y retícula) cuando exista arte final.
// ============================================================

export type AvatarId = "sporty" | "playero" | "tuluminati" | "creativa" | "nomada-nocturno"

export interface AvatarDef {
  id: AvatarId
  name: string
  /** descriptor breve para el selector */
  descriptor: string
  sheet: string
  /** color de acento para el chip del HUD */
  accent: string
}

export const FRAME_W = 16
export const FRAME_H = 28

export const AVATARS: AvatarDef[] = [
  { id: "sporty", name: "LA SPORTY", descriptor: "Wellness, gorra y agenda llena.", sheet: "/assets/characters/avatars/sporty.png", accent: "#d9c9a5" },
  { id: "playero", name: "EL PLAYERO", descriptor: "Sandalias, lentes y cero prisa.", sheet: "/assets/characters/avatars/playero.png", accent: "#7fb1b3" },
  { id: "tuluminati", name: "EL TULUMINATI", descriptor: "Lino, ceremonia y buena vibra.", sheet: "/assets/characters/avatars/tuluminati.png", accent: "#c9b18f" },
  { id: "creativa", name: "LA CREATIVA", descriptor: "Overol, pañuelo y manos ocupadas.", sheet: "/assets/characters/avatars/creativa.png", accent: "#b8663d" },
  { id: "nomada-nocturno", name: "EL NÓMADA NOCTURNO", descriptor: "Negro total, audífonos, otra zona horaria.", sheet: "/assets/characters/avatars/nomada-nocturno.png", accent: "#8e9299" },
]

export const DEFAULT_AVATAR: AvatarId = "creativa"

export function getAvatar(id: string | null | undefined): AvatarDef {
  return AVATARS.find((a) => a.id === id) ?? AVATARS.find((a) => a.id === DEFAULT_AVATAR)!
}
