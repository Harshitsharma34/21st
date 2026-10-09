import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Fraunces, Inter } from "next/font/google"
import "./globals.css"

const gelica = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
})

const geist = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "beat the hype",
  description: "Will this place actually be worth visiting on your dates?",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${gelica.variable} ${geist.variable}`}>
      <body>{children}</body>
    </html>
  )
}
