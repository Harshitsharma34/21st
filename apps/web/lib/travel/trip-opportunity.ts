import { getEligibleOffers } from "./scoring"
import type { TripOpportunity } from "./types"

/** Demo: upcoming long weekend window for prototype storytelling */
export const LONG_WEEKEND_ACTIVE = true

export function detectTripOpportunity(cardIds: string[]): TripOpportunity | null {
  if (cardIds.length < 2) return null

  const offers = getEligibleOffers(cardIds)
  const intlFlight = offers.find(
    (o) => o.category === "flights" && o.scope === "international" && o.score >= 50,
  )
  const domesticFlight = offers.find(
    (o) => o.category === "flights" && o.discountType === "instant",
  )
  const flight = intlFlight ?? domesticFlight
  const hotel = offers.find(
    (o) => o.category === "hotels" && o.cardId !== flight?.cardId,
  )

  if (!flight || !hotel) return null

  const signals: string[] = []
  if (
    flight.maximumDiscount >= 1200 ||
    (flight.discountPercentage ?? 0) >= 10
  ) {
    signals.push("strong_flight_discount")
  }
  if (
    hotel.maximumDiscount >= 2000 ||
    (hotel.discountPercentage ?? 0) >= 12
  ) {
    signals.push("strong_hotel_discount")
  }
  const expiringSoon =
    new Date(flight.validUntil).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000
  if (expiringSoon) signals.push("expiring_soon")
  if (flight && hotel) signals.push("flight_hotel_combo")
  if (intlFlight) signals.push("international")
  if (LONG_WEEKEND_ACTIVE) signals.push("long_weekend")

  const credible =
    signals.includes("flight_hotel_combo") &&
    (signals.includes("strong_flight_discount") ||
      signals.includes("strong_hotel_discount") ||
      signals.includes("international") ||
      (signals.includes("long_weekend") && signals.length >= 3))

  if (!credible) return null

  const international = signals.includes("international")
  const destination = international ? "BALI" : "GOA"
  const origin = "DELHI"

  const reasons = [
    "Flight offer available on one of your cards",
    "Hotel benefit available",
    "Works well as a couples getaway",
    "Suggested trip length: 5 nights",
  ]

  return {
    destination,
    origin,
    nights: 5,
    vibe: "Relaxed + food + light adventure",
    flightOffer: flight,
    hotelOffer: hotel,
    reasons,
    signals,
  }
}
