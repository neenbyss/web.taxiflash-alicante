import type { Metadata } from "next"

import { Hero } from "@/components/common/hero"
import { UbicacionesExplorer } from "./explorer"

export const metadata: Metadata = {
  title: "Paradas de taxi en Alicante",
  description:
    "Consulta las zonas y paradas atendidas por TaxiFlash en Alicante y encuentra el punto más cercano para comenzar tu viaje.",
  alternates: { canonical: "/ubicaciones" },
}

export default function Ubication() {
  return (
    <main className="mb-20 space-y-5 lg:p-2">
      <h1 className="sr-only">Ubicaciones de TaxiFlash Alicante</h1>
      <Hero
        title={
          <>
            Encuéntranos y{" "}
            <span className="text-primary">empieza tu viaje</span>
          </>
        }
        description="Localiza tu parada de taxi más cercana en Alicante"
      />
      <UbicacionesExplorer />
    </main>
  )
}
