import { DEMO_SELECTED_CARD_IDS } from "./mock-data"

const SELECTED_CARDS_KEY = "travel_selected_cards"
const TRIP_DISMISSED_KEY = "travel_trip_opportunity_dismissed"

export function loadSelectedCards(): string[] {
  if (typeof window === "undefined") return DEMO_SELECTED_CARD_IDS
  try {
    const raw = localStorage.getItem(SELECTED_CARDS_KEY)
    if (!raw) return DEMO_SELECTED_CARD_IDS
    const parsed = JSON.parse(raw) as string[]
    return parsed.length ? parsed : DEMO_SELECTED_CARD_IDS
  } catch {
    return DEMO_SELECTED_CARD_IDS
  }
}

export function saveSelectedCards(ids: string[]) {
  localStorage.setItem(SELECTED_CARDS_KEY, JSON.stringify(ids))
}

export function isTripOpportunityDismissed(): boolean {
  return localStorage.getItem(TRIP_DISMISSED_KEY) === "1"
}

export function dismissTripOpportunity() {
  localStorage.setItem(TRIP_DISMISSED_KEY, "1")
}

export function clearTripDismissal() {
  localStorage.removeItem(TRIP_DISMISSED_KEY)
}
