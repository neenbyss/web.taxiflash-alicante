"use client"

import { AnimatedContent } from "@/components/animated/animated-content"
import { RevealText } from "@/components/animated/reveal-text"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselNavigationDots,
} from "@/components/ui/carousel"
import { RiDoubleQuotesL } from "@/components/icons"
import Image from "next/image"

const testimonials = [
  {
    id: "t1",
    name: "Carlos Martínez",
    location: "Alicante",
    message:
      "Viajé hasta Barcelona por trabajo con Taxi Gold Alicante y el conductor fue muy profesional y puntual. El trayecto fue cómodo y llegué con tiempo de sobra a mi reunión.",
  },
  {
    id: "t2",
    name: "Laura Gómez",
    location: "San Juan de Alicante",
    message:
      "Reservé un traslado al aeropuerto de Alicante a primera hora de la mañana. El taxi llegó antes de la hora acordada y el conductor me ayudó con el equipaje. Servicio muy recomendable.",
  },
  {
    id: "t3",
    name: "Javier Ruiz",
    location: "Alicante",
    message:
      "Utilizo Taxi Gold Alicante para mis desplazamientos urbanos y siempre cumplen con los tiempos. Coches limpios, conductores amables y precios claros sin sorpresas.",
  },
  {
    id: "t4",
    name: "María López",
    location: "Elche",
    message:
      "Hicimos un recorrido turístico por Alicante con Taxi Gold Alicante y el conductor nos fue explicando cada punto de interés. Se notaba que conocía muy bien la zona.",
  },
  {
    id: "t5",
    name: "Andrés Herrera",
    location: "Alicante",
    message:
      "Llegué de un vuelo nocturno y necesitaba un traslado seguro al centro. El conductor de Taxi Gold Alicante fue muy atento y el viaje fue tranquilo a pesar de la hora.",
  },
]

export function Testimonials() {
  return (
    <section className="relative overflow-clip bg-cover md:rounded-4xl">
      <div className="relative z-10 container-screen-2xl">
        <div className="h-50 sm:h-120 xl:h-160" />
        <Carousel>
          <div className="flex flex-col justify-end py-4 sm:py-30 md:gap-20 2xl:grid 2xl:grid-cols-[0.4fr_1fr]">
            <div className="flex flex-col justify-end px-6 2xl:px-0">
              <RevealText
                as="h2"
                className="font-heading text-3xl leading-snug font-medium text-white sm:pb-10 sm:text-6xl"
                text={`Lo que Dicen\nDe Nosotros`}
                delay={0.2}
              />
              <div className="mt-10 flex w-full items-center justify-between gap-2">
                
                <CarouselNavigationDots />

                <div className="flex items-center gap-2 [&_svg]:size-8!">
                  <CarouselPrevious className="static size-8 sm:size-12 translate-y-0 rounded-lg border-none bg-primary hover:bg-primary" />
                  <CarouselNext className="static size-8 sm:size-12 translate-y-0 rounded-lg border-none bg-primary hover:bg-primary" />
                </div>
                
              </div>
            </div>

            <CarouselContent className="items-stretch pt-10">
              {testimonials.map(({ location, message, name }, index) => (
                <CarouselItem
                  key={index}
                  className="h-full grow basis-full sm:basis-1/2"
                >
                  <AnimatedContent
                    key={index}
                    duration={1.4}
                    orientation="bottom"
                    distance={100}
                    initialScale={0.95}
                    className=""
                  >
                    <div className="p-1">
                      <Card>
                        <CardContent>
                          <RiDoubleQuotesL className="size-14 sm:size-20 text-primary/80" />

                          <p className="text-sm sm:text-base"> {message} </p>
                          <div className="mt-6 flex flex-col">
                            <span className="text-lg sm:text-xl font-medium text-foreground">
                              {name}
                            </span>
                            <div>
                              <span> ({location}) </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </AnimatedContent>
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-clip rounded-4xl">
        <Image
          src="/images/testimonial_bg.png"
          alt="Alicante_bg"
          width={1200}
          height={1200}
          className="pointer-events-none absolute top-1/2 left-1/2 size-full -translate-x-1/2 -translate-y-1/2 scale-110 object-cover select-none"
        />

        <div className="absolute inset-0 bg-linear-to-r from-[#161512]/90 to-[#161512]/90" />
        <div className="absolute inset-0 backdrop-blur-sm mask-[linear-gradient(to_top,rgba(0,0,0,1),rgba(0,0,0,0))]" />
      </div>
    </section>
  )
}
