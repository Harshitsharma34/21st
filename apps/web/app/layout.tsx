import { GoogleAnalytics } from "@next/third-parties/google"
import localFont from "next/font/local"
import { headers } from "next/headers"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "next-themes"
import { cn } from "@/lib/utils"
import { AppProviders } from "./providers"
import { TravelRoot } from "./travel-root"

import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isTravelPrototype = headers().get("x-travel-prototype") === "1"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable)}>
        {isTravelPrototype ? (
          <TravelRoot>{children}</TravelRoot>
        ) : (
          <div className="px-4 h-full">
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <TooltipProvider>
                <AppProviders>{children}</AppProviders>
              </TooltipProvider>
              <Toaster />
            </ThemeProvider>
          </div>
        )}
      </body>
      {!isTravelPrototype ? <GoogleAnalytics gaId="G-X7C2K3V7GX" /> : null}
    </html>
  )
}
