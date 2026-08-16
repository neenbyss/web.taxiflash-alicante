import { Hero } from "@/components/common/hero";
import { UbicacionesExplorer } from "./explorer";

export default function Ubication() {
  return (
    <main className="space-y-5 lg:p-2 mb-20">
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
  );
}
