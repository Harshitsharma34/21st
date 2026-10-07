"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { OfferCard } from "@/components/travel/OfferCard"
import { loadSelectedCards } from "@/lib/travel/storage"
import { getEligibleOffers, enrichOffer } from "@/lib/travel/scoring"
import { MOCK_OFFERS } from "@/lib/travel/mock-data"
import type { OfferCategory } from "@/lib/travel/types"
import { trackEvent } from "@/lib/travel/analytics"
import { cn } from "@/lib/utils"

type SortKey = "recommended" | "saving" | "ending"

function AllOffersContent() {
  const [cardIds, setCardIds] = useState<string[]>([])
  const [category, setCategory] = useState<OfferCategory>("flights")
  const [sort, setSort] = useState<SortKey>("recommended")
  const searchParams = useSearchParams()
  const general = searchParams.get("general")

  useEffect(() => {
    setCardIds(loadSelectedCards())
    trackEvent("all_offers_viewed")
  }, [])

  const offers = useMemo(() => {
    let list = general
      ? MOCK_OFFERS.filter((o) => !o.expired).map(enrichOffer)
      : getEligibleOffers(cardIds)
    list = list.filter((o) => o.category === category)
    if (sort === "saving") {
      list = [...list].sort((a, b) => b.maximumDiscount - a.maximumDiscount)
    } else if (sort === "ending") {
      list = [...list].sort(
        (a, b) => new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime(),
      )
    }
    return list
  }, [cardIds, category, sort, general])

  return (
    <main className="pb-28 pt-8">
      <Link href="/travel/results" className="text-sm text-travel-primary">
        ← Back to recommendations
      </Link>
      <h1 className="mt-4 text-[28px] font-semibold text-travel-ink">
        All eligible offers
      </h1>
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex gap-2">
          {(["flights", "hotels"] as OfferCategory[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium capitalize",
                category === c
                  ? "bg-travel-ink text-white"
                  : "bg-travel-subtle text-travel-secondary",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-10 rounded-lg border border-travel-border bg-travel-surface px-3 text-sm"
        >
          <option value="recommended">Sort: Recommended</option>
          <option value="saving">Highest saving</option>
          <option value="ending">Ending soon</option>
        </select>
      </div>
      <ul className="mt-8 space-y-3">
        {offers.map((offer) => (
          <li key={offer.id}>
            <OfferCard
              offer={offer}
              href={`/travel/offer/${offer.id}`}
              onClick={() =>
                trackEvent("offer_selected", { offerId: offer.id })
              }
            />
          </li>
        ))}
      </ul>
    </main>
  )
}

export default function AllOffersPage() {
  return (
    <Suspense>
      <AllOffersContent />
    </Suspense>
  )
}
