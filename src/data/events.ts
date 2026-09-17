// ============================================================
// LA BOR — eventos del patio
// Fechas en hora de Tulum (UTC−5, sin horario de verano).
// ============================================================

import { CONTACT } from "./spaces"

export interface LaborEvent {
  id: string
  name: string
  /** tipo: BAZAR, EXHIBICIÓN, TALLER… */
  kind: string
  /** YYYY-MM-DD (fecha local) */
  date: string
  /** HH:MM local */
  start: string
  end: string
  place: string
  description: string
  /** cartel (ruta pública), para el pop-up de anuncios */
  poster?: string
  tagline?: string
  lineup?: string
}

export const EVENTS: LaborEvent[] = [
  {
    id: "patio-2026-09-20",
    name: "PATIO",
    kind: "BAZAR",
    date: "2026-09-20",
    start: "17:00",
    end: "23:00",
    place: "El patio de La Bor · Calle Cobá esq. Calle 12 Sur, La Veleta, Tulum",
    poster: "/assets/events/patio-2026-09-20.jpg",
    tagline: "OPEN WORKSHOP / CREATIVE BAZAAR",
    lineup: "DESIGN · OBJECTS · FOOD · PEOPLE · JEWELRY · ART · FASHION & MORE",
    description:
      "Bazar en el patio con los talleres abiertos: joyería de CONTRASTE, madera de VETA, metal de MANNNO y marcas invitadas. Entrada libre.",
  },
]

const DAYS = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"]
const MONTHS = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]

function localDate(ev: LaborEvent, time: string): Date {
  // hora de Tulum → UTC (UTC−5)
  const [y, m, d] = ev.date.split("-").map(Number)
  const [hh, mm] = time.split(":").map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh + 5, mm))
}

function hour12(time: string): string {
  const [hh, mm] = time.split(":").map(Number)
  const h = ((hh + 11) % 12) + 1
  return mm ? `${h}:${String(mm).padStart(2, "0")}` : `${h}`
}

/** "DOMINGO 20 DE SEPTIEMBRE" */
export function eventDateLabel(ev: LaborEvent): string {
  const [y, m, d] = ev.date.split("-").map(Number)
  const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return `${DAYS[day]} ${d} DE ${MONTHS[m - 1]}`
}

/** "5 A 11 PM" */
export function eventTimeLabel(ev: LaborEvent): string {
  const endPm = Number(ev.end.split(":")[0]) >= 12 ? "PM" : "AM"
  return `${hour12(ev.start)} A ${hour12(ev.end)} ${endPm}`
}

/** "DOM 20 SEP · 5–11 PM" (para menú / línea corta) */
export function eventShortLabel(ev: LaborEvent): string {
  const [, m, d] = ev.date.split("-").map(Number)
  const day = eventDateLabel(ev).slice(0, 3)
  return `${day} ${d} ${MONTHS[m - 1].slice(0, 3)} · ${hour12(ev.start)}–${hour12(ev.end)} PM`
}

/** el evento sigue vigente hasta que termina */
export function isUpcoming(ev: LaborEvent, now: Date = new Date()): boolean {
  return localDate(ev, ev.end).getTime() > now.getTime()
}

export function nextEvent(now: Date = new Date()): LaborEvent | null {
  return EVENTS.filter((e) => isUpcoming(e, now)).sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
}

/** Google Calendar (abre la app en el teléfono) */
export function calendarUrl(ev: LaborEvent): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${ev.name} · ${ev.kind} en La Bor`,
    dates: `${fmt(localDate(ev, ev.start))}/${fmt(localDate(ev, ev.end))}`,
    details: `${ev.description} Dudas por WhatsApp ${CONTACT.phoneDisplay}.`,
    location: ev.place,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** "HOY", "MAÑANA", "ESTE DOMINGO" o la fecha completa (calendario de Tulum). */
/** días que faltan para el evento (calendario de Tulum) y su día de la semana */
function daysUntil(ev: LaborEvent, now: Date): { days: number; weekday: string } {
  const tulumNow = new Date(now.getTime() - 5 * 3600 * 1000)
  const today = Date.UTC(tulumNow.getUTCFullYear(), tulumNow.getUTCMonth(), tulumNow.getUTCDate())
  const [y, m, d] = ev.date.split("-").map(Number)
  const day = Date.UTC(y, m - 1, d)
  return { days: Math.round((day - today) / 86400000), weekday: DAYS[new Date(day).getUTCDay()] }
}

export function eventRelativeLabel(ev: LaborEvent, now: Date = new Date()): string {
  const { days, weekday } = daysUntil(ev, now)
  if (days === 0) return "HOY"
  if (days === 1) return "MAÑANA"
  if (days > 1 && days <= 6) return `ESTE ${weekday}`
  return eventDateLabel(ev)
}

/** "PRÓXIMO DOMINGO", "MAÑANA" u "HOY": para la leyenda del montaje en el patio */
export function eventSoonLabel(ev: LaborEvent, now: Date = new Date()): string {
  const { days, weekday } = daysUntil(ev, now)
  if (days <= 0) return "HOY"
  if (days === 1) return "MAÑANA"
  return `PRÓXIMO ${weekday}`
}
