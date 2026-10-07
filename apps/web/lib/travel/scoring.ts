import { getCardById, MOCK_OFFERS } from "./mock-data"
import type { OfferCategory, RankedOffer, TravelOffer } from "./types"

function daysUntil(dateStr: string): number {
  const end = new Date(dateStr)
  const now = new Date()
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function scoreOffer(offer: TravelOffer): number {
  if (!offer.eligible || offer.expired) return -1

  let score = 0
  score += offer.confidence === "high" ? 30 : offer.confidence === "medium" ? 18 : 8
  score += Math.min(offer.maximumDiscount / 50, 40)
  score += offer.discountType === "instant" ? 25 : offer.discountType === "flat" ? 20 : 10
  score += Math.max(0, 22 - offer.minimumSpend / 1000)
  if (offer.minimumSpend <= 5000) score += 4
  const days = daysUntil(offer.validUntil)
  if (days <= 7) score += 8
  else if (days <= 14) score += 4
  score -= offer.restrictions.length * 2
  return score
}

export function enrichOffer(offer: TravelOffer): RankedOffer {
  const card = getCardById(offer.cardId)
  return {
    ...offer,
    score: scoreOffer(offer),
    cardName: card ? `${card.bank} ${card.name}` : offer.cardId,
    bank: card?.bank ?? "",
  }
}

export function getEligibleOffers(cardIds: string[]): RankedOffer[] {
  return MOCK_OFFERS.filter(
    (o) => cardIds.includes(o.cardId) && o.eligible && !o.expired,
  )
    .map(enrichOffer)
    .sort((a, b) => b.score - a.score)
}

export function getRecommendations(
  cardIds: string[],
  category: OfferCategory | "all" = "flights",
) {
  const all = getEligibleOffers(cardIds)
  const filtered =
    category === "all" ? all : all.filter((o) => o.category === category)

  const bestOverall = filtered[0]
  const instant = filtered.filter((o) => o.discountType === "instant")
  const cashback = filtered.filter((o) => o.discountType === "cashback")
  const higherSpend = [...instant].sort(
    (a, b) => b.maximumDiscount - a.maximumDiscount || b.minimumSpend - a.minimumSpend,
  )

  const bestHigherSpend =
    higherSpend.find((o) => o.id !== bestOverall?.id) ?? higherSpend[1]
  const bestCashback =
    cashback.find((o) => o.id !== bestOverall?.id) ?? cashback[0]

  return {
    all: filtered,
    bestOverall,
    bestHigherSpend,
    bestCashback,
    combinationCount: cardIds.length * 4,
  }
}

export function formatOfferValue(offer: TravelOffer): string {
  if (offer.discountType === "flat" && offer.flatDiscount) {
    return `₹${offer.flatDiscount.toLocaleString("en-IN")} instant discount`
  }
  if (offer.discountPercentage) {
    const kind = offer.discountType === "cashback" ? "cashback" : "instant discount"
    return `${offer.discountPercentage}% ${kind}`
  }
  return "Travel benefit"
}
