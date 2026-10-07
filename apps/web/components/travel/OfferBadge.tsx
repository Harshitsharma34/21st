import { cn } from "@/lib/utils"

type Variant = "best" | "higher-spend" | "cashback" | "potential" | "expired"

const labels: Record<Variant, string> = {
  best: "BEST OVERALL",
  "higher-spend": "BEST FOR HIGHER SPEND",
  cashback: "BEST FOR CASHBACK",
  potential: "POTENTIAL OFFER",
  expired: "OFFER EXPIRED",
}

const styles: Record<Variant, string> = {
  best: "bg-travel-primary-subtle text-travel-primary",
  "higher-spend": "bg-travel-subtle text-travel-secondary",
  cashback: "bg-travel-subtle text-travel-secondary",
  potential: "bg-travel-warning-bg text-travel-warning",
  expired: "bg-travel-danger-bg text-travel-danger",
}

export function OfferBadge({
  variant,
  className,
}: {
  variant: Variant
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        styles[variant],
        className,
      )}
    >
      {labels[variant]}
    </span>
  )
}
