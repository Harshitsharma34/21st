import Link from "next/link"
import { Button } from "@/components/ui/button"

export function EmptyState({
  title = "No matching card offers right now.",
  onRetry,
}: {
  title?: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-2xl border border-travel-border bg-travel-surface p-8 text-center">
      <p className="text-lg font-semibold text-travel-ink">{title}</p>
      <p className="mt-2 text-sm text-travel-secondary">
        We&apos;ll keep checking partner platforms for new deals on your cards.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          variant="outline"
          className="border-travel-border"
          onClick={onRetry}
          asChild={!onRetry}
        >
          {onRetry ? (
            <span>Check again</span>
          ) : (
            <Link href="/travel/cards">Update my cards</Link>
          )}
        </Button>
        <Button variant="ghost" className="text-travel-primary" asChild>
          <Link href="/travel/all-offers?general=1">See general travel offers</Link>
        </Button>
      </div>
    </div>
  )
}
