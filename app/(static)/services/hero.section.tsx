import { Hero } from "@/components/common/hero"

export function ServicesHero() {
  return (
    <Hero
      title={
        <>
          Un taxi para <span className="text-primary">cada plan.</span>
        </>
      }
      description="Aeropuerto, ciudad, trabajo o una escapada. Encuentra el traslado que encaja con tu día y descubre qué necesitas para organizarlo."
    />
  )
}
