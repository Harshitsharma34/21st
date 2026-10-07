"use client"

import Link from "next/link"
import { trackEvent } from "@/lib/travel/analytics"

const otas = ["MakeMyTrip", "Cleartrip", "EaseMyTrip", "Yatra"]

export default function LandingPage() {
  return (
    <main className="pb-16 pt-10 md:pt-16">
      <div className="mx-auto max-w-2xl text-center md:text-left">
        <h1 className="text-[32px] font-semibold leading-[1.1] tracking-tight text-travel-ink md:text-[40px]">
          Your cards already have travel deals.
          <br className="hidden md:block" />
          We&apos;ll find the ones worth using.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-travel-secondary">
          Compare travel offers across your credit cards without checking every
          booking platform yourself.
        </p>
        <Link
          href="/travel/cards"
          onClick={() => trackEvent("landing_cta_clicked")}
          className="mt-8 inline-flex h-[52px] w-full items-center justify-center rounded-[11px] bg-travel-primary text-[15px] font-semibold text-white hover:bg-travel-primary-hover sm:w-auto sm:px-10"
        >
          Find my offers
        </Link>
        <p className="mt-4 text-sm text-travel-muted">No card number required.</p>
      </div>

      <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-travel-border bg-travel-surface p-6 text-center md:mt-20">
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-travel-ink">
          <span>YOUR CARDS</span>
          <span className="text-travel-muted">×</span>
          <span>CURRENT TRAVEL OFFERS</span>
          <span className="text-travel-muted">×</span>
          <span>ELIGIBILITY</span>
          <span className="text-travel-muted">=</span>
          <span className="text-travel-primary">YOUR BEST MATCH</span>
        </div>
      </div>

      <section className="mx-auto mt-16 max-w-2xl md:mt-24">
        <h2 className="text-xl font-semibold text-travel-ink">
          Stop checking every platform.
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {otas.map((name) => (
            <span
              key={name}
              className="rounded-lg border border-travel-border bg-travel-surface px-3 py-2 text-sm font-medium text-travel-secondary"
            >
              {name}
            </span>
          ))}
        </div>
        <p className="mt-6 text-sm leading-relaxed text-travel-secondary">
          We find the offer. You complete the booking directly with the travel
          platform.
        </p>
      </section>
    </main>
  )
}
