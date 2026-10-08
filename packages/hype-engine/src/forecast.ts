import { clamp, realization, round1, round2, ratioToScore, squashRatio } from "./math"
import type { WeightKey } from "./weights"
import type {
  ConfidenceLevel,
  DataKind,
  Destination,
  Driver,
  Forecast,
  Horizon,
  Lifecycle,
  Metric,
  SignalReading,
  TripPrefs,
  Verdict,
} from "./types"
import type { BundleView } from "./store"
import {
  bookingVelocity,
  conversationVelocity,
  searchVelocity,
  seasonalBaseline,
  socialVelocity,
  trafficVelocity,
} from "./velocities"
import { worthIt } from "./worth"
import { editorialLine } from "./copy"

const HYPE_WEIGHTS = { search: 0.34, booking: 0.28, intent: 0.22, social: 0.1, accel: 0.06 }

function metric<T>(value: T, type: DataKind, confidence: number, updatedAt: string, sources: string[], explanation: string): Metric<T> {
  return { value, type, confidence: round2(confidence), updatedAt, sources, explanation }
}

function reading(partial: Omit<SignalReading, "available"> & { available?: boolean }): SignalReading {
  return { available: partial.available ?? partial.velocity != null, ...partial }
}

function emptyReading(explanation: string, updatedAt: string): SignalReading {
  return {
    available: false,
    velocity: null,
    acceleration: null,
    pressure: null,
    display: "—",
    note: explanation,
    metric: metric(null, "ESTIMATED", 0.2, updatedAt, [], explanation),
  }
}

export function lifecycleFor(hype: number, crowd: number, direction: "up" | "down" | "flat"): Lifecycle {
  if (direction === "down" && hype < 70) return "COOLING"
  if (hype >= 85 && crowd >= 7.4) return "OVERHYPED"
  if (hype >= 72 && crowd >= 6.4) return "PEAK"
  if (hype >= 58 && crowd <= 5.8 && direction !== "down") return "RISING"
  if (hype >= 64 && crowd >= 5.2) return "TRENDING"
  if (hype >= 34) return "EMERGING"
  return "UNDISCOVERED"
}

export function confidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.72) return "HIGH"
  if (score >= 0.48) return "MEDIUM"
  return "LOW"
}

function calendarBoost(horizon: Horizon, seasonIntensity: number, weatherPenalty: number): number {
  let boost = 0
  if (horizon.weekend) boost += 0.42
  if (horizon.longWeekend) boost += 0.55
  if (horizon.publicHoliday) boost += 0.28
  if (horizon.festival) boost += 0.22
  if (horizon.schoolHoliday) boost += 0.18
  if (horizon.majorEvent) boost += 0.16
  boost += seasonIntensity * 0.38
  boost += weatherPenalty
  return clamp(boost, -1.8, 1.35)
}

function dataModeOf(kinds: DataKind[]): Forecast["dataMode"] {
  const live = kinds.some((kind) => kind === "LIVE" || kind === "OBSERVED")
  const demo = kinds.some((kind) => kind === "DEMO")
  if (live && demo) return "mixed"
  if (demo && !live) return "fixture"
  if (live) return "live"
  return "fixture"
}

export function forecastDestination(
  destination: Destination,
  horizon: Horizon,
  prefs: TripPrefs,
  view: BundleView,
): Forecast {
  const asOf = view.asOf
  const hotels = view.hotels.filter((row) => row.destinationId === destination.id && row.stayStart === horizon.start)
  const search = view.search.filter((row) => row.destinationId === destination.id && row.observedAt <= asOf)
  const conversations = view.conversations.filter((row) => row.destinationId === destination.id && row.observedAt <= asOf)
  const social = view.social.filter((row) => row.destinationId === destination.id && row.observedAt <= asOf)
  const traffic = view.traffic.find((row) => row.destinationId === destination.id)
  const weather = view.weather.find((row) => row.destinationId === destination.id && row.validOn === horizon.start)
    ?? view.weather.find((row) => row.destinationId === destination.id)
  const history = view.history.filter((row) => row.destinationId === destination.id)

  const booking = bookingVelocity(hotels, destination.bookingBaselineDaily)
  const searched = searchVelocity(search, destination.searchBaselineWeekly)
  const intent = conversationVelocity(conversations, destination.intentBaselineWeekly)
  const socialReading = socialVelocity(social, destination.socialBaselineWeekly)
  const tooEarly = horizon.leadDays >= 4
  const trafficReading = trafficVelocity(traffic, tooEarly)
  const month = Number(horizon.start.slice(5, 7))
  const historical = seasonalBaseline(history, month)

  const searchScore = searched.velocity == null ? null : ratioToScore(Math.max(searched.velocity, 0.2))
  const intentScoreValue = intent.velocity == null ? null : ratioToScore(Math.max(intent.velocity, 0.2))
  const socialScore = socialReading.velocity == null ? null : ratioToScore(Math.max(socialReading.velocity, 0.2))
  const trafficRatioForCrowd = tooEarly
    ? 1
    : (trafficReading.congestion ?? 1)
  const trafficScore = ratioToScore(trafficRatioForCrowd)
  const historicalScore = historical ?? 4.2
  const weatherScore = (weather?.score ?? 0.6) * 10

  const occupancy = booking.occupancy ?? 0.35
  const level = clamp(
    occupancy * 10 * 0.5 + historicalScore * 0.32 + (weather?.score ?? 0.6) * historicalScore * 0.18,
    0,
    10,
  )

  const momentumParts: Array<{ key: string; score: number; weight: number }> = []
  if (searchScore != null) momentumParts.push({ key: "search", score: searchScore, weight: 0.4 })
  if (intentScoreValue != null) momentumParts.push({ key: "intent", score: intentScoreValue, weight: 0.32 })
  if (booking.velocity != null) momentumParts.push({ key: "booking", score: ratioToScore(booking.velocity), weight: 0.2 })
  if (socialScore != null) momentumParts.push({ key: "social", score: socialScore, weight: 0.08 })
  const momentumWeight = momentumParts.reduce((sum, part) => sum + part.weight, 0) || 1
  const momentum = momentumParts.reduce((sum, part) => sum + part.score * (part.weight / momentumWeight), 0)

  const realize = realization(horizon.leadDays)
  const weatherPenalty = weather?.roadClosure ? -1.5 : (weather?.rainMm ?? 0) > 20 ? -0.45 : 0
  const crowdValue = round1(clamp(
    level * (1 - realize) + momentum * realize + calendarBoost(horizon, destination.seasonIntensity, weatherPenalty),
    0.4,
    10,
  ))

  const hypeParts: number[] = []
  const hypeWeights: number[] = []
  const pushHype = (ratio: number | null, weight: number) => {
    if (ratio == null) return
    hypeParts.push(squashRatio(ratio))
    hypeWeights.push(weight)
  }
  pushHype(searched.velocity, HYPE_WEIGHTS.search)
  pushHype(booking.velocity, HYPE_WEIGHTS.booking)
  pushHype(intent.velocity, HYPE_WEIGHTS.intent)
  pushHype(socialReading.available ? socialReading.velocity : null, HYPE_WEIGHTS.social)
  const accelRatio = searched.acceleration == null ? null : 1 + searched.acceleration * 1.4
  pushHype(accelRatio, HYPE_WEIGHTS.accel)
  const hypeWeightSum = hypeWeights.reduce((sum, weight) => sum + weight, 0) || 1
  const hypeMomentum = hypeParts.reduce((sum, part, index) => sum + part * (hypeWeights[index]! / hypeWeightSum), 0)
  const hypeValue = clamp(Math.round(((hypeMomentum - 0.38) / 0.46) * 100), 0, 100)
  const direction = (searched.acceleration ?? intent.acceleration ?? 0) > 0.06
    ? "up"
    : (searched.acceleration ?? 0) < -0.06
      ? "down"
      : "flat"

  const presentSignals: WeightKey[] = ["booking", "search", "intent", "social", "traffic", "historical", "weather"]
  const missing: WeightKey[] = []
  if (booking.velocity == null) missing.push("booking")
  if (searched.velocity == null) missing.push("search")
  if (intent.velocity == null) missing.push("intent")
  if (!socialReading.available) missing.push("social")
  if (trafficReading.congestion == null) missing.push("traffic")
  if (historical == null) missing.push("historical")
  if (!weather) missing.push("weather")
  void presentSignals

  const considered = 6 - (missing.includes("search") ? 1 : 0) - (missing.includes("social") ? 1 : 0) - (missing.includes("booking") ? 1 : 0) - (missing.includes("intent") ? 1 : 0) - (missing.includes("traffic") ? 1 : 0) - (missing.includes("weather") ? 1 : 0)
  const elevated = [
    (booking.velocity ?? 0) >= 1.25,
    (searched.velocity ?? 0) >= 1.25,
    (intent.velocity ?? 0) >= 1.25,
    socialReading.available ? (socialReading.velocity ?? 0) >= 1.25 : null,
    !tooEarly && (trafficReading.congestion ?? 1) >= 1.2,
  ].filter((value) => value != null) as boolean[]
  const agreeing = elevated.filter(Boolean).length
  const coverage = clamp(considered / 6, 0, 1)
  const agreement = elevated.length === 0 ? 0.5 : agreeing / elevated.length
  const freshness = 0.86
  const sampleFactor = historical == null ? 0.45 : clamp(history.filter((row) => row.year !== 2020 && row.year !== 2021).length / 4, 0.4, 1)
  const horizonFactor = horizon.leadDays > 21 ? 0.78 : horizon.leadDays > 10 ? 0.88 : 1
  const confidenceScore = clamp(coverage * 0.34 + agreement * 0.28 + freshness * 0.18 + sampleFactor * 0.12 + horizonFactor * 0.08, 0, 1)
  const confidenceLabel = confidenceLevel(confidenceScore)

  const probability = (() => {
    const z = (crowdValue - 7.05) * 0.92
    const raw = 1 / (1 + Math.exp(-z))
    return clamp(raw * (0.55 + confidenceScore * 0.45) + (1 - confidenceScore) * 0.08, 0.04, 0.96)
  })()

  const kinds: DataKind[] = [booking.type, searched.type, intent.type, trafficReading.type, weather?.type ?? "ESTIMATED"]
  const mode = dataModeOf(kinds)
  const updated = booking.updatedAt ?? searched.updatedAt ?? asOf

  const drivers = buildDrivers({
    bookingVelocity: booking.velocity,
    searchGrowth: searched.growth7,
    intentGrowth: intent.growth,
    tooEarly,
    trafficRatio: trafficReading.congestion,
    predictedTraffic: trafficReading.predictedTravelDayRatio,
    weekend: horizon.weekend,
    longWeekend: horizon.longWeekend,
    festival: horizon.festival,
    weatherScore: weather?.score ?? null,
    weatherSummary: weather?.summary ?? "unknown",
    roadClosure: weather?.roadClosure ?? false,
    historical,
  })

  const crowdMetric = metric(
    crowdValue,
    mode === "fixture" ? "DEMO" : "PREDICTED",
    confidenceScore,
    updated,
    ["booking pressure", "search velocity", "intent", "historical seasonality", "weather"],
    "Estimated crowd. This is a demand trajectory, not a footfall count.",
  )
  const hypeMetric = metric(
    hypeValue,
    mode === "fixture" ? "DEMO" : "PREDICTED",
    confidenceScore,
    updated,
    ["search velocity", "booking velocity", "intent velocity"],
    "Momentum against each signal's own normal. Not a popularity ranking.",
  )

  const bookingPressureIndex = booking.velocity == null || booking.occupancy == null
    ? null
    : clamp(Math.round((0.28 * booking.occupancy + 0.72 * clamp((booking.velocity - 0.45) / 1.45, 0, 1)) * 100), 0, 100)

  const worth = worthIt({
    crowd: crowdValue,
    hype: hypeValue,
    weather: weather?.score ?? 0.55,
    trafficRatio: trafficReading.predictedTravelDayRatio ?? trafficReading.congestion ?? 1,
    hotelPressure: bookingPressureIndex != null ? bookingPressureIndex / 100 : (booking.occupancy ?? 0.4),
    nightlyInr: booking.nightlyInr ?? 6000,
    driveHours: destination.driveHoursFromDelhi,
    season: destination.seasonIntensity,
    tripMatch: destination.tripTypes.includes(prefs.tripType),
    prefs,
    nights: Math.max(1, horizon.leadDays === 0 ? 1 : 2),
  })

  const verdict: Verdict = worth >= 7.6 ? "GO" : worth >= 6.2 ? "WORTH A LOOK" : worth >= 4.8 ? "MIXED" : "SKIP"
  const life = lifecycleFor(hypeValue, crowdValue, direction)
  const lines = editorialLine(destination.id, verdict, life)

  return {
    destinationId: destination.id,
    horizonId: horizon.id,
    leadDays: horizon.leadDays,
    bucket: horizon.bucket,
    crowd: crowdMetric,
    hype: hypeMetric,
    direction,
    lifecycle: life,
    worthIt: metric(round1(worth), crowdMetric.type, confidenceScore * 0.92, updated, ["crowd", "weather", "traffic", "hotels", "drive", "prefs"], "Personal worth-it for these dates, from this origin."),
    verdict,
    probabilityHighPressure: metric(
      Math.round(probability * 100) / 100,
      "PREDICTED",
      confidenceScore,
      updated,
      ["crowd forecast"],
      "Chance visitor pressure runs unusually hot versus this destination's own season.",
    ),
    confidence: {
      level: confidenceLabel,
      score: round2(confidenceScore),
      reason: `${agreeing}/${elevated.length || 0} comparable signals are elevated. ${missing.includes("social") ? "Social is missing and stays optional. " : ""}${missing.includes("search") ? "Search is missing; confidence is lower. " : ""}`.trim(),
      agreeing,
      considered: elevated.length,
    },
    drivers,
    signals: {
      booking: booking.velocity == null ? emptyReading(booking.explanation, asOf) : reading({
        velocity: booking.velocity,
        acceleration: null,
        pressure: bookingPressureIndex,
        display: `${booking.velocity.toFixed(1)}×`,
        note: booking.explanation,
        metric: metric(booking.velocity, booking.type, 0.8, booking.updatedAt ?? asOf, [booking.source], booking.explanation),
      }),
      search: searched.velocity == null ? emptyReading(searched.explanation, asOf) : reading({
        velocity: searched.velocity,
        acceleration: searched.acceleration,
        pressure: null,
        display: searched.growth7 == null ? "—" : `${searched.growth7 >= 0 ? "+" : ""}${Math.round(searched.growth7 * 100)}%`,
        note: searched.explanation,
        metric: metric(searched.velocity, searched.type, 0.74, searched.updatedAt ?? asOf, [searched.source], searched.explanation),
      }),
      intent: intent.velocity == null ? emptyReading(intent.explanation, asOf) : reading({
        velocity: intent.velocity,
        acceleration: intent.acceleration,
        pressure: null,
        display: intent.growth == null ? "—" : `${intent.growth >= 0 ? "+" : ""}${Math.round(intent.growth * 100)}%`,
        note: intent.explanation,
        metric: metric(intent.velocity, intent.type, 0.7, intent.updatedAt ?? asOf, [intent.source], intent.explanation),
      }),
      social: !socialReading.available || socialReading.velocity == null ? emptyReading(socialReading.explanation, asOf) : reading({
        velocity: socialReading.velocity,
        acceleration: null,
        pressure: null,
        display: socialReading.growth == null ? "—" : `${socialReading.growth >= 0 ? "+" : ""}${Math.round(socialReading.growth * 100)}%`,
        note: socialReading.explanation,
        metric: metric(socialReading.velocity, socialReading.type, 0.45, socialReading.updatedAt ?? asOf, [socialReading.source], socialReading.explanation),
      }),
      traffic: trafficReading.congestion == null ? emptyReading(trafficReading.explanation, asOf) : reading({
        velocity: trafficReading.velocity,
        acceleration: null,
        pressure: Math.round((trafficReading.predictedTravelDayRatio ?? 1) * 100),
        display: tooEarly ? "normal now" : `${trafficReading.congestion.toFixed(2)}×`,
        note: trafficReading.explanation,
        metric: metric(trafficReading.congestion, trafficReading.type, tooEarly ? 0.55 : 0.8, trafficReading.updatedAt ?? asOf, [trafficReading.source], trafficReading.explanation),
      }),
      weather: reading({
        available: Boolean(weather),
        velocity: null,
        acceleration: null,
        pressure: weather ? Math.round(weather.score * 100) : null,
        display: weather?.summary ?? "unknown",
        note: weather ? `Forecast for ${horizon.start}. Favourability ${Math.round(weather.score * 100)}.` : "No weather snapshot.",
        metric: metric(weather?.score ?? null, weather?.type ?? "ESTIMATED", weather ? 0.8 : 0.2, weather?.observedAt ?? asOf, weather ? [weather.source] : [], weather?.summary ?? "missing"),
      }),
      historical: reading({
        available: historical != null,
        velocity: null,
        acceleration: null,
        pressure: historical == null ? null : Math.round(historical * 10),
        display: historical == null ? "—" : `${round1(historical).toFixed(1)} / 10`,
        note: "Comparable months, with 2020 and 2021 held out as anomalous.",
        metric: metric(historical, "HISTORICAL", historical == null ? 0.3 : 0.77, asOf, ["tourism statistics"], "Seasonal baseline from non-COVID years."),
      }),
    },
    line: lines.line,
    subline: lines.subline,
    nightlyInr: booking.nightlyInr ?? 6000,
    dataMode: mode,
  }
}

function buildDrivers(input: {
  bookingVelocity: number | null
  searchGrowth: number | null
  intentGrowth: number | null
  tooEarly: boolean
  trafficRatio: number | null
  predictedTraffic: number | null
  weekend: boolean
  longWeekend: boolean
  festival: boolean
  weatherScore: number | null
  weatherSummary: string
  roadClosure: boolean
  historical: number | null
}): Driver[] {
  const drivers: Driver[] = []
  if (input.bookingVelocity != null) {
    const level = input.bookingVelocity >= 1.7 ? "VERY HIGH" : input.bookingVelocity >= 1.3 ? "HIGH" : input.bookingVelocity >= 1.05 ? "ELEVATED" : "NORMAL"
    drivers.push({
      id: "booking",
      label: "Booking velocity",
      level,
      detail: input.bookingVelocity >= 1.3 ? "Rooms are disappearing faster than a normal lead of this length." : "Accommodation availability is close to its usual pace.",
    })
  }
  if (input.searchGrowth != null) {
    drivers.push({
      id: "search",
      label: "Search velocity",
      level: input.searchGrowth >= 0.35 ? "HIGH" : input.searchGrowth >= 0.15 ? "ELEVATED" : "QUIET",
      detail: `Searches ${input.searchGrowth >= 0 ? "up" : "down"} ${Math.abs(Math.round(input.searchGrowth * 100))}% in seven days.`,
    })
  }
  if (input.intentGrowth != null) {
    drivers.push({
      id: "intent",
      label: "Intent velocity",
      level: input.intentGrowth >= 0.25 ? "HIGH" : input.intentGrowth >= 0.1 ? "ELEVATED" : "QUIET",
      detail: "Trip-planning talk is weighted far above generic mentions.",
    })
  }
  if (input.longWeekend) drivers.push({ id: "calendar", label: "Holiday pressure", level: "HIGH", detail: "A long weekend sits on these dates." })
  else if (input.festival) drivers.push({ id: "calendar", label: "Holiday pressure", level: "HIGH", detail: "A festival falls on this horizon." })
  else if (input.weekend) drivers.push({ id: "calendar", label: "Weekend", level: "ELEVATED", detail: "These dates land on a weekend." })
  if (input.weatherScore != null) {
    drivers.push({
      id: "weather",
      label: "Weather",
      level: input.roadClosure ? "ROAD CLOSED" : input.weatherScore >= 0.75 ? "FAVOURABLE" : input.weatherScore >= 0.45 ? "MIXED" : "POOR",
      detail: input.weatherSummary,
    })
  }
  if (input.tooEarly) {
    drivers.push({
      id: "traffic",
      label: "Traffic",
      level: "NORMAL — TOO EARLY",
      detail: input.predictedTraffic != null && input.predictedTraffic >= 1.4
        ? "Roads are quiet today. The travel day itself is expected to bunch up."
        : "Travellers have not left yet, so today's drive time says little.",
    })
  } else if (input.trafficRatio != null) {
    drivers.push({
      id: "traffic",
      label: "Traffic",
      level: input.trafficRatio >= 1.35 ? "HEAVY" : "NORMAL",
      detail: `Current congestion is ${input.trafficRatio.toFixed(2)}× a clear run.`,
    })
  }
  if (input.historical != null && input.historical >= 7) {
    drivers.push({
      id: "history",
      label: "Comparable weekends",
      level: "BUSY",
      detail: "The same month in ordinary years was already busy. 2020 and 2021 are excluded.",
    })
  }
  return drivers
}
