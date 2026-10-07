"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CreditCardSelector } from "@/components/travel/CreditCardSelector"
import { loadSelectedCards, saveSelectedCards } from "@/lib/travel/storage"
import { trackEvent } from "@/lib/travel/analytics"

export default function CardSelectionPage() {
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    setSelected(loadSelectedCards())
  }, [])

  const onChange = (ids: string[]) => {
    setSelected(ids)
    saveSelectedCards(ids)
  }

  return (
    <main className="pb-32 pt-8 md:pt-12">
      <h1 className="text-[28px] font-semibold tracking-tight text-travel-ink md:text-[32px]">
        Which cards do you have?
      </h1>
      <p className="mt-2 text-travel-secondary">
        We only need your card type to check which offers you&apos;re eligible for.
      </p>
      <div className="mt-8">
        <CreditCardSelector selected={selected} onChange={onChange} />
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-travel-border bg-travel-surface/95 p-5 backdrop-blur md:static md:mt-10 md:border-0 md:bg-transparent md:p-0">
        <Link
          href="/travel/matching"
          onClick={() =>
            trackEvent("recommendations_generated", { cardCount: selected.length })
          }
          className={`flex h-[52px] w-full items-center justify-center rounded-[11px] text-[15px] font-semibold ${
            selected.length
              ? "bg-travel-primary text-white hover:bg-travel-primary-hover"
              : "pointer-events-none bg-travel-subtle text-travel-muted"
          }`}
        >
          Find offers for {selected.length || 0} cards
        </Link>
        <p className="mt-3 text-center text-xs text-travel-muted md:text-left">
          Your actual card credentials are never required.
        </p>
      </div>
    </main>
  )
}
