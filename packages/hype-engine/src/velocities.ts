import { daysBetween, growth, mean, round2 } from "./math"
import { intentScore } from "./intent"
import type {
  ConversationSnapshot,
  DataKind,
  HistoricalSample,
  HotelSnapshot,
  SearchSnapshot,
  SocialSnapshot,
  TrafficSnapshot,
} from "./types"

export interface BookingVelocity {
  velocity: number | null
  contraction: number | null
  occupancy: number | null
  available: number | null
  typicalAvailable: number | null
  nightlyInr: number | null
  updatedAt: string | null
  type: DataKind
  source: string
  explanation: string
}

/**
 * Availability contraction against the same destination's normal daily rate
 * for this lead time. This is booking pressure, not confirmed bookings.
 */
export function bookingVelocity(
  snapshots: HotelSnapshot[],
  baselineDaily: number,
): BookingVelocity {
  const ordered = [...snapshots].sort((a, b) => a.observedAt.localeCompare(b.observedAt))
  const latest = ordered[ordered.length - 1]
  if (!latest) {
    return {
      velocity: null,
      contraction: null,
      occupancy: null,
      available: null,
      typicalAvailable: null,
      nightlyInr: null,
      updatedAt: null,
      type: "ESTIMATED",
      source: "none",
      explanation: "No accommodation snapshots for this stay.",
    }
  }
  const earliest = ordered[0]!
  const span = Math.max(1, daysBetween(earliest.observedAt, latest.observedAt))
  const contraction = earliest.availableProperties > 0
    ? (earliest.availableProperties - latest.availableProperties) / earliest.availableProperties
    : null
  const daily = contraction == null ? null : contraction / span
  const velocity = daily == null || baselineDaily <= 0 ? null : daily / baselineDaily
  const occupancy = latest.typicalAvailable > 0
    ? 1 - latest.availableProperties / latest.typicalAvailable
    : null
  return {
    velocity: velocity == null ? null : round2(velocity),
    contraction: contraction == null ? null : round2(contraction),
    occupancy: occupancy == null ? null : round2(occupancy),
    available: latest.availableProperties,
    typicalAvailable: latest.typicalAvailable,
    nightlyInr: latest.medianNightlyInr,
    updatedAt: latest.observedAt,
    type: latest.type,
    source: latest.source,
    explanation: velocity == null
      ? "Availability was observed, but there is no baseline to compare it with."
      : `Availability is contracting ${round2(velocity).toFixed(1)}× a normal lead of this length. Hotels can pull inventory for many reasons, so this is pressure, not confirmed bookings.`,
  }
}

export interface SearchVelocity {
  velocity: number | null
  growth7: number | null
  growth14: number | null
  growth30: number | null
  acceleration: number | null
  index: number | null
  updatedAt: string | null
  type: DataKind
  source: string
  terms: string[]
  explanation: string
}

export function searchVelocity(snapshots: SearchSnapshot[], baselineWeekly: number): SearchVelocity {
  const ordered = [...snapshots].sort((a, b) => a.observedAt.localeCompare(b.observedAt))
  const latest = ordered[ordered.length - 1]
  if (!latest) {
    return {
      velocity: null,
      growth7: null,
      growth14: null,
      growth30: null,
      acceleration: null,
      index: null,
      updatedAt: null,
      type: "ESTIMATED",
      source: "none",
      terms: [],
      explanation: "Search interest is missing. The forecast continues without it.",
    }
  }
  const before = (days: number) => {
    const target = Date.parse(latest.observedAt) - days * 86_400_000
    let best: SearchSnapshot | null = null
    let bestGap = Infinity
    for (const snap of ordered) {
      if (snap === latest) continue
      const gap = Math.abs(Date.parse(snap.observedAt) - target)
      if (gap < bestGap) {
        best = snap
        bestGap = gap
      }
    }
    return bestGap < 5 * 86_400_000 ? best : null
  }
  const d7 = before(7)
  const d14 = before(14)
  const d30 = before(30)
  const growth7 = d7 ? growth(latest.index, d7.index) : null
  const growth14 = d14 ? growth(latest.index, d14.index) : null
  const growth30 = d30 ? growth(latest.index, d30.index) : null
  const prior = d7 && d14 ? growth(d7.index, d14.index) : null
  const acceleration = growth7 != null && prior != null ? growth7 - prior : null
  const velocity = growth7 == null || baselineWeekly <= 0 ? null : growth7 / baselineWeekly
  return {
    velocity: velocity == null ? null : round2(velocity),
    growth7: growth7 == null ? null : round2(growth7),
    growth14: growth14 == null ? null : round2(growth14),
    growth30: growth30 == null ? null : round2(growth30),
    acceleration: acceleration == null ? null : round2(acceleration),
    index: latest.index,
    updatedAt: latest.observedAt,
    type: latest.type,
    source: latest.source,
    terms: latest.terms,
    explanation: growth7 == null
      ? "Only one search observation is stored, so velocity cannot be computed yet."
      : `Search interest moved ${(growth7 * 100).toFixed(0)}% over 7 days, against a seasonal baseline of ${(baselineWeekly * 100).toFixed(0)}%.`,
  }
}

export interface IntentVelocity {
  velocity: number | null
  growth: number | null
  acceleration: number | null
  score: number | null
  updatedAt: string | null
  type: DataKind
  source: string
  samples: string[]
  explanation: string
}

export function conversationVelocity(
  snapshots: ConversationSnapshot[],
  baselineWeekly: number,
): IntentVelocity {
  const ordered = [...snapshots].sort((a, b) => a.observedAt.localeCompare(b.observedAt))
  const latest = ordered[ordered.length - 1]
  if (!latest) {
    return {
      velocity: null,
      growth: null,
      acceleration: null,
      score: null,
      updatedAt: null,
      type: "ESTIMATED",
      source: "none",
      samples: [],
      explanation: "No travel-intent conversations are stored.",
    }
  }
  const previous = ordered[ordered.length - 2]
  const score = intentScore(latest.counts)
  const previousScore = previous ? intentScore(previous.counts) : null
  const delta = previousScore != null && previousScore > 0 ? score / previousScore - 1 : null
  const ratio = delta == null || baselineWeekly <= 0 ? null : delta / baselineWeekly
  const older = ordered[ordered.length - 3]
  const olderScore = older ? intentScore(older.counts) : null
  const priorGrowth = previousScore != null && olderScore != null && olderScore > 0 ? previousScore / olderScore - 1 : null
  const acceleration = delta != null && priorGrowth != null ? delta - priorGrowth : null
  return {
    velocity: ratio == null ? null : round2(ratio),
    growth: delta == null ? null : round2(delta),
    acceleration: acceleration == null ? null : round2(acceleration),
    score: round2(score),
    updatedAt: latest.observedAt,
    type: latest.type,
    source: latest.source,
    samples: latest.samples,
    explanation: delta == null
      ? "Intent was classified, but a second window is needed for velocity."
      : `Planning-weighted conversation moved ${(delta * 100).toFixed(0)}% versus the prior window. Planning and booking outweigh likes and generic mentions.`,
  }
}

export interface SocialVelocity {
  available: boolean
  velocity: number | null
  growth: number | null
  updatedAt: string | null
  type: DataKind
  source: string
  explanation: string
}

export function socialVelocity(snapshots: SocialSnapshot[], baselineWeekly: number | null): SocialVelocity {
  if (baselineWeekly == null) {
    return {
      available: false,
      velocity: null,
      growth: null,
      updatedAt: null,
      type: "ESTIMATED",
      source: "unavailable",
      explanation: "Social coverage is unavailable. It is optional and does not block the forecast.",
    }
  }
  const ordered = [...snapshots].sort((a, b) => a.observedAt.localeCompare(b.observedAt))
  const latest = ordered[ordered.length - 1]
  const previous = ordered[ordered.length - 2]
  if (!latest || !previous || previous.mentions <= 0) {
    return {
      available: false,
      velocity: null,
      growth: null,
      updatedAt: latest?.observedAt ?? null,
      type: latest?.type ?? "ESTIMATED",
      source: latest?.source ?? "unavailable",
      explanation: "Not enough social snapshots to measure mention growth.",
    }
  }
  const mentionGrowth = latest.mentions / previous.mentions - 1
  const engagementGrowth = previous.engagement > 0 ? latest.engagement / previous.engagement - 1 : mentionGrowth
  const creatorGrowth = previous.creators > 0 ? latest.creators / previous.creators - 1 : mentionGrowth
  const blended = 0.4 * mentionGrowth + 0.35 * engagementGrowth + 0.25 * creatorGrowth
  return {
    available: true,
    velocity: round2(blended / baselineWeekly),
    growth: round2(blended),
    updatedAt: latest.observedAt,
    type: latest.type,
    source: latest.source,
    explanation: `Mentions, engagement, and creator coverage together moved ${(blended * 100).toFixed(0)}%. Social never dominates the model.`,
  }
}

export interface TrafficVelocity {
  velocity: number | null
  congestion: number | null
  predictedTravelDayRatio: number | null
  incidents: number
  updatedAt: string | null
  type: DataKind
  source: string
  segments: TrafficSnapshot["segments"]
  explanation: string
}

export function trafficVelocity(snapshot: TrafficSnapshot | undefined, tooEarly: boolean): TrafficVelocity {
  if (!snapshot) {
    return {
      velocity: null,
      congestion: null,
      predictedTravelDayRatio: null,
      incidents: 0,
      updatedAt: null,
      type: "ESTIMATED",
      source: "none",
      segments: [],
      explanation: "No traffic snapshot.",
    }
  }
  const congestion = snapshot.normalMinutes > 0 ? snapshot.trafficMinutes / snapshot.normalMinutes : null
  const velocity = congestion == null ? null : round2(congestion)
  return {
    velocity,
    congestion: congestion == null ? null : round2(congestion),
    predictedTravelDayRatio: snapshot.predictedTravelDayRatio,
    incidents: snapshot.incidents,
    updatedAt: snapshot.observedAt,
    type: snapshot.type,
    source: snapshot.source,
    segments: snapshot.segments,
    explanation: tooEarly
      ? "Roads are ordinary right now because most travellers have not left. That is not evidence of a quiet weekend."
      : congestion != null && congestion >= 1.35
        ? "Traffic is already running hot on the way in."
        : "Traffic is close to its usual duration.",
  }
}

/** 2020 and 2021 are COVID years. They are never a normal seasonal baseline. */
export function isAnomalousYear(year: number, flagged?: boolean): boolean {
  return flagged === true || year === 2020 || year === 2021
}

export function seasonalBaseline(samples: HistoricalSample[], month: number): number | null {
  const usable = samples.filter((sample) => sample.month === month && !isAnomalousYear(sample.year, sample.anomalous))
  return mean(usable.map((sample) => sample.crowdIndex))
}
