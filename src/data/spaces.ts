// ============================================================
// LA BOR — espacios del taller
// Contenido editable: nombres, estados, descripciones, áreas,
// CTAs y puntos de interacción. El motor de exploración lee
// esta configuración; no hay contenido regado en la lógica.
// Lógica del complejo: 7 talleres + 3 naves. Residentes:
// CONTRASTE (joyería), VETA (carpintería), MANNINO (herrería).
// Huellas: geometría del prototipo de diseño ×2.5 (ver map.ts).
// Todos los talleres se pueden recorrer por dentro (escenas).
// ============================================================

export type SpaceType = "resident" | "available" | "event" | "navigation" | "installation"
export type SpaceStatus = "active" | "coming-soon" | "available"

export interface SpaceCta {
  label: string
  href?: string
  /** Abre otro overlay (p. ej. INFORMACIÓN → CONTACTO) */
  targetSpaceId?: string
  /** Entra a la escena de taller (cuarto jugable) */
  enterSceneId?: string
}

export interface WorkshopSpace {
  id: string
  name: string
  /** Índice arquitectónico corto (P01, N02, 01…) */
  number?: string
  subtitle?: string
  description?: string
  /** Líneas de detalle extra en el overlay (listas cortas) */
  details?: string[]

  /** Huella del edificio en coordenadas de mundo */
  buildingRect?: {
    x: number
    y: number
    width: number
    height: number
  }

  /**
   * Punto de interacción frente al edificio / objeto (puerta).
   * Los espacios sin punto (p. ej. AGENDA) solo existen en el
   * menú y abren su overlay directamente.
   */
  interactionPoint?: {
    x: number
    y: number
  }

  interactionRadius: number

  type: SpaceType
  status: SpaceStatus

  areaM2?: number

  /** acción principal del overlay */
  cta?: SpaceCta
  /** acción secundaria del overlay */
  cta2?: SpaceCta

  image?: string
}

const R = 160

export const SPACES: WorkshopSpace[] = [
  // ---- RESIDENTES ------------------------------------------
  {
    id: "contraste",
    name: "CONTRASTE ATELIER",
    number: "01",
    subtitle: "Joyería / Producción / Talleres",
    description:
      "Taller dedicado a la joyería, el trabajo en plata, la producción y talleres presenciales.",
    buildingRect: { x: 965, y: 332, width: 425, height: 508 },
    interactionPoint: { x: 1178, y: 890 },
    interactionRadius: R,
    type: "resident",
    status: "active",
    cta: { label: "ENTRAR AL TALLER", enterSceneId: "contraste-room" },
    cta2: { label: "VER AGENDA", targetSpaceId: "agenda" },
  },
  {
    id: "veta",
    name: "VETA",
    number: "02",
    subtitle: "Carpintería / Diseño / Producción",
    description: "Taller de carpintería enfocado en diseño y producción en madera.",
    buildingRect: { x: 100, y: 100, width: 365, height: 1195 },
    interactionPoint: { x: 512, y: 700 },
    interactionRadius: R,
    type: "resident",
    status: "active",
    cta: { label: "ENTRAR AL TALLER", enterSceneId: "veta-room" },
  },
  {
    id: "mannino",
    name: "MANNINO",
    number: "03",
    subtitle: "Herrería / Metal",
    description: "Taller de herrería y trabajo en metal. Información próximamente.",
    buildingRect: { x: 100, y: 1295, width: 365, height: 695 },
    interactionPoint: { x: 512, y: 1640 },
    interactionRadius: R,
    type: "resident",
    status: "active",
    cta: { label: "ENTRAR AL TALLER", enterSceneId: "mannino-room" },
  },

  // ---- ESPACIOS DISPONIBLES --------------------------------
  {
    id: "pabellon-04",
    name: "PABELLÓN 04",
    number: "P04",
    buildingRect: { x: 465, y: 332, width: 492, height: 508 },
    interactionPoint: { x: 711, y: 890 },
    interactionRadius: R,
    type: "available",
    status: "available",
    areaM2: 42,
    cta: { label: "RECORRER EL ESPACIO", enterSceneId: "pabellon-04-room" },
    cta2: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },
  {
    id: "pabellon-01",
    name: "PABELLÓN 01",
    number: "P01",
    details: ["Interior — 45.6 m²", "Terraza exterior — 33.3 m²"],
    buildingRect: { x: 2148, y: 332, width: 852, height: 452 },
    interactionPoint: { x: 2100, y: 560 },
    interactionRadius: R,
    type: "available",
    status: "available",
    areaM2: 80,
    cta: { label: "RECORRER EL ESPACIO", enterSceneId: "pabellon-01-room" },
    cta2: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },
  {
    id: "pabellon-02",
    name: "PABELLÓN 02",
    number: "P02",
    details: ["Interior — 45.7 m²", "Terraza exterior — 33.3 m²"],
    buildingRect: { x: 2148, y: 785, width: 852, height: 488 },
    interactionPoint: { x: 2100, y: 1030 },
    interactionRadius: R,
    type: "available",
    status: "available",
    areaM2: 80,
    cta: { label: "RECORRER EL ESPACIO", enterSceneId: "pabellon-02-room" },
    cta2: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },
  {
    id: "pabellon-03",
    name: "PABELLÓN 03",
    number: "P03",
    buildingRect: { x: 2512, y: 1272, width: 488, height: 465 },
    interactionPoint: { x: 2462, y: 1500 },
    interactionRadius: R,
    type: "available",
    status: "available",
    areaM2: 46,
    cta: { label: "RECORRER EL ESPACIO", enterSceneId: "pabellon-03-room" },
    cta2: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },
  {
    id: "nave-03",
    name: "NAVE 03",
    number: "N03",
    buildingRect: { x: 775, y: 1990, width: 670, height: 798 },
    interactionPoint: { x: 1110, y: 1940 },
    interactionRadius: R,
    type: "available",
    status: "available",
    areaM2: 95,
    cta: { label: "RECORRER EL ESPACIO", enterSceneId: "nave-03-room" },
    cta2: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },
  {
    id: "nave-02",
    name: "NAVE 02",
    number: "N02",
    buildingRect: { x: 1445, y: 1990, width: 828, height: 798 },
    interactionPoint: { x: 1859, y: 1940 },
    interactionRadius: R,
    type: "available",
    status: "available",
    areaM2: 117,
    cta: { label: "RECORRER EL ESPACIO", enterSceneId: "nave-02-room" },
    cta2: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },
  {
    id: "nave-01",
    name: "NAVE 01",
    number: "N01",
    buildingRect: { x: 2272, y: 1990, width: 828, height: 798 },
    interactionPoint: { x: 2686, y: 1940 },
    interactionRadius: R,
    type: "available",
    status: "available",
    areaM2: 117,
    cta: { label: "RECORRER EL ESPACIO", enterSceneId: "nave-01-room" },
    cta2: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },

  // ---- PATIO / PROGRAMA ------------------------------------
  {
    id: "pieza",
    name: "LA PIEZA CENTRAL",
    subtitle: "Instalación colaborativa",
    interactionPoint: { x: 1820, y: 1440 },
    interactionRadius: 200,
    type: "installation",
    status: "active",
  },
  {
    id: "eventos",
    name: "EVENTOS",
    subtitle: "Programa del patio",
    details: ["Bazares", "Exhibiciones", "Activaciones", "Encuentros"],
    interactionPoint: { x: 2330, y: 1760 },
    interactionRadius: R,
    type: "event",
    status: "coming-soon",
  },
  {
    id: "contacto",
    name: "CONTACTO",
    subtitle: "La Bor — Talleres",
    description: "Calle Cobá · Tulum, Quintana Roo, México.",
    details: ["Instagram —", "WhatsApp —", "Email —"],
    interactionPoint: { x: 900, y: 1740 },
    interactionRadius: 150,
    type: "navigation",
    status: "coming-soon",
  },
  {
    id: "agenda",
    name: "AGENDA",
    subtitle: "Calendario de talleres y eventos",
    description: "Cursos, experiencias y eventos impartidos por los talleres residentes.",
    interactionRadius: R,
    type: "navigation",
    status: "coming-soon",
  },
]

export function getSpace(id: string): WorkshopSpace | undefined {
  return SPACES.find((s) => s.id === id)
}

/** Espacios que existen físicamente en el mundo (con punto de interacción). */
export const WORLD_SPACES = SPACES.filter((s) => s.interactionPoint)

/** Espacios con edificio (huella bloqueada en el patio). */
export const BUILDINGS = SPACES.filter((s) => s.buildingRect)

/** Etiqueta corta del tipo, para kickers de overlay y etiquetas. */
export function spaceKindLabel(space: WorkshopSpace): string {
  switch (space.type) {
    case "resident":
      return "RESIDENTE"
    case "available":
      return "ESPACIO DISPONIBLE"
    case "event":
      return "PATIO"
    case "navigation":
      return "LA BOR"
    case "installation":
      return "INSTALACIÓN"
  }
}

/** Color de acento por residente (sistema de diseño). */
export function spaceAccent(space: WorkshopSpace): string | undefined {
  switch (space.id) {
    case "veta":
      return "#c98f42"
    case "contraste":
      return "#3f9c96"
    case "mannino":
      return "#8e9299"
    default:
      return undefined
  }
}
