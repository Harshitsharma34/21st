"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { OfferDetailPage } from "@/components/travel/OfferDetailSheet"
import { ExpiredOfferState } from "@/components/travel/ExpiredOfferState"
import { MOCK_OFFERS } from "@/lib/travel/mock-data"
import { enrichOffer, getEligibleOffers } from "@/lib/travel/scoring"
import { loadSelectedCards } from "@/lib/travel/storage"
import { trackEvent } from "@/lib/travel/analytics"

export default function OfferDetailRoute() {
  const params = useParams()
  const id = params.id as string

  const { offer, nextBest } = useMemo(() => {
    const raw = MOCK_OFFERS.find((o) => o.id === id)
    const enriched = raw ? enrichOffer(raw) : undefined
    const ids = loadSelectedCards()
    const eligible = getEligibleOffers(ids)
    const next = eligible.find((o) => o.id !== id)
    if (enriched) trackEvent("offer_selected", { offerId: id })
    return { offer: enriched, nextBest: next }
  }, [id])

  if (!offer) {
    return (
      <main className="py-10">
        <p className="text-travel-secondary">Offer not found.</p>
        <Link href="/travel/results" className="mt-4 text-travel-primary">
          Back to results
        </Link>
      </main>
    )
  }

  if (offer.expired) {
    return (
      <main className="py-10">
        <ExpiredOfferState nextBest={nextBest} />
      </main>
    )
  }

  if (!loadSelectedCards().includes(offer.cardId)) {
    return (
      <main className="py-10">
        <div className="rounded-xl border border-travel-warning/40 bg-travel-warning-bg p-4 text-sm">
          {offer.cardName} isn&apos;t in your selected cards. We&apos;d recommend an
          eligible alternative instead.
        </div>
        {nextBest ? (
          <Link
            href={`/travel/offer/${nextBest.id}`}
            className="mt-4 inline-block text-travel-primary"
          >
            View {nextBest.cardName} offer →
          </Link>
        ) : null}
      </main>
    )
  }

  return (
    <main className="py-8">
      <Link href="/travel/results" className="text-sm text-travel-primary">
        ← Back
      </Link>
      <div className="mt-6">
        <OfferDetailPage offer={offer} />
      </div>
    </main>
  )
}
