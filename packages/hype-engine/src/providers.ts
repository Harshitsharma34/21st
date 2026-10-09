import type { ProviderMode, ProviderStatus } from "./types"
import { FIXTURE_PROVIDERS } from "./fixtures"

export interface ProviderSlot {
  id: string
  /** Live adapters plug in here. Fixture mode never calls a network. */
  mode: ProviderMode
}

const NAMES = ["hotels", "search", "conversation", "social", "traffic", "weather", "places"] as const

export function providerMode(id: string, env: NodeJS.ProcessEnv = process.env): ProviderMode {
  const specific = env[`${id.toUpperCase()}_DATA_MODE`] ?? env[`${id.toUpperCase()}_MODE`]
  const globalMode = env.DATA_MODE ?? "fixture"
  const requested = (specific ?? globalMode).toLowerCase()
  if (requested === "live") {
    const keyName = `${id.toUpperCase()}_API_KEY`
    if (!env[keyName]) return "unavailable"
    return "live"
  }
  if (requested === "unavailable") return "unavailable"
  return "fixture"
}

export function describeProviders(env: NodeJS.ProcessEnv = process.env): ProviderStatus[] {
  return NAMES.map((id) => {
    const mode = providerMode(id, env)
    const fixture = FIXTURE_PROVIDERS.find((item) => item.id === id)
    if (mode === "unavailable") {
      return {
        id,
        mode,
        source: "not connected",
        note: "No credential is configured. This signal is left out rather than invented as live.",
      }
    }
    if (mode === "live") {
      return {
        id,
        mode,
        source: "configured live adapter",
        note: "Live adapters are server-side only. This build still has no vendor call wired.",
      }
    }
    return {
      id,
      mode: "fixture",
      source: fixture?.source ?? "fixture",
      note: fixture?.note ?? "Demo ledger.",
    }
  })
}

export interface HotelProvider {
  id: "hotels"
  mode: ProviderMode
}

export interface SearchProvider { id: "search"; mode: ProviderMode }
export interface ConversationProvider { id: "conversation"; mode: ProviderMode }
export interface SocialProvider { id: "social"; mode: ProviderMode }
export interface TrafficProvider { id: "traffic"; mode: ProviderMode }
export interface WeatherProvider { id: "weather"; mode: ProviderMode }
export interface PlacesProvider { id: "places"; mode: ProviderMode }

export type AnyProvider =
  | HotelProvider
  | SearchProvider
  | ConversationProvider
  | SocialProvider
  | TrafficProvider
  | WeatherProvider
  | PlacesProvider
