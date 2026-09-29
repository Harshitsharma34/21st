import { Inter, Instrument_Serif } from "next/font/google"
import BizfocPage from "@/components/bizfoc/BizfocPage"

const serif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bz-serif",
})
const sans = Inter({ subsets: ["latin"], variable: "--font-bz-sans" })

export const metadata = {
  title: "Bizfoc — Expert Solution For Every Business Challenge",
  description:
    "Registrations, filings and ongoing compliance for your business in India.",
}

export default function Page() {
  return (
    <div className={`${serif.variable} ${sans.variable}`}>
      <BizfocPage />
    </div>
  )
}
