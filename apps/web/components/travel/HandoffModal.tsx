"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { RankedOffer } from "@/lib/travel/types"
import { MOCK_CARD_LAST_FOUR } from "@/lib/travel/mock-data"
import { formatOfferValue } from "@/lib/travel/scoring"
import { trackEvent } from "@/lib/travel/analytics"

export function HandoffScreen({ offer }: { offer: RankedOffer }) {
  const lastFour = MOCK_CARD_LAST_FOUR[offer.cardId] ?? "0000"

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-travel-ink">Before you go</h1>
        <p className="mt-2 text-travel-secondary">
          You&apos;re heading to <span className="font-medium text-travel-ink">{offer.platform}</span>
        </p>
      </div>
      <div className="rounded-2xl border border-travel-border bg-travel-subtle p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-travel-muted">
          Remember to use
        </p>
        <p className="mt-2 text-lg font-semibold text-travel-ink">{offer.cardName}</p>
        <p className="font-mono text-sm text-travel-secondary">•••• {lastFour}</p>
        <p className="mt-1 text-[11px] text-travel-muted">
          Last four digits are mock demo data only
        </p>
      </div>
      <div className="rounded-2xl border border-travel-border p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-travel-muted">
          Your offer
        </p>
        <p className="mt-2 font-semibold text-travel-ink">{formatOfferValue(offer)}</p>
        <p className="text-sm text-travel-secondary">
          Up to ₹{offer.maximumDiscount.toLocaleString("en-IN")}
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-travel-muted">Minimum booking</dt>
            <dd className="font-medium text-travel-ink">
              ₹{offer.minimumSpend.toLocaleString("en-IN")}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-travel-muted">Valid until</dt>
            <dd className="font-medium text-travel-ink">
              {new Date(offer.validUntil).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
              })}
            </dd>
          </div>
        </dl>
      </div>
      <p className="text-sm leading-relaxed text-travel-secondary">
        Final eligibility and fare depend on the flight you select on {offer.platform}.
      </p>
      <Link
        href={`/travel/ota?platform=${encodeURIComponent(offer.platform)}&offer=${offer.id}`}
        onClick={() =>
          trackEvent("ota_redirect_clicked", { offerId: offer.id, stage: "continue" })
        }
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[11px] bg-travel-primary text-[15px] font-semibold text-white hover:bg-travel-primary-hover"
      >
        Continue to {offer.platform}
        <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href={`/travel/offer/${offer.id}`}
        className="block text-center text-sm font-medium text-travel-primary"
      >
        View offer conditions
      </Link>
    </div>
  )
}
