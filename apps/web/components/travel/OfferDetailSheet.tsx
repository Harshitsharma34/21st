"use client"

import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"
import type { RankedOffer } from "@/lib/travel/types"
import { formatOfferValue } from "@/lib/travel/scoring"
import { EligibilityRow } from "./EligibilityRow"
import { PlatformName } from "./PlatformLogo"
import { trackEvent } from "@/lib/travel/analytics"

export function OfferDetailPage({ offer }: { offer: RankedOffer }) {
  const isExpired = offer.expired

  return (
    <div className="mx-auto max-w-lg space-y-8 pb-24">
      <div>
        <p className="text-sm text-travel-secondary">{offer.cardName}</p>
        <h1 className="mt-1 text-2xl font-semibold text-travel-ink">
          × <PlatformName platform={offer.platform} />
        </h1>
      </div>
      <div>
        <p className="text-xl font-semibold text-travel-ink">
          {formatOfferValue(offer)}
        </p>
        <p className="text-travel-secondary">
          Maximum ₹{offer.maximumDiscount.toLocaleString("en-IN")}
        </p>
      </div>
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-travel-muted">
          Eligibility
        </h2>
        <ul className="mt-3 space-y-2">
          <EligibilityRow>{offer.cardName}</EligibilityRow>
          <EligibilityRow>
            {offer.category === "flights" ? "Flight" : "Hotel"} bookings
          </EligibilityRow>
          <EligibilityRow>
            Minimum booking ₹{offer.minimumSpend.toLocaleString("en-IN")}
          </EligibilityRow>
          <EligibilityRow>Valid today</EligibilityRow>
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-travel-muted">
          Conditions
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-travel-secondary">
          <li>Maximum discount ₹{offer.maximumDiscount.toLocaleString("en-IN")}</li>
          <li>
            Valid until{" "}
            {new Date(offer.validUntil).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
            })}
          </li>
          {offer.restrictions.map((r) => (
            <li key={r}>{r}</li>
          ))}
          <li>Final eligibility is verified by {offer.platform}</li>
        </ul>
      </section>
      <p className="flex items-center gap-2 text-xs text-travel-muted">
        <Clock className="h-3.5 w-3.5" />
        Last checked 2 min ago
      </p>
      {!isExpired ? (
        <Link
          href={`/travel/handoff?offer=${offer.id}`}
          onClick={() =>
            trackEvent("ota_redirect_clicked", { offerId: offer.id, stage: "detail" })
          }
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[11px] bg-travel-primary text-[15px] font-semibold text-white hover:bg-travel-primary-hover"
        >
          Use offer on {offer.platform}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  )
}
