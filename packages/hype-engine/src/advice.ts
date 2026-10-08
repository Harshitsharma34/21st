import type { Destination, Forecast, LeavePlan, TripPrefs } from "./types"
import type { BundleView } from "./store"

export function leavePlan(destination: Destination, forecast: Forecast, view: BundleView): LeavePlan {
  const traffic = view.traffic.find((row) => row.destinationId === destination.id)
  const heavy = (forecast.signals.traffic.pressure ?? 100) >= 140 || (traffic?.predictedTravelDayRatio ?? 1) >= 1.4
  const segments = (traffic?.segments ?? []).map((segment) => {
    const congestion = segment.normalMinutes > 0 ? segment.trafficMinutes / segment.normalMinutes : 1
    return {
      name: segment.name,
      congestion: Math.round(congestion * 100) / 100,
      note: congestion >= 1.45 ? "this is where the queue forms" : congestion >= 1.2 ? "slower than a clear run" : "ordinary",
    }
  })
  if (!heavy) {
    return {
      destinationId: destination.id,
      departLabel: "saturday, late morning",
      returnLabel: "sunday, whenever the valley lets you",
      line: "The road is not the story. Leave when you have had coffee.",
      segments,
    }
  }
  return {
    destinationId: destination.id,
    departLabel: "friday, 5:40am",
    returnLabel: "sunday, by 2pm",
    line: "Leave Delhi before the city wakes. Saturday noon meets the rush around Chandigarh. Come back Sunday afternoon, before the downhill wave.",
    segments,
  }
}

export function formatDriveDelta(hours: number): string {
  const sign = hours >= 0 ? "+" : "−"
  const abs = Math.abs(hours)
  const whole = Math.floor(abs)
  const minutes = Math.round((abs - whole) * 60)
  if (whole === 0) return `${sign}${minutes}m`
  return `${sign}${whole}h ${minutes.toString().padStart(2, "0")}m`
}

export function priceDelta(base: number, other: number): string {
  if (base <= 0) return "similar"
  const pct = Math.round((1 - other / base) * 100)
  if (pct > 0) return `~${pct}% cheaper`
  if (pct < 0) return `~${Math.abs(pct)}% more`
  return "about the same"
}

export function rankAlternatives(
  forecasts: Array<{ destination: Destination; forecast: Forecast }>,
  selectedId: string,
  prefs: TripPrefs,
): Array<{ destination: Destination; forecast: Forecast }> {
  const selected = forecasts.find((item) => item.destination.id === selectedId)
  const selectedRegion = selected?.destination.region.split(", ").pop()
  return forecasts
    .filter((item) => item.destination.id !== selectedId)
    .filter((item) => item.destination.driveHoursFromDelhi <= prefs.maxTravelHours + 1.5)
    .sort((a, b) => score(b) - score(a))

  function score(item: { destination: Destination; forecast: Forecast }): number {
    const region = item.destination.region.split(", ").pop()
    const sameRegion = selectedRegion != null && region === selectedRegion ? 0.55 : 0
    const shared = selected?.destination.tripTypes.some((type) => item.destination.tripTypes.includes(type)) ? 0.15 : 0
    const over = Math.max(0, item.destination.driveHoursFromDelhi - prefs.maxTravelHours)
    return item.forecast.worthIt.value + sameRegion + shared - over * 0.35
  }
}

export interface ReelReading {
  fetchedFromNetwork: false
  extractedFrom: "user-provided"
  destinationId: string | null
  destinationName: string | null
  warning: string
  host: string | null
}

export function readReel(input: { url: string; note?: string }, destinations: Destination[]): ReelReading {
  const raw = `${input.url} ${input.note ?? ""}`.toLowerCase()
  let host: string | null = null
  try {
    host = new URL(input.url).host
  } catch {
    host = null
  }
  const instagram = host?.includes("instagram.com") ?? false
  const match = destinations.find((destination) => raw.includes(destination.id) || raw.includes(destination.name))
  const warning = instagram
    ? "We did not retrieve this Reel from Instagram. The place comes only from what you pasted."
    : host?.includes("youtube.com") || host?.includes("youtu.be")
      ? "We did not open the video. The place comes only from the link text and your note."
      : "Nothing was fetched from the network. We only read the text you gave us."
  return {
    fetchedFromNetwork: false,
    extractedFrom: "user-provided",
    destinationId: match?.id ?? null,
    destinationName: match?.name ?? null,
    warning,
    host,
  }
}
