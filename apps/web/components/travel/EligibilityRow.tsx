import { AlertTriangle, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function EligibilityRow({
  children,
  variant = "success",
}: {
  children: React.ReactNode
  variant?: "success" | "warning" | "muted"
}) {
  const Icon = variant === "warning" ? AlertTriangle : Check
  return (
    <li
      className={cn(
        "flex items-start gap-2 text-sm",
        variant === "success" && "text-travel-success",
        variant === "warning" && "text-travel-warning",
        variant === "muted" && "text-travel-muted",
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 stroke-[2]" />
      <span className="text-travel-secondary">{children}</span>
    </li>
  )
}
