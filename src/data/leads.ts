// ============================================================
// LA BOR — conversión: cada botón manda a WhatsApp con el mensaje ya
// escrito según lo que el interesado eligió (espacio, plan, uso,
// evento). Sin formularios: un toque y a la conversación.
// ============================================================

import { eventDateLabel, eventTimeLabel, type LaborEvent } from "./events"
import { CONTACT, mailLink, whatsappLink, whatsappLinkTo, type WorkshopSpace } from "./spaces"

export const PRICE_LEGEND = `Condiciones y disponibilidad por WhatsApp al ${CONTACT.phoneDisplay} o por correo a ${CONTACT.email}.`

export const USE_OPTIONS = ["TALLER", "ESTUDIO", "OFICINA", "MARCA / SHOWROOM", "BODEGA", "OTRO"] as const
export type UseOption = (typeof USE_OPTIONS)[number]

function spaceRef(space: WorkshopSpace): string {
  return `${space.name}${space.areaM2 ? ` (${space.areaM2} m²)` : ""}`
}

/** ME INTERESA: espacio + uso elegido (condiciones y renta se platican por WhatsApp) */
export function interestLink(space: WorkshopSpace, use?: UseOption | null): string {
  const parts = [`Hola La Bor, me interesa ${spaceRef(space)}. Quiero conocer condiciones y disponibilidad.`]
  if (use) parts.push(`Lo usaría como ${use.toLowerCase()}.`)
  parts.push("¿Podemos hablar?")
  return whatsappLink(parts.join(" "))
}

export function interestMail(space: WorkshopSpace, use?: UseOption | null): string {
  const subject = `Me interesa ${space.name}`
  const body = [`Hola La Bor,`, ``, `Me interesa ${spaceRef(space)}. Quiero conocer condiciones y disponibilidad.`, use ? `Uso: ${use.toLowerCase()}.` : "", ``, `Mi nombre:`, `Mi teléfono:`].filter((l) => l !== "").join("\n")
  return mailLink(subject, body)
}

/** RESERVADO: lista de espera */
export function waitlistLink(space: WorkshopSpace): string {
  return whatsappLink(`Hola La Bor, ${spaceRef(space)} aparece reservado. Quiero entrar a la lista de espera por si se libera, y conocer otros espacios parecidos.`)
}

/** EN OBRA: avisarme cuando abra (Pabellón 01) */
export function openingLink(space: WorkshopSpace): string {
  return whatsappLink(`Hola La Bor, me interesa ${spaceRef(space)}, que está en obra. Avísenme antes que a nadie cuando esté listo y díganme si puedo apartarlo desde ahora.`)
}

/** AGENDAR VISITA (con o sin espacio) */
export function visitLink(space?: WorkshopSpace | null): string {
  const what = space ? `para conocer ${spaceRef(space)} y el patio` : "para conocer los espacios disponibles"
  return whatsappLink(`Hola La Bor, quiero agendar una visita ${what}. ¿Qué día y hora puedo ir?`)
}

/** información general */
export function infoLink(): string {
  return whatsappLink("Hola La Bor, quiero información de los espacios disponibles: condiciones, plazos y disponibilidad.")
}

/** evento: voy / stand */
export function rsvpLink(ev: LaborEvent): string {
  return whatsappLink(`Hola La Bor, voy al ${ev.kind.toLowerCase()} ${ev.name} el ${eventDateLabel(ev).toLowerCase()} (${eventTimeLabel(ev).toLowerCase()}). Somos ___ personas.`)
}

export function vendorLink(ev: LaborEvent): string {
  return whatsappLink(`Hola La Bor, quiero poner un stand en el ${ev.kind.toLowerCase()} ${ev.name} del ${eventDateLabel(ev).toLowerCase()}. Mi marca / lo que vendo: ___.`)
}

export function eventProposalLink(): string {
  return whatsappLink("Hola La Bor, quiero proponer un evento en el patio: ___ (fecha tentativa: ___).")
}

/** Mensaje a la persona del taller: "Hola Pablo, … el taller de carpintería VETA". */
export function workshopInfoMessage(space: WorkshopSpace): string | null {
  const c = space.contact
  if (!c) return null
  return `Hola ${c.name}, vengo del recorrido de La Bor (labortulum.com) y me interesa más información sobre el taller de ${c.craft} ${space.name}.`
}

export function workshopInfoLink(space: WorkshopSpace): string | null {
  const msg = workshopInfoMessage(space)
  return msg && space.contact ? whatsappLinkTo(space.contact.phoneWa, msg) : null
}

/** llamada directa (teléfono) */
export function callLink(phoneWa: string): string {
  return `tel:+${phoneWa}`
}

/** cómo llegar: ubicación en Google Maps */
export function mapsLink(): string {
  return CONTACT.maps
}

/** "@contraste_atelier" a partir de la URL del perfil */
export function instagramHandle(url: string): string {
  const m = url.match(/instagram\.com\/([^/?#]+)/)
  return m ? `@${m[1]}` : "INSTAGRAM"
}

/** lista para el próximo evento del patio (cuando no hay fecha anunciada) */
export function notifyNextEventLink(): string {
  return whatsappLink("Hola La Bor, avísenme del próximo evento en el patio. Me interesa: ___ (ir / poner stand).")
}

export function vendorNextEventLink(): string {
  return whatsappLink("Hola La Bor, quiero poner un stand en el próximo bazar PATIO. Mi marca / lo que vendo: ___.")
}
