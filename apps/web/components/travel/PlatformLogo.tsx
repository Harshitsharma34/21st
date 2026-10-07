import { cn } from "@/lib/utils"
import type { OTAPlatform } from "@/lib/travel/types"

const styles: Record<OTAPlatform, string> = {
  MakeMyTrip: "bg-[#E5242A] text-white",
  Cleartrip: "bg-[#0F6FFB] text-white",
  EaseMyTrip: "bg-[#F58220] text-white",
  Yatra: "bg-[#C41230] text-white",
}

export function PlatformLogo({
  platform,
  className,
}: {
  platform: OTAPlatform
  className?: string
}) {
  const short =
    platform === "MakeMyTrip"
      ? "MMT"
      : platform === "EaseMyTrip"
        ? "EMT"
        : platform.slice(0, 2).toUpperCase()
  return (
    <span
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold tracking-tight",
        styles[platform],
        className,
      )}
      aria-label={platform}
    >
      {short}
    </span>
  )
}

export function PlatformName({ platform }: { platform: OTAPlatform }) {
  return <span className="text-base font-semibold text-travel-ink">{platform}</span>
}
