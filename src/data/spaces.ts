// ============================================================
// LA BOR — espacios del taller (CONTENIDO)
// Nombres, estados, descripciones, áreas, renta y CTAs. La UBICACIÓN
// (huellas, puertas, puntos) vive en public/maps/labor-overworld.tmj:
// el juego relaciona ambos por `id` === `spaceId` del mapa.
// Lógica del complejo: 7 talleres + 3 naves. Residentes: CONTRASTE
// (joyería), VETA (carpintería), MANNNO (herrería).
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
  /** nombre corto para HUD / botón contextual */
  shortName?: string
  /** Índice arquitectónico corto (P01, N02, 01…) */
  number?: string
  subtitle?: string
  description?: string
  /** Líneas de detalle extra en el overlay (listas cortas) */
  details?: string[]
  type: SpaceType
  status: SpaceStatus
  areaM2?: number
  /** renta mensual (MXN); sin valor = a cotizar */
  rentMxn?: number
  /** acción principal del overlay */
  cta?: SpaceCta
  /** acción secundaria del overlay */
  cta2?: SpaceCta
  image?: string
}

// ---- contacto real ------------------------------------------------------
export const CONTACT = {
  email: "labortulum@gmail.com",
  phoneDisplay: "+52 55 3037 4167",
  phoneWa: "525530374167",
  instagram: "",
  address: "Calle Cobá esq. Calle 12 Sur · Tulum, Quintana Roo, México",
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${CONTACT.phoneWa}?text=${encodeURIComponent(message)}`
}

export function mailLink(subject: string, body = ""): string {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`
}

/** CTA de propuesta para un espacio disponible (WhatsApp, mensaje prellenado) */
export function proposalCta(space: Pick<WorkshopSpace, "name" | "areaM2">): SpaceCta {
  const msg = `Hola La Bor, me interesa ${space.name} (${space.areaM2} m²). Mi propuesta: uso: ___, plazo: ___, fecha de entrada: ___.`
  return { label: "ENVIAR PROPUESTA", href: whatsappLink(msg) }
}

const PROPOSAL_HINT = "Cuéntanos qué harías ahí, por cuánto tiempo y desde cuándo. Las mejores propuestas se quedan con el espacio."

function available(id: string, name: string, number: string, areaM2: number, rentMxn: number | undefined, details: string[] = []): WorkshopSpace {
  const space: WorkshopSpace = {
    id,
    name,
    shortName: name,
    number,
    type: "available",
    status: "available",
    areaM2,
    rentMxn,
    description: rentMxn
      ? `Renta mensual: $${rentMxn.toLocaleString("es-MX")} MXN. ${PROPOSAL_HINT}`
      : `Renta a cotizar según uso y plazo. ${PROPOSAL_HINT}`,
    details,
    cta: { label: "RECORRER EL ESPACIO", enterSceneId: `${id}-room` },
  }
  space.cta2 = proposalCta(space)
  return space
}

export const SPACES: WorkshopSpace[] = [
  // ---- RESIDENTES ------------------------------------------
  {
    id: "contraste",
    name: "CONTRASTE ATELIER",
    shortName: "CONTRASTE",
    number: "01",
    subtitle: "Joyería / Producción / Talleres",
    description:
      "Taller dedicado a la joyería, el trabajo en plata, la producción y talleres presenciales.",
    type: "resident",
    status: "active",
    cta: { label: "ENTRAR AL TALLER", enterSceneId: "contraste-room" },
    cta2: { label: "VER AGENDA", targetSpaceId: "agenda" },
  },
  {
    id: "veta",
    name: "VETA",
    shortName: "VETA",
    number: "02",
    subtitle: "Carpintería / Diseño / Producción",
    description: "Taller de carpintería enfocado en diseño y producción en madera.",
    type: "resident",
    status: "active",
    cta: { label: "ENTRAR AL TALLER", enterSceneId: "veta-room" },
  },
  {
    id: "mannno",
    name: "MANNNO",
    shortName: "MANNNO",
    number: "03",
    subtitle: "Herrería / Metal",
    description: "Taller de herrería y trabajo en metal.",
    type: "resident",
    status: "active",
    cta: { label: "ENTRAR AL TALLER", enterSceneId: "mannno-room" },
  },

  // ---- ESPACIOS DISPONIBLES --------------------------------
  // Pabellones chicos: $10,000 MXN / mes · grandes: $15,000 MXN / mes.
  // Naves: a cotizar. Sin "negociable": se piden propuestas.
  available("pabellon-04", "PABELLÓN 04", "P04", 42, 10000, ["Planta libre — 6.05 × 6.85 m", "Junto a CONTRASTE, frente al patio"]),
  available("pabellon-01", "PABELLÓN 01", "P01", 80, 15000, ["Interior — 45.6 m²", "Terraza exterior — 33.3 m²"]),
  available("pabellon-02", "PABELLÓN 02", "P02", 80, 15000, ["Interior — 45.7 m²", "Terraza exterior — 33.3 m²"]),
  available("pabellon-03", "PABELLÓN 03", "P03", 46, 10000, ["Planta libre — 6.85 × 6.67 m", "Junto al ingreso por Calle 12 Sur"]),
  available("nave-03", "NAVE 03", "N03", 95, undefined, ["Nave — 7.85 × 12.06 m", "Frente al patio, acceso desde Calle Cobá"]),
  available("nave-02", "NAVE 02", "N02", 117, undefined, ["Nave — 9.70 × 12.06 m", "Frente al patio"]),
  available("nave-01", "NAVE 01", "N01", 117, undefined, ["Nave — 9.70 × 12.06 m", "Esquina Calle Cobá / Calle 12 Sur"]),

  // ---- PATIO / PROGRAMA ------------------------------------
  {
    id: "pieza-central",
    name: "LA PIEZA CENTRAL",
    shortName: "LA PIEZA",
    subtitle: "Instalación colaborativa",
    type: "installation",
    status: "active",
  },
  {
    id: "eventos-board",
    name: "EVENTOS",
    shortName: "EVENTOS",
    subtitle: "Programa del patio",
    description: "El patio se abre a bazares, exhibiciones, activaciones y encuentros. ¿Tienes un evento? Propónlo.",
    details: ["Bazares", "Exhibiciones", "Activaciones", "Encuentros"],
    type: "event",
    status: "active",
    cta: { label: "PROPONER UN EVENTO", href: whatsappLink("Hola La Bor, quiero proponer un evento en el patio: ___ (fecha: ___).") },
    cta2: { label: "VER AGENDA", targetSpaceId: "agenda" },
  },
  {
    id: "info-totem",
    name: "CONTACTO",
    shortName: "INFORMACIÓN",
    subtitle: "La Bor — Talleres",
    description: `${CONTACT.address}. Espacios disponibles desde $10,000 MXN al mes; naves a cotizar. Escríbenos para visitar.`,
    details: [`WhatsApp — ${CONTACT.phoneDisplay}`, `Email — ${CONTACT.email}`],
    type: "navigation",
    status: "active",
    cta: { label: "WHATSAPP", href: whatsappLink("Hola La Bor, quiero información sobre los espacios disponibles.") },
    cta2: { label: "EMAIL", href: mailLink("Información La Bor — espacios disponibles") },
  },
  {
    id: "agenda",
    name: "AGENDA",
    shortName: "AGENDA",
    subtitle: "Calendario de talleres y eventos",
    description: "Cursos, experiencias y eventos impartidos por los talleres residentes. Escríbenos para enterarte de las próximas fechas.",
    type: "navigation",
    status: "coming-soon",
    cta: { label: "AVÍSAME POR WHATSAPP", href: whatsappLink("Hola La Bor, quiero enterarme de los próximos talleres y eventos.") },
  },
]

export function getSpace(id: string): WorkshopSpace | undefined {
  return SPACES.find((s) => s.id === id)
}

export const RESIDENTS = SPACES.filter((s) => s.type === "resident")
export const AVAILABLE = SPACES.filter((s) => s.type === "available")

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
    case "mannno":
      return "#8e9299"
    default:
      return undefined
  }
}
