import { leavePlan, rankAlternatives } from "./advice"
import { forecastDestination } from "./forecast"
import { loadFixtureBundle } from "./fixtures"
import { describeProviders } from "./providers"
import { appendBundle, createBundle, type BundleView } from "./store"
import { buildHorizons, DEMO_AS_OF } from "./time"
import type { Board, Destination, Forecast, Horizon, TripPrefs } from "./types"

export const DEFAULT_PREFS: TripPrefs = {
  originId: "delhi",
  people: 2,
  budgetInr: null,
  maxTravelHours: 12,
  tripType: "mountains",
  crowdTolerance: "balanced",
}

let cached: BundleView | null = null

export function observationView(): BundleView {
  if (!cached) {
    const bundle = loadFixtureBundle()
    cached = createBundle(bundle, DEMO_AS_OF)
    // Collecting twice must not overwrite or duplicate snapshots.
    appendBundle(cached, bundle)
  }
  return cached
}

export function resetObservations(): void {
  cached = null
}

export function buildBoard(prefs: TripPrefs = DEFAULT_PREFS, asOf = DEMO_AS_OF): Board {
  const view = observationView()
  const horizons = buildHorizons(asOf)
  const providers = describeProviders()
  const fixtureOnly = providers.every((provider) => provider.mode !== "live")
  const anyLive = providers.some((provider) => provider.mode === "live")
  const destinations = view.destinations.map((destination) => {
    const series: Record<string, Forecast> = {}
    for (const horizon of horizons) {
      series[horizon.id] = forecastDestination(destination, horizon, prefs, view)
    }
    return {
      ...destination,
      series,
      crowdNow: series.now?.crowd.value ?? 0,
    }
  })
  const weekendPairs = destinations.map((destination) => ({
    destination,
    forecast: destination.series.weekend!,
  }))
  const opportunities = pickOpportunities(weekendPairs, destinations)
  return {
    asOf,
    clockLabel: "monday 5 oct · demo clock",
    dataMode: anyLive && fixtureOnly ? "mixed" : anyLive ? "live" : "fixture",
    providers,
    horizons: horizons.filter((horizon) => ["now", "weekend", "next-weekend", "30d", "90d"].includes(horizon.id) || horizon.id.startsWith("day:")),
    destinations,
    spots: view.spots.filter((spot) => spot.sensitivity !== "high"),
    opportunities,
  }
}

function pickOpportunities(
  weekend: Array<{ destination: Destination; forecast: Forecast }>,
  all: Board["destinations"],
): Board["opportunities"] {
  const rising = [...weekend]
    .filter((item) => item.forecast.lifecycle === "RISING" || item.forecast.lifecycle === "EMERGING")
    .sort((a, b) => b.forecast.hype.value - a.forecast.hype.value)
  const quiet = [...weekend].sort((a, b) => a.forecast.crowd.value - b.forecast.crowd.value)
  const weather = [...weekend].sort((a, b) => (b.forecast.signals.weather.pressure ?? 0) - (a.forecast.signals.weather.pressure ?? 0))
  const rooms = [...weekend].sort((a, b) => (a.forecast.signals.booking.pressure ?? 100) - (b.forecast.signals.booking.pressure ?? 100))
  const cards = [
    rising[0] ? { id: "before", kicker: "go before everyone else", destinationId: rising[0].destination.id, line: "Hype is rising. The meadows are not full." } : null,
    quiet[0] ? { id: "quiet", kicker: "quiet this weekend", destinationId: quiet[0].destination.id, line: "Visitor pressure stays low while the famous names fill." } : null,
    weather[0] ? { id: "weather", kicker: "perfect weather", destinationId: weather[0].destination.id, line: weather[0].forecast.signals.weather.display } : null,
    rooms[0] ? { id: "rooms", kicker: "rooms still on the board", destinationId: rooms[0].destination.id, line: "Availability is not contracting the way it is everywhere else." } : null,
  ].filter((item): item is Board["opportunities"][number] => Boolean(item))
  const seen = new Set<string>()
  void all
  return cards.filter((card) => {
    if (seen.has(card.destinationId)) return false
    seen.add(card.destinationId)
    return true
  })
}

export function comparePair(leftId: string, rightId: string, horizonId: string, prefs: TripPrefs = DEFAULT_PREFS) {
  const board = buildBoard(prefs)
  const left = board.destinations.find((item) => item.id === leftId)
  const right = board.destinations.find((item) => item.id === rightId)
  if (!left || !right) return null
  const horizon = board.horizons.find((item) => item.id === horizonId) ?? board.horizons.find((item) => item.id === "weekend")!
  return {
    horizon,
    left: { destination: left, forecast: left.series[horizon.id] ?? left.series.weekend! },
    right: { destination: right, forecast: right.series[horizon.id] ?? right.series.weekend! },
    leave: {
      left: leavePlan(left, left.series[horizon.id] ?? left.series.weekend!, observationView()),
      right: leavePlan(right, right.series[horizon.id] ?? right.series.weekend!, observationView()),
    },
  }
}

export function smartTrip(prefs: TripPrefs, horizonId = "weekend") {
  const board = buildBoard(prefs)
  const ranked = board.destinations
    .map((destination) => ({ destination, forecast: destination.series[horizonId] ?? destination.series.weekend! }))
    .filter((item) => item.destination.driveHoursFromDelhi <= prefs.maxTravelHours + 0.4)
    .sort((a, b) => b.forecast.worthIt.value - a.forecast.worthIt.value)
  return { board, best: ranked[0] ?? null, ranked: ranked.slice(0, 4) }
}

export function alternativeFor(destinationId: string, horizonId: string, prefs: TripPrefs = DEFAULT_PREFS) {
  const board = buildBoard(prefs)
  const pairs = board.destinations.map((destination) => ({
    destination,
    forecast: destination.series[horizonId] ?? destination.series.weekend!,
  }))
  const [best] = rankAlternatives(pairs, destinationId, prefs)
  return best ?? null
}

export type { Horizon }
