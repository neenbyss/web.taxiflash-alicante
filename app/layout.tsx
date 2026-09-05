import type { Metadata } from "next"
import { Geist_Mono, DM_Sans, Noto_Serif_JP } from "next/font/google"
import { Toaster } from "sonner"

import "./globals.css"
import { ConsentAwareGoogleAnalytics } from "@/components/analytics/google-analytics"
import { ConsentBanner } from "@/components/layout/consent-banner"
import { TRPCProvider } from "@/components/providers/trpc-provider"
import { cn } from "@/lib/utils"

const notoSerifHeading = Noto_Serif_JP({
  subsets: ["latin"],
  variable: "--font-heading",
})
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

const publicUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3500"
const description =
  "Reserva taxis en Alicante, traslados al aeropuerto, viajes urbanos y rutas programadas con TaxiFlash. Servicio rápido, claro y sin instalar aplicaciones."

export const metadata: Metadata = {
  metadataBase: new URL(publicUrl),
  applicationName: "TaxiFlash",
  title: {
    default: "TaxiFlash | Taxi en Alicante y aeropuerto",
    template: "%s | TaxiFlash",
  },
  description,
  keywords: [
    "taxi Alicante",
    "reservar taxi Alicante",
    "taxi aeropuerto Alicante",
    "traslado aeropuerto Alicante",
    "taxi programado",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "TaxiFlash",
    title: "TaxiFlash | Taxi en Alicante y aeropuerto",
    description,
    images: [
      {
        url: "/images/hero_bg.webp",
        width: 1600,
        height: 900,
        alt: "TaxiFlash en Alicante",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TaxiFlash | Taxi en Alicante y aeropuerto",
    description,
    images: ["/images/hero_bg.webp"],
  },
  robots: {
    index: process.env.NODE_ENV === "production",
    follow: process.env.NODE_ENV === "production",
    googleBot: {
      index: process.env.NODE_ENV === "production",
      follow: process.env.NODE_ENV === "production",
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        dmSans.variable,
        notoSerifHeading.variable
      )}
    >
      <body>
        <TRPCProvider>
          {children}
          <ConsentBanner />
          <Toaster richColors position="top-center" />
          <ConsentAwareGoogleAnalytics
            gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}
          />
        </TRPCProvider>
      </body>
    </html>
  )
}
