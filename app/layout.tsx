import type { Metadata } from "next"
import { Geist_Mono, DM_Sans, Noto_Serif_JP } from "next/font/google"
import { Toaster } from "sonner"

import "./globals.css"
import { ConsentBanner } from "@/components/layout/consent-banner"
import { TRPCProvider } from "@/components/providers/trpc-provider"
import { cn } from "@/lib/utils"

const notoSerifHeading = Noto_Serif_JP({
  subsets: ["latin"],
  variable: "--font-heading",
})
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: { default: "TaxiFlash", template: "%s | TaxiFlash" },
  description: "Reservas de taxi por formulario: rápido, simple y sin apps.",
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
        </TRPCProvider>
      </body>
    </html>
  )
}
