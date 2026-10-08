import { loadFixtureBundle } from "./fixtures"
import { appendBundle, type BundleView } from "./store"
import { observationView } from "./engine"

export interface JobResult {
  name: string
  inserted: number
  skipped: number
  ok: boolean
}

function run(name: string, view: BundleView, slice: Parameters<typeof appendBundle>[1]): JobResult {
  const { inserted, skipped } = appendBundle(view, slice)
  return { name, inserted, skipped, ok: true }
}

const empty = {
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

/** Idempotent collectors. A second run skips every snapshot it already stored. */
export function runCollectors(view: BundleView = observationView()): JobResult[] {
  const bundle = loadFixtureBundle()
  return [
    run("collect-hotels", view, { ...empty, hotels: bundle.hotels }),
    run("collect-search", view, { ...empty, search: bundle.search }),
    run("collect-conversations", view, { ...empty, conversations: bundle.conversations }),
    run("collect-social", view, { ...empty, social: bundle.social }),
    run("collect-traffic", view, { ...empty, traffic: bundle.traffic }),
    run("collect-weather", view, { ...empty, weather: bundle.weather }),
  ]
}

export function runQualityChecks(view: BundleView = observationView()): JobResult[] {
  const issues: string[] = []
  for (const destination of view.destinations) {
    const hotels = view.hotels.filter((row) => row.destinationId === destination.id)
    if (hotels.length === 0) issues.push(`${destination.id}: no hotel snapshots`)
    const covid = view.history.filter((row) => row.destinationId === destination.id && (row.year === 2020 || row.year === 2021) && !row.anomalous)
    if (covid.length > 0) issues.push(`${destination.id}: COVID years missing anomalous tag`)
  }
  return [{
    name: "run-data-quality-checks",
    inserted: 0,
    skipped: issues.length,
    ok: issues.length === 0,
  }]
}
