"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function TravelShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showNav =
    pathname.startsWith("/travel/results") ||
    pathname.startsWith("/travel/cards") ||
    pathname.startsWith("/travel/all-offers")

  return (
    <div className="min-h-screen bg-travel-canvas text-travel-ink">
      <div className="mx-auto min-h-screen max-w-[1200px] px-5 md:px-8 lg:px-12">
        {children}
        {showNav ? (
          <nav
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-travel-border bg-travel-surface/95 backdrop-blur md:hidden"
            aria-label="Travel prototype"
          >
            <div className="mx-auto flex max-w-lg">
              <Link
                href="/travel/results"
                className={cn(
                  "flex-1 py-3 text-center text-xs font-medium",
                  pathname.includes("results") || pathname.includes("all-offers")
                    ? "text-travel-primary"
                    : "text-travel-muted",
                )}
              >
                Offers
              </Link>
              <Link
                href="/travel/cards"
                className={cn(
                  "flex-1 py-3 text-center text-xs font-medium",
                  pathname.includes("cards")
                    ? "text-travel-primary"
                    : "text-travel-muted",
                )}
              >
                Cards
              </Link>
            </div>
          </nav>
        ) : null}
      </div>
    </div>
  )
}
