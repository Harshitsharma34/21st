"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { loadSelectedCards } from "@/lib/travel/storage"
import { getEligibleOffers } from "@/lib/travel/scoring"

const steps = [
  "Checking your cards...",
  "Matching current travel offers...",
  "Checking eligibility...",
  "Ranking your best options...",
]

export default function MatchingPage() {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [cards, setCards] = useState(5)
  const [offers, setOffers] = useState(12)

  useEffect(() => {
    const ids = loadSelectedCards()
    setCards(ids.length)
    setOffers(getEligibleOffers(ids).length)
  }, [])

  useEffect(() => {
    const timers = steps.map((_, i) =>
      setTimeout(() => setStepIndex(i), i * 700),
    )
    const done = setTimeout(() => router.replace("/travel/results"), 2800)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [router])

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center py-16">
      <div className="w-full max-w-sm text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-medium text-travel-ink"
          >
            {steps[stepIndex]}
          </motion.p>
        </AnimatePresence>
        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-xl border border-travel-border bg-travel-surface p-4">
            <p className="text-2xl font-semibold text-travel-ink">{cards}</p>
            <p className="mt-1 text-xs text-travel-muted">cards</p>
          </div>
          <div className="rounded-xl border border-travel-border bg-travel-surface p-4">
            <p className="text-2xl font-semibold text-travel-ink">4</p>
            <p className="mt-1 text-xs text-travel-muted">travel platforms</p>
          </div>
          <div className="rounded-xl border border-travel-border bg-travel-surface p-4">
            <p className="text-2xl font-semibold text-travel-ink">{offers}</p>
            <p className="mt-1 text-xs text-travel-muted">eligible offers</p>
          </div>
        </div>
        <div className="mt-10 h-1 overflow-hidden rounded-full bg-travel-subtle">
          <motion.div
            className="h-full bg-travel-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.6, ease: "easeInOut" }}
          />
        </div>
      </div>
    </main>
  )
}
