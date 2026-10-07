"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import type { TripOpportunity } from "@/lib/travel/types"
import { trackEvent } from "@/lib/travel/analytics"
import { dismissTripOpportunity } from "@/lib/travel/storage"

export function TripOpportunityCard({
  trip,
  onDismiss,
}: {
  trip: TripOpportunity
  onDismiss: () => void
}) {
  return (
    <aside
      className="rounded-2xl border border-travel-border/80 bg-gradient-to-b from-white to-[#FAFBF8] p-5 shadow-sm"
      onMouseEnter={() =>
        trackEvent("trip_opportunity_impression", {
          destination: trip.destination,
        })
      }
    >
      <div className="flex items-center gap-2 text-travel-secondary">
        <Sparkles className="h-4 w-4 stroke-[1.5] text-travel-primary/80" />
        <span className="text-[11px] font-semibold tracking-widest text-travel-secondary">
          TRIP OPPORTUNITY
        </span>
      </div>
      <p className="mt-4 text-lg font-semibold leading-snug text-travel-ink">
        Your cards could work well together for a getaway.
      </p>
      <p className="mt-4 text-sm font-semibold tracking-wide text-travel-ink">
        {trip.origin} → {trip.destination}
      </p>
      <p className="mt-1 text-sm text-travel-secondary">
        {trip.nights} nights · For two
      </p>
      <div className="mt-5 space-y-3 border-t border-travel-border pt-4">
        <div>
          <p className="text-sm font-medium text-travel-ink">
            {trip.flightOffer.cardName}
          </p>
          <p className="text-xs text-travel-secondary">Flight offer available</p>
        </div>
        <div>
          <p className="text-sm font-medium text-travel-ink">
            {trip.hotelOffer.cardName}
          </p>
          <p className="text-xs text-travel-secondary">Hotel benefit available</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-travel-muted">
        Potential card benefits across this trip
      </p>
      <Link
        href="/travel/trip"
        onClick={() => trackEvent("trip_opportunity_opened", { destination: trip.destination })}
        className="mt-4 flex h-11 w-full items-center justify-center rounded-[10px] border border-travel-border bg-travel-surface text-sm font-semibold text-travel-ink transition-colors hover:bg-travel-subtle"
      >
        See trip idea →
      </Link>
      <button
        type="button"
        onClick={() => {
          dismissTripOpportunity()
          trackEvent("trip_opportunity_dismissed")
          onDismiss()
        }}
        className="mt-2 w-full py-2 text-xs text-travel-muted hover:text-travel-secondary"
      >
        Not relevant right now
      </button>
      <p className="mt-3 text-center text-[10px] text-travel-muted">
        Powered by 30 Sundays
      </p>
    </aside>
  )
}
