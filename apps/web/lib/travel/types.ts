export type DiscountType = "instant" | "cashback" | "flat"

export type OfferCategory = "flights" | "hotels"

export type OTAPlatform = "MakeMyTrip" | "Cleartrip" | "EaseMyTrip" | "Yatra"

export interface CreditCardProduct {
  id: string
  bank: string
  name: string
}

export interface TravelOffer {
  id: string
  platform: OTAPlatform
  cardId: string
  category: OfferCategory
  discountType: DiscountType
  discountPercentage?: number
  flatDiscount?: number
  maximumDiscount: number
  minimumSpend: number
  validUntil: string
  eligible: boolean
  confidence: "high" | "medium" | "low"
  restrictions: string[]
  scope: "domestic" | "international" | "both"
  expired?: boolean
}

export interface RankedOffer extends TravelOffer {
  score: number
  cardName: string
  bank: string
}

export interface TripOpportunity {
  destination: string
  origin: string
  nights: number
  vibe: string
  flightOffer: RankedOffer
  hotelOffer: RankedOffer
  reasons: string[]
  signals: string[]
}

export type TripVibe =
  | "relaxed"
  | "adventure"
  | "food"
  | "romantic"
  | "everything"

export type TripPriority = "budget" | "stays" | "experiences" | "balanced"
