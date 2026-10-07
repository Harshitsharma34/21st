import { Inter } from "next/font/google"
import { TravelShell } from "@/components/travel/TravelShell"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-travel",
})

export const metadata = {
  title: "Travel Card Offers — Prototype",
  description: "Find the best travel offers across your credit cards",
}

export default function TravelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        inter.variable,
        "font-[family-name:var(--font-travel)] -mx-4 min-h-screen font-sans antialiased",
      )}
    >
      <TravelShell>{children}</TravelShell>
    </div>
  )
}
