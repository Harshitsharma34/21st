"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { RankedOffer } from "@/lib/travel/types"
import { formatOfferValue } from "@/lib/travel/scoring"
import { PlatformLogo } from "./PlatformLogo"
import { cn } from "@/lib/utils"

export function OfferCard({
  offer,
  href,
  onClick,
}: {
  offer: RankedOffer
  href?: string
  onClick?: () => void
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PlatformLogo platform={offer.platform} />
          <div>
            <p className="font-semibold text-travel-ink">{offer.platform}</p>
            <p className="text-sm text-travel-secondary">{offer.cardName}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-travel-muted" />
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm font-semibold text-travel-ink">
          {formatOfferValue(offer)}
        </span>
        <span className="text-sm text-travel-secondary">
          Up to ₹{offer.maximumDiscount.toLocaleString("en-IN")}
        </span>
      </div>
      <p className="mt-2 text-xs text-travel-muted">
        Min ₹{offer.minimumSpend.toLocaleString("en-IN")} · Valid until{" "}
        {new Date(offer.validUntil).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })}
      </p>
    </>
  )

  const className = cn(
    "block w-full rounded-xl border border-travel-border bg-travel-surface p-4 text-left transition-shadow hover:shadow-sm",
  )

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {inner}
    </button>
  )
}
