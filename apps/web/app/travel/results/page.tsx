"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BestOfferCard } from "@/components/travel/BestOfferCard"
import { AlternativeOfferCard } from "@/components/travel/AlternativeOfferCard"
import { RecommendationExplanation } from "@/components/travel/RecommendationExplanation"
import { TripOpportunityCard } from "@/components/travel/TripOpportunityCard"
import { EmptyState } from "@/components/travel/EmptyState"
import { loadSelectedCards, isTripOpportunityDismissed } from "@/lib/travel/storage"
import { getRecommendations } from "@/lib/travel/scoring"
import { detectTripOpportunity } from "@/lib/travel/trip-opportunity"
import { trackEvent } from "@/lib/travel/analytics"
import type { OfferCategory } from "@/lib/travel/types"
import { cn } from "@/lib/utils"

export default function ResultsPage() {
  const [category, setCategory] = useState<OfferCategory | "all">("flights")
  const [whyOpen, setWhyOpen] = useState(false)
  const [cardIds, setCardIds] = useState<string[]>([])
  const [tripHidden, setTripHidden] = useState(true)

  useEffect(() => {
    const ids = loadSelectedCards()
    setCardIds(ids)
    setTripHidden(isTripOpportunityDismissed())
    trackEvent("recommendation_viewed", { cardCount: ids.length })
  }, [])

  const effectiveCategory = category === "all" ? "flights" : category

  const recs = useMemo(
    () => getRecommendations(cardIds, effectiveCategory),
    [cardIds, effectiveCategory],
  )

  const trip = useMemo(
    () => (category === "flights" ? detectTripOpportunity(cardIds) : null),
    [cardIds, category],
  )

  const totalOffers = getRecommendations(cardIds, "all").all.length

  if (!recs.bestOverall) {
    return (
      <main className="py-10">
        <EmptyState />
      </main>
    )
  }

  const chips: { id: OfferCategory | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "flights", label: "Flights" },
    { id: "hotels", label: "Hotels" },
  ]

  return (
    <main className="pb-28 pt-8 md:pb-16">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight text-travel-ink">
          Your travel offers
        </h1>
        <p className="mt-1 text-travel-secondary">
          {totalOffers} eligible offers found across your {cardIds.length} cards.
        </p>
        <div className="mt-4 flex gap-2">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setCategory(chip.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                category === chip.id
                  ? "bg-travel-ink text-white"
                  : "bg-travel-subtle text-travel-secondary",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-8 lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <BestOfferCard
            offer={recs.bestOverall}
            onWhyClick={() => {
              setWhyOpen(true)
              trackEvent("why_recommended_opened")
            }}
          />
        </div>
        <div className="mt-6 space-y-4 lg:mt-0">
          {recs.bestHigherSpend ? (
            <AlternativeOfferCard
              offer={recs.bestHigherSpend}
              label="higher-spend"
              href={`/travel/offer/${recs.bestHigherSpend.id}`}
            />
          ) : null}
          {recs.bestCashback ? (
            <AlternativeOfferCard
              offer={recs.bestCashback}
              label="cashback"
              href={`/travel/offer/${recs.bestCashback.id}`}
            />
          ) : null}
        </div>
      </div>

      {trip && !tripHidden && category !== "hotels" ? (
        <div className="mt-8 max-w-lg lg:max-w-none">
          <TripOpportunityCard trip={trip} onDismiss={() => setTripHidden(true)} />
        </div>
      ) : null}

      <Link
        href="/travel/all-offers"
        onClick={() => trackEvent("all_offers_viewed")}
        className="mt-8 inline-block text-sm font-medium text-travel-primary"
      >
        See all {totalOffers} eligible offers →
      </Link>

      <RecommendationExplanation
        open={whyOpen}
        onOpenChange={setWhyOpen}
        best={recs.bestOverall}
        nextBest={recs.bestHigherSpend}
        cardCount={cardIds.length}
      />
    </main>
  )
}
