"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { loadSelectedCards } from "@/lib/travel/storage"
import { detectTripOpportunity } from "@/lib/travel/trip-opportunity"
import { trackEvent } from "@/lib/travel/analytics"
import type { TripPriority, TripVibe } from "@/lib/travel/types"
import { EligibilityRow } from "@/components/travel/EligibilityRow"
import { cn } from "@/lib/utils"

type Step = "intro" | "vibe" | "priority" | "preview"

const vibes: { id: TripVibe; label: string }[] = [
  { id: "relaxed", label: "Relaxed" },
  { id: "adventure", label: "Adventure" },
  { id: "food", label: "Food & culture" },
  { id: "romantic", label: "Romantic" },
  { id: "everything", label: "A bit of everything" },
]

const priorities: { id: TripPriority; label: string }[] = [
  { id: "budget", label: "Lower budget" },
  { id: "stays", label: "Better stays" },
  { id: "experiences", label: "More experiences" },
  { id: "balanced", label: "Balanced" },
]

export default function ThirtySundaysTripPage() {
  const [step, setStep] = useState<Step>("intro")
  const [vibe, setVibe] = useState<TripVibe | null>(null)
  const [priority, setPriority] = useState<TripPriority | null>(null)

  const trip = useMemo(() => detectTripOpportunity(loadSelectedCards()), [])

  useEffect(() => {
    if (!trip) return
    trackEvent("trip_opportunity_opened", { destination: trip.destination })
  }, [trip])

  if (!trip) {
    return (
      <main className="py-10">
        <p className="text-travel-secondary">
          No trip opportunity is available for your current cards.
        </p>
        <Link href="/travel/results" className="mt-4 text-travel-primary">
          Back to offers
        </Link>
      </main>
    )
  }

  const previewTitle =
    vibe === "romantic"
      ? "Sunset dinners & quiet beaches"
      : vibe === "adventure"
        ? "Volcano hikes & reef days"
        : vibe === "food"
          ? "Warungs, markets & cooking classes"
          : priority === "budget"
            ? "Smart stays & local experiences"
            : "Pool mornings, spa afternoons"

  return (
    <main className="pb-16 pt-8">
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-lg"
          >
            <p className="text-sm text-travel-muted">30 Sundays</p>
            <h1 className="mt-2 text-[28px] font-semibold leading-tight text-travel-ink">
              Your cards gave us an idea.
            </h1>
            <div className="mt-8 rounded-2xl border border-travel-border bg-travel-surface p-6">
              <p className="text-2xl font-semibold tracking-wide text-travel-ink">
                {trip.destination} FOR TWO
              </p>
              <p className="mt-2 text-travel-secondary">{trip.nights} nights</p>
              <p className="mt-1 text-sm text-travel-secondary">{trip.vibe}</p>
            </div>
            <div className="mt-8">
              <p className="text-sm font-semibold text-travel-ink">Why this could work</p>
              <ul className="mt-3 space-y-2">
                {trip.reasons.map((r) => (
                  <EligibilityRow key={r}>{r}</EligibilityRow>
                ))}
              </ul>
            </div>
            <p className="mt-8 text-sm leading-relaxed text-travel-secondary">
              30 Sundays can turn this into a trip built around both of you.
            </p>
            <button
              type="button"
              onClick={() => {
                setStep("vibe")
                trackEvent("trip_preference_started")
              }}
              className="mt-6 flex h-[52px] w-full items-center justify-center rounded-[11px] bg-travel-primary text-[15px] font-semibold text-white"
            >
              Explore {trip.destination} with 30 Sundays
            </button>
            <Link
              href="/travel/results"
              onClick={() => trackEvent("trip_opportunity_dismissed")}
              className="mt-3 block text-center text-sm text-travel-muted"
            >
              Not interested
            </Link>
          </motion.div>
        )}

        {step === "vibe" && (
          <motion.div
            key="vibe"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg"
          >
            <h2 className="text-xl font-semibold text-travel-ink">
              What kind of trip are you two looking for?
            </h2>
            <div className="mt-6 grid gap-2">
              {vibes.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setVibe(v.id)
                    setStep("priority")
                  }}
                  className="rounded-xl border border-travel-border bg-travel-surface px-4 py-3.5 text-left text-sm font-medium hover:bg-travel-subtle"
                >
                  {v.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "priority" && (
          <motion.div
            key="priority"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg"
          >
            <h2 className="text-xl font-semibold text-travel-ink">
              What matters more?
            </h2>
            <div className="mt-6 grid gap-2">
              {priorities.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPriority(p.id)
                    setStep("preview")
                    trackEvent("trip_preference_completed", {
                      vibe: vibe ?? "everything",
                      priority: p.id,
                    })
                  }}
                  className="rounded-xl border border-travel-border bg-travel-surface px-4 py-3.5 text-left text-sm font-medium hover:bg-travel-subtle"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "preview" && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg"
          >
            <p className="text-sm text-travel-muted">Your trip preview</p>
            <h2 className="mt-2 text-2xl font-semibold text-travel-ink">
              {trip.destination} · {trip.nights} nights
            </h2>
            <div className="mt-6 space-y-3 rounded-2xl border border-travel-border bg-travel-surface p-5">
              <PreviewRow label="Vibe" value={vibes.find((v) => v.id === vibe)?.label ?? "Balanced"} />
              <PreviewRow
                label="Focus"
                value={priorities.find((p) => p.id === priority)?.label ?? "Balanced"}
              />
              <PreviewRow label="Sample days" value={previewTitle} />
              <p className="text-xs text-travel-muted">
                Potential card benefits on flights and hotels — exact savings depend on
                what you book.
              </p>
            </div>
            <a
              href="https://30sundays.ai"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("30sundays_redirect_clicked")}
              className={cn(
                "mt-8 flex h-[52px] w-full items-center justify-center rounded-[11px] bg-travel-primary text-[15px] font-semibold text-white",
              )}
            >
              Continue planning with 30 Sundays →
            </a>
            <Link href="/travel/results" className="mt-3 block text-center text-sm text-travel-muted">
              Back to card offers
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-travel-muted">
        {label}
      </p>
      <p className="text-sm font-medium text-travel-ink">{value}</p>
    </div>
  )
}
