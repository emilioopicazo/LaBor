// ============================================================
// LA BOR — espacios del taller
// Contenido editable: nombres, estados, descripciones, áreas,
// CTAs y puntos de interacción. El motor de exploración lee
// esta configuración; no hay contenido regado en la lógica.
// ============================================================

export type SpaceType = "resident" | "available" | "event" | "navigation"
export type SpaceStatus = "active" | "coming-soon" | "available"

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
   * Punto de interacción frente al edificio / objeto.
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

  cta?: {
    label: string
    href?: string
    /** Abre otro overlay (p. ej. INFORMACIÓN → CONTACTO) */
    targetSpaceId?: string
  }

  image?: string
}

export const SPACES: WorkshopSpace[] = [
  // ---- RESIDENTES ------------------------------------------
  {
    id: "contraste",
    name: "CONTRASTE ATELIER",
    number: "01",
    subtitle: "Joyería / Producción / Talleres",
    description:
      "Taller dedicado a la joyería, el trabajo en plata, la producción y talleres presenciales.",
    buildingRect: { x: 730, y: 150, width: 300, height: 300 },
    interactionPoint: { x: 880, y: 495 },
    interactionRadius: 110,
    type: "resident",
    status: "active",
    cta: { label: "VER TALLERES", targetSpaceId: "talleres" },
  },
  {
    id: "veta",
    name: "VETA",
    number: "02",
    subtitle: "Carpintería / Diseño / Producción",
    description: "Taller de carpintería enfocado en diseño y producción en madera.",
    buildingRect: { x: 120, y: 180, width: 250, height: 560 },
    interactionPoint: { x: 390, y: 650 },
    interactionRadius: 110,
    type: "resident",
    status: "active",
  },
  {
    id: "mannino",
    name: "MANNINO",
    number: "03",
    subtitle: "Taller residente",
    description: "Espacio residente dentro del complejo. Información próximamente.",
    buildingRect: { x: 120, y: 760, width: 250, height: 140 },
    interactionPoint: { x: 390, y: 860 },
    interactionRadius: 110,
    type: "resident",
    status: "active",
  },

  // ---- ESPACIOS DISPONIBLES --------------------------------
  {
    id: "pabellon-04",
    name: "PABELLÓN 04",
    number: "P04",
    buildingRect: { x: 360, y: 150, width: 350, height: 300 },
    interactionPoint: { x: 540, y: 500 },
    interactionRadius: 110,
    type: "available",
    status: "available",
    areaM2: 42,
    cta: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },
  {
    id: "pabellon-01",
    name: "PABELLÓN 01",
    number: "P01",
    buildingRect: { x: 1450, y: 150, width: 550, height: 300 },
    interactionPoint: { x: 1450, y: 450 },
    interactionRadius: 110,
    type: "available",
    status: "available",
    areaM2: 80,
    cta: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },
  {
    id: "pabellon-02",
    name: "PABELLÓN 02",
    number: "P02",
    buildingRect: { x: 1450, y: 470, width: 550, height: 300 },
    interactionPoint: { x: 1450, y: 660 },
    interactionRadius: 110,
    type: "available",
    status: "available",
    areaM2: 80,
    cta: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },
  {
    id: "pabellon-03",
    name: "PABELLÓN 03",
    number: "P03",
    buildingRect: { x: 1700, y: 790, width: 300, height: 300 },
    interactionPoint: { x: 1660, y: 910 },
    interactionRadius: 110,
    type: "available",
    status: "available",
    areaM2: 46,
    cta: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },
  {
    id: "nave-03",
    name: "NAVE 03",
    number: "N03",
    buildingRect: { x: 400, y: 1120, width: 420, height: 400 },
    interactionPoint: { x: 610, y: 1090 },
    interactionRadius: 110,
    type: "available",
    status: "available",
    areaM2: 95,
    cta: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },
  {
    id: "nave-02",
    name: "NAVE 02",
    number: "N02",
    buildingRect: { x: 840, y: 1120, width: 500, height: 400 },
    interactionPoint: { x: 1090, y: 1090 },
    // Radio menor para que la etiqueta no aparezca sola en el spawn
    interactionRadius: 88,
    type: "available",
    status: "available",
    areaM2: 117,
    cta: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },
  {
    id: "nave-01",
    name: "NAVE 01",
    number: "N01",
    buildingRect: { x: 1380, y: 1120, width: 620, height: 400 },
    interactionPoint: { x: 1610, y: 1090 },
    interactionRadius: 110,
    type: "available",
    status: "available",
    areaM2: 117,
    cta: { label: "INFORMACIÓN", targetSpaceId: "contacto" },
  },

  // ---- PATIO / PROGRAMA ------------------------------------
  {
    id: "eventos",
    name: "EVENTOS",
    subtitle: "Programa del patio",
    details: ["Bazares", "Exhibiciones", "Activaciones", "Encuentros"],
    interactionPoint: { x: 1100, y: 780 },
    interactionRadius: 110,
    type: "event",
    status: "coming-soon",
  },
  {
    id: "talleres",
    name: "TALLERES",
    subtitle: "Cursos y experiencias",
    description: "Cursos y experiencias impartidas por los talleres residentes.",
    interactionPoint: { x: 760, y: 940 },
    interactionRadius: 110,
    type: "event",
    status: "coming-soon",
  },
  {
    id: "contacto",
    name: "CONTACTO",
    subtitle: "La Bor — Talleres",
    description: "Tulum, Quintana Roo, México.",
    details: ["Instagram —", "WhatsApp —", "Email —"],
    interactionPoint: { x: 1330, y: 1052 },
    interactionRadius: 110,
    type: "navigation",
    status: "coming-soon",
  },
  {
    id: "agenda",
    name: "AGENDA",
    subtitle: "Calendario de talleres y eventos",
    interactionRadius: 110,
    type: "navigation",
    status: "coming-soon",
  },
]

export function getSpace(id: string): WorkshopSpace | undefined {
  return SPACES.find((s) => s.id === id)
}

/** Espacios que existen físicamente en el mundo (con punto de interacción). */
export const WORLD_SPACES = SPACES.filter((s) => s.interactionPoint)

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
  }
}
