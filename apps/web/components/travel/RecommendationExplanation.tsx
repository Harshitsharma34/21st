"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { RankedOffer } from "@/lib/travel/types"
import { formatOfferValue } from "@/lib/travel/scoring"
import { EligibilityRow } from "./EligibilityRow"
import { OfferBadge } from "./OfferBadge"

export function RecommendationExplanation({
  open,
  onOpenChange,
  best,
  nextBest,
  cardCount,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  best: RankedOffer
  nextBest?: RankedOffer
  cardCount: number
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto rounded-t-[24px] border-travel-border bg-travel-surface px-5 pb-8 pt-6"
      >
        <SheetHeader>
          <SheetTitle className="text-left text-xl font-semibold text-travel-ink">
            Why we picked this
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 rounded-xl bg-travel-subtle p-4 text-center text-sm text-travel-secondary">
          <p>We checked:</p>
          <p className="mt-2 text-2xl font-semibold text-travel-ink">
            {cardCount} cards × 4 platforms
          </p>
          <p className="mt-1 font-medium text-travel-ink">
            = {cardCount * 4} possible combinations
          </p>
        </div>
        <div className="mt-6 space-y-2">
          <OfferBadge variant="best" />
          <p className="text-lg font-semibold text-travel-ink">
            {best.platform} + {best.cardName}
          </p>
          <p className="text-sm font-medium text-travel-ink">
            {formatOfferValue(best)}
          </p>
          <p className="text-sm text-travel-secondary">
            Up to ₹{best.maximumDiscount.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="mt-6">
          <p className="text-sm font-semibold text-travel-ink">Why it ranked first</p>
          <ul className="mt-3 space-y-2">
            <EligibilityRow>Your card is eligible</EligibilityRow>
            {best.discountType !== "cashback" ? (
              <EligibilityRow>Instant discount</EligibilityRow>
            ) : null}
            <EligibilityRow>Highest useful saving potential</EligibilityRow>
            <EligibilityRow>Minimum spend is relatively low</EligibilityRow>
            <EligibilityRow>Available today</EligibilityRow>
            <EligibilityRow>
              {best.category === "flights" ? "Flights" : "Hotels"} eligible
            </EligibilityRow>
          </ul>
        </div>
        {nextBest ? (
          <div className="mt-8 border-t border-travel-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-travel-muted">
              Next best
            </p>
            <p className="mt-2 font-semibold text-travel-ink">
              {nextBest.platform} + {nextBest.cardName}
            </p>
            <p className="text-sm text-travel-secondary">
              {formatOfferValue(nextBest)} · up to ₹
              {nextBest.maximumDiscount.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-sm text-travel-secondary">
              Could be better for bookings above ₹
              {nextBest.minimumSpend.toLocaleString("en-IN")}.
            </p>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
