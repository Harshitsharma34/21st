"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"

function OtaContent() {
  const searchParams = useSearchParams()
  const platform = searchParams.get("platform") ?? "MakeMyTrip"

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md"
      >
        <p className="text-lg font-medium text-travel-ink">Opening {platform}...</p>
        <div className="mx-auto mt-8 h-1 w-48 overflow-hidden rounded-full bg-travel-subtle">
          <motion.div
            className="h-full bg-travel-primary"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2 }}
          />
        </div>
        <p className="mt-10 text-sm leading-relaxed text-travel-secondary">
          You would now search and complete your booking on {platform}.
        </p>
        <Link
          href="/travel/results"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-[10px] border border-travel-border px-6 text-sm font-semibold text-travel-ink"
        >
          Return to recommendations
        </Link>
      </motion.div>
    </div>
  )
}

export default function OtaTransitionPage() {
  return (
    <main>
      <Suspense>
        <OtaContent />
      </Suspense>
    </main>
  )
}
