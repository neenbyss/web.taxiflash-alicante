import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { Hero } from "@/components/common/hero"
import {
  RiArrowRightLine,
  RiBuildingLine,
  RiCarLine,
  RiMapPin2Line,
  RiShieldCheckLine,
  RiTaxiLine,
} from "@/components/icons"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce TaxiFlash, nuestra misión, visión y servicios de taxi en Alicante, aeropuerto y alrededores.",
  alternates: { canonical: "/about" },
}

const values = [
  {
    title: "Misión",
    text: "Hacer que cada trayecto en Alicante sea sencillo, puntual y seguro, conectando a pasajeros y conductores con una experiencia clara desde la reserva.",
    icon: RiMapPin2Line,
  },
  {
    title: "Visión",
    text: "Ser el servicio local de referencia para moverse por Alicante, combinando atención humana, tecnología útil y conductores profesionales.",
    icon: RiBuildingLine,
  },
]

const services = [
  {
    title: "Traslados al aeropuerto",
    text: "Recogidas y llegadas al aeropuerto de Alicante-Elche con reserva inmediata o programada.",
    image: "/images/service-aeropuerto.png",
  },
  {
    title: "Taxi urbano",
    text: "Desplazamientos por Alicante y su área metropolitana con seguimiento claro del viaje.",
    image: "/images/service-taxi.png",
  },
  {
    title: "Rutas y traslados turísticos",
    text: "Recorridos personalizados para conocer la costa, la ciudad y otros destinos cercanos.",
    image: "/images/service-turismo.png",
  },
]

export default function AboutPage() {
  return (
    <main className="min-w-0 space-y-5 overflow-x-clip p-1 lg:p-2">
      <Hero
        title={<>Movemos Alicante con cercanía</>}
        description="Somos un servicio de taxi pensado para reservar sin complicaciones, viajar con confianza y recibir atención cuando realmente se necesita."
      />

      <section className="container-screen-2xl py-16 sm:py-28">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="rounded-[2rem] bg-secondary p-7 text-secondary-foreground sm:p-10">
            <RiTaxiLine className="size-10 text-primary" aria-hidden />
            <p className="mt-10 text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              Quiénes somos
            </p>
            <h2 className="mt-4 max-w-xl font-heading text-3xl leading-tight sm:text-5xl">
              Tecnología útil, servicio cercano.
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-secondary-foreground/70">
              TaxiFlash nace para ofrecer una forma más directa de solicitar y
              gestionar viajes. Diseñamos cada paso para que pasajeros,
              conductores y equipo de atención compartan información clara.
            </p>
          </div>
          <div className="relative min-h-80 overflow-hidden rounded-[2rem] sm:min-h-120">
            <Image
              src="/images/alicante.png"
              alt="Vista de Alicante, ciudad donde opera TaxiFlash"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {values.map(({ title, text, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[2rem] bg-card p-7 shadow-sm sm:p-10"
            >
              <div className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-5" aria-hidden />
              </div>
              <h2 className="mt-8 font-heading text-3xl">{title}</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-16 text-secondary-foreground sm:py-28 lg:rounded-[2.5rem]">
        <div className="container-screen-2xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                Servicios
              </p>
              <h2 className="mt-4 max-w-3xl font-heading text-3xl leading-tight sm:text-5xl">
                Un viaje para cada momento
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary-foreground/65">
              <RiShieldCheckLine className="size-5 text-primary" aria-hidden />{" "}
              Conductores y reservas gestionados desde un solo lugar
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="group overflow-hidden rounded-[2rem] bg-white/6"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={service.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 sm:p-8">
                  <RiCarLine className="size-6 text-primary" aria-hidden />
                  <h3 className="mt-5 font-heading text-2xl">
                    {service.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-secondary-foreground/65">
                    {service.text}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button size="lg" render={<Link href="/register" />}>
              Solicitar un taxi <RiArrowRightLine aria-hidden />
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
