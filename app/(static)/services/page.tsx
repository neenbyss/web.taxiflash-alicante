import type { Metadata } from "next"
import { ServicesHero } from "./hero.section"
import { ServicesCatalogue } from "./catalogue.section"

export const metadata: Metadata = {
  title: "Servicios de taxi en Alicante",
  description:
    "Taxi urbano, traslados al aeropuerto de Alicante, rutas turísticas y alquiler por horas. Organiza tu trayecto con TaxiFlash.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Un taxi para cada plan | TaxiFlash",
    url: "/services",
    description:
      "Descubre nuestros servicios de taxi en Alicante y prepara tu próximo viaje.",
  },
}

export default function ServicesPage() {
  return (
    <main className="min-w-0 overflow-x-clip p-1 lg:p-2">
      <ServicesHero />
      <ServicesCatalogue />
    </main>
  )
}
