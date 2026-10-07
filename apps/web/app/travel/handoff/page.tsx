"use client"

import { Suspense, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { HandoffScreen } from "@/components/travel/HandoffModal"
import { MOCK_OFFERS } from "@/lib/travel/mock-data"
import { enrichOffer } from "@/lib/travel/scoring"

function HandoffContent() {
  const searchParams = useSearchParams()
  const offerId = searchParams.get("offer")

  const offer = useMemo(() => {
    const raw = MOCK_OFFERS.find((o) => o.id === offerId)
    return raw ? enrichOffer(raw) : undefined
  }, [offerId])

  if (!offer) {
    return (
      <Link href="/travel/results" className="text-travel-primary">
        Back to recommendations
      </Link>
    )
  }

  return <HandoffScreen offer={offer} />
}

export default function HandoffPage() {
  return (
    <main className="py-8">
      <Suspense fallback={<p className="text-travel-muted">Loading...</p>}>
        <HandoffContent />
      </Suspense>
    </main>
  )
}
