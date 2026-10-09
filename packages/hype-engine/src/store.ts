import type { ObservationBundle } from "./types"

export interface BundleView extends ObservationBundle {
  asOf: string
}

const keys = new WeakMap<BundleView, Set<string>>()

function key(parts: Array<string | number | undefined>): string {
  return parts.join("|")
}

export function createBundle(bundle: ObservationBundle, asOf: string): BundleView {
  const view: BundleView = {
    asOf,
    destinations: [],
    hotels: [],
    search: [],
    conversations: [],
    social: [],
    traffic: [],
    weather: [],
    history: [],
    spots: [],
  }
  keys.set(view, new Set())
  appendBundle(view, bundle)
  return view
}

/** Append observations. A repeated snapshot key is ignored, never overwritten. */
export function appendBundle(view: BundleView, bundle: ObservationBundle): { inserted: number; skipped: number } {
  let inserted = 0
  let skipped = 0
  const seen = keys.get(view) ?? new Set<string>()
  keys.set(view, seen)
  const take = <T>(bucket: T[], row: T, id: string) => {
    if (seen.has(id)) {
      skipped += 1
      return
    }
    seen.add(id)
    bucket.push(row)
    inserted += 1
  }
  for (const row of bundle.destinations) {
    if (!view.destinations.some((item) => item.id === row.id)) view.destinations.push(row)
  }
  for (const row of bundle.hotels) {
    take(view.hotels, row, key(["hotel", row.destinationId, row.observedAt, row.stayStart]))
  }
  for (const row of bundle.search) {
    take(view.search, row, key(["search", row.destinationId, row.observedAt]))
  }
  for (const row of bundle.conversations) {
    take(view.conversations, row, key(["conversation", row.destinationId, row.observedAt]))
  }
  for (const row of bundle.social) {
    take(view.social, row, key(["social", row.destinationId, row.observedAt]))
  }
  for (const row of bundle.traffic) {
    take(view.traffic, row, key(["traffic", row.destinationId, row.observedAt]))
  }
  for (const row of bundle.weather) {
    take(view.weather, row, key(["weather", row.destinationId, row.observedAt, row.validOn]))
  }
  for (const row of bundle.history) {
    take(view.history, row, key(["history", row.destinationId, row.year, row.month]))
  }
  for (const row of bundle.spots) {
    if (!view.spots.some((item) => item.id === row.id)) view.spots.push(row)
  }
  return { inserted, skipped }
}
