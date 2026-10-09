import type { Horizon, LeadBucket } from "./types"

/** Demo clock. Monday 5 Oct 2026, so "this weekend" is a real T-5 forecast. */
export const DEMO_AS_OF = "2026-10-05T09:00:00+05:30"

const DAY = 86_400_000

function atNoon(isoDate: string): Date {
  return new Date(`${isoDate}T12:00:00+05:30`)
}

export function formatDay(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(date)
}

export function isoDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY)
}

export function leadBucket(leadDays: number): LeadBucket {
  if (leadDays <= 0) return "TRAVEL_DAY"
  if (leadDays <= 3) return "T3_T1"
  if (leadDays <= 7) return "T7_T4"
  if (leadDays <= 14) return "T14_T7"
  return "T30_T14"
}

function nextWeekday(asOf: Date, weekday: number): Date {
  const probe = atNoon(isoDate(asOf))
  const current = probe.getUTCDay()
  // Asia/Kolkata noon is still the same calendar date in UTC for these hours.
  const ist = new Date(asOf.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
  const day = ist.getDay()
  let delta = (weekday - day + 7) % 7
  if (delta === 0) delta = 0
  return addDays(atNoon(isoDate(asOf)), delta)
}

function weekendStart(asOf: Date): Date {
  const ist = new Date(asOf.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
  const day = ist.getDay()
  if (day === 6) return atNoon(isoDate(asOf))
  if (day === 0) return addDays(atNoon(isoDate(asOf)), -1)
  return nextWeekday(asOf, 6)
}

/**
 * Horizon context for the demo clock.
 * 2 Oct 2026 was Gandhi Jayanti (Friday) — that long weekend has already passed
 * by Monday 5 Oct, so 10–11 Oct is an ordinary weekend. Dussehra 2026 falls on
 * 20 Oct and is tagged only on horizons that include it.
 */
export function buildHorizons(asOfIso = DEMO_AS_OF): Horizon[] {
  const asOf = new Date(asOfIso)
  const today = atNoon(isoDate(asOf))
  const saturday = weekendStart(asOf)
  const nextSaturday = addDays(saturday, 7)
  const in30 = addDays(today, 30)
  const in90 = addDays(today, 90)

  const specs: Array<Omit<Horizon, "leadDays" | "bucket" | "weekend" | "longWeekend" | "publicHoliday" | "festival" | "schoolHoliday" | "majorEvent"> & { startDate: Date; endDate: Date }> = [
    { id: "now", label: "now", short: "now", start: isoDate(today), end: isoDate(today), startDate: today, endDate: today },
    { id: "weekend", label: "this weekend", short: "weekend", start: isoDate(saturday), end: isoDate(addDays(saturday, 1)), startDate: saturday, endDate: addDays(saturday, 1) },
    { id: "next-weekend", label: "next weekend", short: "next", start: isoDate(nextSaturday), end: isoDate(addDays(nextSaturday, 1)), startDate: nextSaturday, endDate: addDays(nextSaturday, 1) },
    { id: "30d", label: "30 days", short: "30d", start: isoDate(in30), end: isoDate(addDays(in30, 1)), startDate: in30, endDate: addDays(in30, 1) },
    { id: "90d", label: "3 months", short: "3m", start: isoDate(in90), end: isoDate(addDays(in90, 1)), startDate: in90, endDate: addDays(in90, 1) },
  ]

  for (let i = 0; i <= 14; i += 1) {
    const day = addDays(today, i)
    const id = `day:${isoDate(day)}`
    if (specs.some((spec) => spec.id === id || spec.start === isoDate(day) && spec.id.startsWith("day:"))) continue
    specs.push({
      id,
      label: formatDay(day).toLowerCase(),
      short: formatDay(day).toLowerCase(),
      start: isoDate(day),
      end: isoDate(day),
      startDate: day,
      endDate: day,
    })
  }

  return specs.map((spec) => {
    const leadDays = Math.round((spec.startDate.getTime() - today.getTime()) / DAY)
    const startDay = spec.startDate.getUTCDay()
    const weekend = startDay === 6 || startDay === 0 || spec.id === "weekend" || spec.id === "next-weekend"
    const festival = spec.start >= "2026-10-19" && spec.start <= "2026-10-21"
    return {
      id: spec.id,
      label: spec.label,
      short: spec.short,
      start: spec.start,
      end: spec.end,
      leadDays,
      bucket: leadBucket(leadDays),
      weekend: weekend || spec.id.includes("weekend"),
      longWeekend: false,
      publicHoliday: festival,
      festival,
      schoolHoliday: false,
      majorEvent: festival,
    }
  })
}

export function scrubDays(asOfIso = DEMO_AS_OF): Horizon[] {
  return buildHorizons(asOfIso)
    .filter((horizon) => horizon.id.startsWith("day:") || horizon.id === "now")
    .sort((a, b) => a.start.localeCompare(b.start))
}
