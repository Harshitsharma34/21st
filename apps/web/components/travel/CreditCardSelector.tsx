"use client"

import { Search, Check } from "lucide-react"
import { useMemo, useState } from "react"
import { CREDIT_CARDS } from "@/lib/travel/mock-data"
import { formatCardLabel } from "@/lib/travel/mock-data"
import { trackEvent } from "@/lib/travel/analytics"
import { cn } from "@/lib/utils"

export function CreditCardSelector({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const [query, setQuery] = useState("")

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = CREDIT_CARDS.filter((c) => {
      const label = formatCardLabel(c).toLowerCase()
      return !q || label.includes(q) || c.bank.toLowerCase().includes(q)
    })
    const banks = [...new Set(filtered.map((c) => c.bank))]
    return banks.map((bank) => ({
      bank,
      cards: filtered.filter((c) => c.bank === bank),
    }))
  }, [query])

  const toggle = (id: string) => {
    const isSelected = selected.includes(id)
    const next = isSelected
      ? selected.filter((x) => x !== id)
      : [...selected, id]
    trackEvent(isSelected ? "card_removed" : "card_selected", { cardId: id })
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-travel-muted" />
        <input
          type="search"
          placeholder="Search cards"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 w-full rounded-[10px] border border-travel-border bg-travel-surface pl-10 pr-4 text-sm text-travel-ink outline-none ring-travel-primary focus:ring-2"
        />
      </div>
      <div className="space-y-6">
        {grouped.map(({ bank, cards }) => (
          <div key={bank}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-travel-muted">
              {bank}
            </p>
            <ul className="space-y-2">
              {cards.map((card) => {
                const isOn = selected.includes(card.id)
                return (
                  <li key={card.id}>
                    <button
                      type="button"
                      onClick={() => toggle(card.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors duration-200",
                        isOn
                          ? "border-travel-primary bg-travel-primary-subtle"
                          : "border-travel-border bg-travel-surface hover:bg-travel-subtle",
                      )}
                    >
                      <span className="text-sm font-medium text-travel-ink">
                        {formatCardLabel(card)}
                      </span>
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border",
                          isOn
                            ? "border-travel-primary bg-travel-primary text-white"
                            : "border-travel-border",
                        )}
                      >
                        {isOn ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
