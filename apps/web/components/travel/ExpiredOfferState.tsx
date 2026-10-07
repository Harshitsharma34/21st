import type { RankedOffer } from "@/lib/travel/types"
import { AlternativeOfferCard } from "./AlternativeOfferCard"

export function ExpiredOfferState({ nextBest }: { nextBest?: RankedOffer }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-travel-danger/30 bg-travel-danger-bg px-4 py-3 text-sm text-travel-danger">
        Offer no longer available. Here&apos;s the next best option for you.
      </div>
      {nextBest ? (
        <AlternativeOfferCard
          offer={nextBest}
          label={
            nextBest.discountType === "cashback" ? "cashback" : "higher-spend"
          }
          href={`/travel/offer/${nextBest.id}`}
        />
      ) : null}
    </div>
  )
}
