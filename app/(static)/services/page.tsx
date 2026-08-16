import { Hero } from "@/components/common/hero";
import { Featured } from "./featured.section";
import { Extended } from "./extended.section";
import { Process } from "./process.section";
import { Cta } from "./cta.section";

export default function ServicesPage() {
  return (
    <main className="lg:p-2 space-y-5">
      <h1 className="sr-only"> Servicios de Taxi Gold Alicante </h1>
      <Hero
        title="Nuestros Servicios"
        description="Soluciones de transporte adaptadas a cada momento: traslados al aeropuerto, taxi urbano, rutas turísticas y mucho más."
      />
      <Featured />
      <Process />
      <Extended />
      <Cta />
    </main>
  );
}
