/* eslint-disable @next/next/no-img-element */
"use client"
import { AnimatedContent } from "@/components/animated/animated-content"
import { RevealText } from "@/components/animated/reveal-text"
import { HailTaxiIcon } from "@/components/icons/hail-taxi"
import { TaxiIcon } from "@/components/icons/taxi"
import { TaxiAirportIcon } from "@/components/icons/taxi-airport"
import { Button } from "@/components/ui/button"
import { RiArrowRightLine } from "@/components/icons"
import Link from "next/link"

const services = [
  {
    id: "airport-transfer",
    icon: TaxiAirportIcon,
    title: "Transporte al aeropuerto",
    description:
      "Reserva tu taxi con destino al aeropuerto de Alicante de manera cómoda y segura.",
    image: "/images/service-aeropuerto.png",
  },
  {
    id: "urban-taxi",
    icon: TaxiIcon,
    title: "Transporte – Taxi Urbano",
    description:
      "Desplazamientos rápidos y seguros por toda la ciudad de Alicante con tarifas competitivas.",
    image: "/images/service-taxi.png",
  },
  {
    id: "tourist-transfer",
    icon: HailTaxiIcon,
    title: "Traslados Turísticos",
    description:
      "Recorridos por los principales puntos de interés de Alicante con conductores locales.",
    image: "/images/service-turismo.png",
  },
]

export function Services() {
  return (
    <section className="container-screen-2xl py-15 sm:py-30">
      <div className="flex items-end justify-between gap-4">
        <RevealText
          as="h2"
          className="max-w-4xl font-heading text-3xl leading-normal md:text-6xl"
          text={`<primary>Servicios</primary> De Taxi\nPara Todos <primary>Tus Viajes</primary>`}
          styles={{
            primary: "text-primary",
          }}
          delay={0.2}
        />
        <AnimatedContent delay={1.5} orientation="left">
          <Button
            size="lg"
            className="hidden sm:flex"
            variant="secondary"
            render={<Link href="/about" />}
          >
            Conócenos
            <RiArrowRightLine />
          </Button>
        </AnimatedContent>
      </div>

      <div className="mt-8 mb-12 flex grid-cols-3 flex-col gap-4 sm:mt-20 sm:mb-0 lg:grid">
        {services.map(({ title, description, icon: Icon, image }, i) => {
          return (
            <AnimatedContent
              delay={0.6 + i * 0.02}
              duration={1.6}
              initialScale={0.8}
              key={i}
              orientation="right"
              distance={200}
              className="relative origin-bottom-right overflow-clip rounded-3xl"
            >
              <div className="relative z-10 flex h-full flex-col p-2 xl:p-4">
                <div className="h-50 lg:h-100" />
                <div className="grow rounded-xl bg-card/90 p-2 text-card-foreground backdrop-blur-sm sm:p-4">
                  <h3 className="flex items-center gap-2 text-lg font-medium capitalize sm:text-xl">
                    <div className="flex size-7 flex-col items-center justify-center rounded-full bg-primary sm:size-10">
                      {" "}
                      <Icon className="size-4 text-primary-foreground sm:size-5" />{" "}
                    </div>
                    {title}
                  </h3>
                  <p className="mt-2 px-4 opacity-80">{description}</p>
                </div>
              </div>

              <img
                alt="BG"
                src={image}
                className="absolute top-0 left-0 size-full object-cover"
              />
            </AnimatedContent>
          )
        })}
      </div>

      <AnimatedContent delay={0.2} orientation="bottom" className="sm:hidden">
        <Button
          className="w-full"
          variant="secondary"
          render={<Link href="/about" />}
        >
          Conócenos
          <RiArrowRightLine />
        </Button>
      </AnimatedContent>
    </section>
  )
}
