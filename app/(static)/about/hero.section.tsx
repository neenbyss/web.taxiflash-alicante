import { Hero } from "@/components/common/hero"

export function AboutHero() {
  return (
    <Hero
      title={
        <>
          De aquí. <span className="text-primary">Para acompañarte.</span>
        </>
      }
      description="Alicante es nuestro punto de partida. Las personas y sus planes, el motivo de cada trayecto."
    />
  )
}
