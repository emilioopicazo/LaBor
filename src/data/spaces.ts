// ============================================================
// LA BOR — espacios del taller (CONTENIDO)
// Nombres, estados, descripciones, áreas, renta y CTAs. La UBICACIÓN
// (huellas, puertas, puntos) vive en public/maps/labor-overworld.tmj:
// el juego relaciona ambos por `id` === `spaceId` del mapa.
// Lógica del complejo: 7 talleres + 3 naves. Residentes: CONTRASTE
// (joyería), VETA (carpintería), MANNNO (herrería).
// ============================================================

export type SpaceType = "resident" | "available" | "event" | "navigation" | "installation"
export type SpaceStatus = "active" | "coming-soon" | "available" | "reserved"

/** plan de renta: renta mensual según la duración del contrato */
export interface RentPlan {
  id: "6m" | "12m"
  label: "6 MESES" | "1 AÑO"
  monthlyMxn: number
}

export interface SpaceCta {
  label: string
  href?: string
  /** Abre otro overlay (p. ej. INFORMACIÓN → CONTACTO) */
  targetSpaceId?: string
  /** Entra a la escena de taller (cuarto jugable) */
  enterSceneId?: string
  /** Camina (viaje rápido) hasta la puerta del espacio en el patio */
  travelTo?: string
}

/** persona del taller: a quién escribirle y de qué es el taller (mensaje prellenado) */
export interface WorkshopContact {
  name: string
  role: string
  /** "carpintería" / "herrería" / "joyería" (va dentro del mensaje) */
  craft: string
  blurb: string
  phoneDisplay: string
  phoneWa: string
  /** avatar que la representa de pie dentro del taller */
  avatarId: string
  /** perfil de Instagram del taller (sin parámetros de rastreo) */
  instagram?: string
  /** ficha propia del taller en Google Maps */
  maps?: string
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
  /** planes de renta (vacío = a cotizar) */
  plans?: RentPlan[]
  /** qué incluye / datos duros del espacio */
  includes?: string[]
  /** acción principal del overlay */
  cta?: SpaceCta
  /** acción secundaria del overlay */
  cta2?: SpaceCta
  image?: string
  contact?: WorkshopContact
  /** se entra caminando desde el patio (sin cambiar de escena): el techo se vuelve transparente */
  walkIn?: boolean
}

// ---- contacto real ------------------------------------------------------
export const CONTACT = {
  email: "labortulum@gmail.com",
  phoneDisplay: "+52 55 3037 4167",
  phoneWa: "525530374167",
  instagram: "",
  address: "Calle Cobá esq. Calle 12 Sur · Tulum, Quintana Roo, México",
  /** ubicación en Google Maps (compartir / cómo llegar) */
  maps: "https://maps.app.goo.gl/6VRuvk6EfHDT1byW8",
}

export function whatsappLink(message: string): string {
  return whatsappLinkTo(CONTACT.phoneWa, message)
}

/** WhatsApp a un número específico (la persona de cada taller) */
export function whatsappLinkTo(phoneWa: string, message: string): string {
  return `https://wa.me/${phoneWa}?text=${encodeURIComponent(message)}`
}

export function mailLink(subject: string, body = ""): string {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`
}

// Renta: NO se publica ningún precio ni plan en el sitio. Todo se pregunta
// por WhatsApp (la razón para contactar). `plans` queda vacío a propósito.

const SHARED = "Patio compartido con VETA, MANNNO y CONTRASTE, y programa de eventos en el patio."

/** Pabellón 01: en obra, sin fecha pública */
export const OPENING_LABEL = "PRÓXIMAMENTE"

/** La nave es una sola (7 m de altura) que se está subdividiendo en 3 módulos */
const NAVE_SHARED = ["Módulo de una nave de 7 m de altura, en subdivisión (3 módulos)", "Pensada para artistas y artesanos: producción, estudio, exhibición"]

function available(
  id: string,
  name: string,
  number: string,
  areaM2: number,
  plans: RentPlan[],
  status: "available" | "reserved" | "coming-soon",
  details: string[] = [],
  includes: string[] = [],
  description?: string,
): WorkshopSpace {
  const nave = id.startsWith("nave")
  return {
    id,
    name,
    shortName: name,
    number,
    type: "available",
    status,
    areaM2,
    plans,
    details,
    includes: [...includes, SHARED],
    description:
      description ??
      (status === "reserved"
        ? "Este espacio ya está apartado. Si se libera, avisamos primero a la lista de espera y te enseñamos otros parecidos."
        : status === "coming-soon"
          ? "En obra. Déjanos tu interés y te avisamos antes que a nadie cuando esté listo."
          : nave
            ? "Camina adentro para ver el módulo y escríbenos: te mandamos propuesta según uso y plazo."
            : "Camina adentro para verlo y escríbenos: te respondemos por WhatsApp con condiciones, disponibilidad y fecha de entrada."),
    // los disponibles se recorren sin cambiar de escena: el CTA te lleva caminando a la puerta
    walkIn: status !== "coming-soon",
    cta: status === "coming-soon" ? undefined : { label: nave ? "CAMINAR A LA NAVE" : "CAMINAR AL PABELLÓN", travelTo: id },
    ...(nave ? { subtitle: "Nave / 7 m de altura / Módulo" } : {}),
  }
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
    contact: {
      name: "Emilio",
      role: "Joyería · CONTRASTE",
      craft: "joyería",
      blurb: "Joyería en plata, producción para marcas y talleres presenciales. Pregúntale por piezas a medida o por las próximas fechas de taller.",
      phoneDisplay: "+52 55 3037 4167",
      phoneWa: "525530374167",
      avatarId: "nomada-nocturno",
      instagram: "https://www.instagram.com/contraste_atelier",
      maps: "https://maps.app.goo.gl/iADtLSqQsbCzESX18",
    },
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
    contact: {
      name: "Pablo",
      role: "Carpintería · VETA",
      craft: "carpintería",
      blurb: "Muebles y piezas a medida, producción en madera y diseño. Pregúntale por un proyecto o por tiempos y precios.",
      phoneDisplay: "+52 33 3350 7799",
      phoneWa: "523333507799",
      avatarId: "playero",
      instagram: "https://www.instagram.com/vetatallermx",
    },
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
    contact: {
      name: "Azul",
      role: "Herrería · MANNNO",
      craft: "herrería",
      blurb: "Herrería y metal: estructuras, piezas a medida y producción. Pregúntale por un proyecto o por lo que se puede fabricar aquí.",
      phoneDisplay: "+52 33 1266 3462",
      phoneWa: "523312663462",
      avatarId: "creativa",
    },
  },

  // ---- ESPACIOS DISPONIBLES --------------------------------
  // Estado (oct 2026): 02, 03, 04 y las tres naves disponibles (se entra
  // caminando, el techo se vuelve transparente); 01 en obra, sin fecha pública.
  available("pabellon-04", "PABELLÓN 04", "P04", 42, [], "available", ["Planta libre — 6.05 × 6.85 m", "Junto a CONTRASTE, frente al patio"]),
  available("pabellon-01", "PABELLÓN 01", "P01", 80, [], "coming-soon", ["Interior — 45.6 m²", "Terraza exterior — 33.3 m²"]),
  available("pabellon-02", "PABELLÓN 02", "P02", 80, [], "available", ["Interior — 45.7 m²", "Terraza exterior — 33.3 m²"]),
  available("pabellon-03", "PABELLÓN 03", "P03", 46, [], "available", ["Planta libre — 6.85 × 6.67 m", "Junto al ingreso por Calle 12 Sur"]),
  available("nave-03", "NAVE 03", "N03", 95, [], "available", ["Módulo — 7.85 × 12.06 m", ...NAVE_SHARED, "Frente al patio, acceso desde Calle Cobá"]),
  available("nave-02", "NAVE 02", "N02", 117, [], "available", ["Módulo — 9.70 × 12.06 m", ...NAVE_SHARED, "Carpa beduina montada al centro: doble techo, lista para eventos"]),
  available("nave-01", "NAVE 01", "N01", 117, [], "available", ["Módulo — 9.70 × 12.06 m", ...NAVE_SHARED, "Esquina Calle Cobá / Calle 12 Sur"]),

  // ---- PATIO / PROGRAMA ------------------------------------
  {
    id: "pieza-central",
    name: "LA HORA",
    shortName: "LA HORA",
    subtitle: "La Pieza Central · reloj de sol de los tres talleres",
    type: "installation",
    status: "active",
  },
  {
    id: "eventos-board",
    name: "EVENTOS",
    shortName: "EVENTOS",
    subtitle: "Programa del patio",
    description: "El patio se abre a bazares, exhibiciones, activaciones y encuentros.",
    type: "event",
    status: "active",
  },
  {
    id: "info-totem",
    name: "CONTACTO",
    shortName: "INFORMACIÓN",
    subtitle: "La Bor — Talleres",
    description: `${CONTACT.address}. Pabellones y naves en renta. Escríbenos y te respondemos por WhatsApp.`,
    details: [`WhatsApp — ${CONTACT.phoneDisplay}`, `Email — ${CONTACT.email}`],
    type: "navigation",
    status: "active",
  },
  {
    id: "agenda",
    name: "AGENDA",
    shortName: "AGENDA",
    subtitle: "Calendario de talleres y eventos",
    description: "Cursos, experiencias y eventos de los talleres residentes. Escríbenos y te avisamos de las próximas fechas.",
    type: "navigation",
    status: "active",
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
      return space.status === "reserved" ? "ESPACIO RESERVADO" : space.status === "coming-soon" ? `EN OBRA · ${OPENING_LABEL}` : "ESPACIO DISPONIBLE"
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
      return "#a39d95"
    case "contraste":
      return "#b4544b"
    case "mannno":
      return "#7f8187"
    default:
      return undefined
  }
}
