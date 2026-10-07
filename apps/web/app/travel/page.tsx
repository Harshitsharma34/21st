"use client"

import Link from "next/link"
import { CreditCard, Plane } from "lucide-react"
import { motion } from "framer-motion"
import { trackEvent } from "@/lib/travel/analytics"

export default function TravelAdScreen() {
  return (
    <main className="flex min-h-[100dvh] flex-col justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto w-full max-w-md rounded-2xl border border-travel-border bg-travel-surface p-6 shadow-sm"
      >
        <div className="relative mb-6 flex h-32 items-center justify-center rounded-xl bg-travel-subtle">
          <Plane className="absolute left-8 h-10 w-10 text-travel-primary/40 stroke-[1.5]" />
          <div className="flex -space-x-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex h-14 w-10 items-center justify-center rounded-lg border border-travel-border bg-white shadow-sm"
              >
                <CreditCard className="h-5 w-5 text-travel-secondary" />
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-travel-muted">
          Sponsored · Travel utility
        </p>
        <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-travel-ink">
          5 credit cards. One flight.
          <br />
          Which one should you actually use?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-travel-secondary">
          See your best travel offers across the cards you already own.
        </p>
        <Link
          href="/travel/landing"
          onClick={() => trackEvent("ad_cta_clicked")}
          className="mt-6 flex h-[52px] w-full items-center justify-center rounded-[11px] bg-travel-primary text-[15px] font-semibold text-white hover:bg-travel-primary-hover"
        >
          Find my best offer
        </Link>
      </motion.div>
      <p className="mt-6 text-center text-xs text-travel-muted">
        Prototype · Screen 0 — Ad preview
      </p>
    </main>
  )
}
