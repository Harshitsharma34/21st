import Link from "next/link"
import type { RankedOffer } from "@/lib/travel/types"
import { formatOfferValue } from "@/lib/travel/scoring"
import { OfferBadge } from "./OfferBadge"
import { PlatformName } from "./PlatformLogo"

export function AlternativeOfferCard({
  offer,
  label,
  href,
}: {
  offer: RankedOffer
  label: "higher-spend" | "cashback"
  href: string
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-travel-border bg-travel-surface p-5 transition-shadow hover:shadow-sm"
    >
      <OfferBadge variant={label} />
      <div className="mt-4">
        <PlatformName platform={offer.platform} />
        <p className="text-sm text-travel-secondary">{offer.cardName}</p>
      </div>
      <p className="mt-3 text-sm font-semibold text-travel-ink">
        {formatOfferValue(offer)}
      </p>
      <p className="text-sm text-travel-secondary">
        Up to ₹{offer.maximumDiscount.toLocaleString("en-IN")}
      </p>
      <p className="mt-2 text-xs text-travel-muted">
        Min spend ₹{offer.minimumSpend.toLocaleString("en-IN")}
      </p>
      {offer.discountType === "cashback" ? (
        <p className="mt-2 text-xs text-travel-warning">Cashback received later</p>
      ) : null}
    </Link>
  )
}
