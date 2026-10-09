import type { LeadBucket } from "./types"

export type WeightKey =
  | "booking"
  | "search"
  | "intent"
  | "social"
  | "traffic"
  | "historical"
  | "weather"

export const LEAD_WEIGHTS: Record<LeadBucket, Record<WeightKey, number>> = {
  T30_T14: { booking: 0.18, search: 0.28, intent: 0.16, social: 0.14, traffic: 0.02, historical: 0.14, weather: 0.08 },
  T14_T7: { booking: 0.24, search: 0.22, intent: 0.2, social: 0.08, traffic: 0.04, historical: 0.12, weather: 0.1 },
  T7_T4: { booking: 0.3, search: 0.22, intent: 0.22, social: 0.06, traffic: 0.04, historical: 0.08, weather: 0.08 },
  T3_T1: { booking: 0.28, search: 0.14, intent: 0.18, social: 0.04, traffic: 0.18, historical: 0.08, weather: 0.1 },
  TRAVEL_DAY: { booking: 0.18, search: 0.08, intent: 0.12, social: 0.02, traffic: 0.32, historical: 0.1, weather: 0.18 },
}

export function renormalize(weights: Record<WeightKey, number>, missing: WeightKey[]): Record<WeightKey, number> {
  const next = { ...weights }
  let dropped = 0
  for (const key of missing) {
    dropped += next[key]
    next[key] = 0
  }
  const kept = (Object.keys(next) as WeightKey[]).filter((key) => next[key] > 0)
  const keptSum = kept.reduce((sum, key) => sum + next[key], 0)
  if (keptSum <= 0) return next
  for (const key of kept) next[key] = next[key] / keptSum
  // `dropped` is redistributed by the division above.
  void dropped
  return next
}
