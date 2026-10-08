export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/** Logistic squash of a ratio whose neutral point is 1. */
export function squashRatio(ratio: number): number {
  const capped = clamp(ratio, 0.25, 2.6)
  return 1 / (1 + Math.exp(-1.35 * (capped - 1)))
}

/** Map a vs-normal ratio onto a 0–10 pressure score. 1× sits at 5. */
export function ratioToScore(ratio: number): number {
  const x = Math.log(Math.max(ratio, 0.2))
  return clamp(5 + x * 4.2, 0.4, 10)
}

export function growth(current: number, previous: number): number | null {
  if (previous <= 0 || !Number.isFinite(previous) || !Number.isFinite(current)) return null
  return current / previous - 1
}

export function mean(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function daysBetween(earlierIso: string, laterIso: string): number {
  const earlier = Date.parse(earlierIso)
  const later = Date.parse(laterIso)
  return Math.max(0, Math.round((later - earlier) / 86_400_000))
}

/**
 * How much of today's momentum has become physical demand by this lead time.
 * At T-0 travellers have not arrived yet, so momentum barely moves the crowd.
 * By two weeks, search and intent have had time to turn into visitors.
 */
export function realization(leadDays: number): number {
  if (leadDays <= 0) return 0.18
  return clamp(0.16 + leadDays * 0.028, 0.18, 0.7)
}
