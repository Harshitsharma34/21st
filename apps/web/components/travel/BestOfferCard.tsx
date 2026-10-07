"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { RankedOffer } from "@/lib/travel/types"
import { formatOfferValue } from "@/lib/travel/scoring"
import { OfferBadge } from "./OfferBadge"
import { PlatformName } from "./PlatformLogo"
import { EligibilityRow } from "./EligibilityRow"
import { trackEvent } from "@/lib/travel/analytics"

export function BestOfferCard({
  offer,
  onWhyClick,
}: {
  offer: RankedOffer
  onWhyClick: () => void
}) {
  const variant =
    offer.confidence === "low" ? "potential" : offer.expired ? "expired" : "best"

  return (
    <article
      className="rounded-[20px] border border-travel-border bg-travel-surface p-6 shadow-travel-elevated md:p-8"
    >
      <OfferBadge variant={variant === "potential" ? "potential" : "best"} />
      <div className="mt-5">
        <PlatformName platform={offer.platform} />
        <p className="mt-1 text-sm text-travel-secondary">
          Use <span className="font-medium text-travel-ink">{offer.cardName}</span>
        </p>
      </div>
      <div className="mt-6">
        <p className="text-2xl font-semibold tracking-tight text-travel-ink md:text-3xl">
          {formatOfferValue(offer).toUpperCase()}
        </p>
        <p className="mt-1 text-lg font-medium text-travel-ink">
          Up to ₹{offer.maximumDiscount.toLocaleString("en-IN")}
        </p>
      </div>
      <ul className="mt-6 space-y-2">
        {offer.confidence === "low" ? (
          <EligibilityRow variant="warning">
            Verify eligibility on the booking platform
          </EligibilityRow>
        ) : (
          <>
            <EligibilityRow>Your card qualifies</EligibilityRow>
            <EligibilityRow>Available today</EligibilityRow>
            <EligibilityRow>
              {offer.discountType === "cashback"
                ? "Cashback credited later"
                : "Instant saving"}
            </EligibilityRow>
          </>
        )}
      </ul>
      <p className="mt-4 text-xs text-travel-muted">
        Min booking ₹{offer.minimumSpend.toLocaleString("en-IN")} ·{" "}
        {offer.scope === "domestic" ? "Domestic flights" : offer.scope} · Valid
        until{" "}
        {new Date(offer.validUntil).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })}
      </p>
      <Link
        href={`/travel/handoff?offer=${offer.id}`}
        onClick={() => trackEvent("ota_redirect_clicked", { offerId: offer.id, stage: "primary_cta" })}
        className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-[11px] bg-travel-primary text-[15px] font-semibold text-white transition-colors hover:bg-travel-primary-hover"
      >
        Use on {offer.platform}
        <ArrowRight className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={onWhyClick}
        className="mt-4 text-sm font-medium text-travel-primary hover:underline"
      >
        Why this is best →
      </button>
      <p className="mt-4 text-xs leading-relaxed text-travel-muted">
        Best overall based on saving potential, eligibility, offer type and
        restrictions.
      </p>
    </article>
  )
}
