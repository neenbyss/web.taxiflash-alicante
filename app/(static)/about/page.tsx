import type { Metadata } from "next"
import { AboutHero } from "./hero.section"
import { AboutStory } from "./story.section"
import { AboutPurpose } from "./purpose.section"
import { AboutPrinciples } from "./principles.section"

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce TaxiFlash: una forma cercana de moverte por Alicante. Nuestra misión, visión y compromiso con una reserva sencilla.",
  alternates: { canonical: "/about" },
}

export default function AboutPage() {
  return (
    <main className="min-w-0 overflow-x-clip p-1 lg:p-2">
      <AboutHero />
      <AboutStory />
      <AboutPurpose />
      <AboutPrinciples />
    </main>
  )
}
