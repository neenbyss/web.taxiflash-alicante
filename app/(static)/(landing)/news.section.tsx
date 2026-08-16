/* eslint-disable @next/next/no-img-element */
"use client"

import { AnimatedContent } from "@/components/animated/animated-content"
import { RevealText } from "@/components/animated/reveal-text"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNavigationDots,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  RiArrowRightLine,
  RiCalendarLine,
  RiExternalLinkLine,
} from "@remixicon/react"
import Image from "next/image"

export function News() {
  return (
    <section className="py-30">
      <div className="container-screen-2xl mb-12 flex justify-between sm:mb-0 sm:items-end">
        <RevealText
          as="h2"
          className="max-w-4xl font-heading text-3xl leading-snug sm:text-6xl"
          text={`Nuestras\n últimas noticias`}
          delay={0.2}
        />
        <AnimatedContent delay={0.6} orientation="left">
          <Button variant="secondary">
            Saber Más
            <RiArrowRightLine />
          </Button>
        </AnimatedContent>
      </div>

      <Carousel className="relative container-screen-2xl flex grid-cols-[0.4fr_1fr] flex-col gap-10 md:mt-20 md:grid">
        <AnimatedContent
          delay={0.4}
          orientation="bottom"
          className="flex w-full flex-col justify-between sm:py-10"
        >
          <p>
            {" "}
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Vel
            mollitia deleniti esse, id eveniet illum aperiam architecto
            reiciendis, doloremque, est deserunt. Ipsum provident repellat
            consequuntur optio numquam incidunt porro sequi!{" "}
          </p>
        </AnimatedContent>

        <CarouselContent>
          {Array.from({ length: 10 }).map((_, i) => {
            return (
              <CarouselItem key={i} className="shrink-0 basis-1/2">
                <AnimatedContent
                  key={i}
                  orientation="right"
                  initialScale={0.8}
                  distance={400}
                  duration={2.5}
                  scroll={false}
                  className="origin-bottom-right p-1"
                >
                  <div className="group relative overflow-clip rounded-2xl bg-card duration-500 hover:ring-2 hover:ring-primary sm:rounded-4xl sm:bg-transparent">
                    <div className="relative z-10 p-0 sm:p-6">
                      <div className="hidden h-120 sm:block" />

                      <div className="absolute top-4 right-4 z-10 flex size-12 -translate-x-4 translate-y-4 flex-col items-center justify-center opacity-0 duration-500 ease-in-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 text-inner-foreground">
                        <RiExternalLinkLine />
                      </div>

                      <div className="relative z-10 text-inner-foreground">
                        <h3 className="mb-5 flex translate-y-10 items-center gap-2 font-heading text-4xl opacity-0 duration-500 ease-in-out group-hover:translate-y-0 group-hover:opacity-100">
                          Transporte al aeropuerto{" "}
                        </h3>
                        <p className="translate-y-10 opacity-0 delay-100 duration-500 ease-in-out group-hover:translate-y-0 group-hover:opacity-80">
                          Reserva tu taxi con destino al aeropuerto de
                          Alicante de manera cómoda y segura.
                        </p>

                        <div className="mt-4 flex items-center gap-2 justify-between">
                          <span className="flex translate-x-10 items-center gap-2 text-xs opacity-0 delay-100 duration-500 ease-in-out group-hover:translate-x-0 group-hover:opacity-80">
                            <RiCalendarLine className="size-4" />
                            {"21 de Octubre, 2025"}{" "}
                          </span>
                          <span className="-translate-x-10 rounded-xl bg-primary text-primary-foreground px-4 py-2 opacity-0 delay-100 duration-500 ease-in-out group-hover:translate-x-0 group-hover:opacity-80 flex items-center w-fit gap-2 font-medium">
                            Leer
                            <RiArrowRightLine />
                          </span>
                        </div>
                      </div>

                      <Image
                        alt="BG"
                        src={"/images/service-turismo.png"}
                        className="top-0 left-0 size-full object-cover sm:absolute"
                        width={1200}
                        height={1200}
                      />

                      <div className="absolute inset-0 bg-linear-to-b from-[#161512]/60 to-[#161512]/90 opacity-0 duration-500 group-hover:opacity-100" />
                      <div className="absolute inset-0 translate-y-200 mask-[linear-gradient(to_top,rgba(0,0,0,1),rgba(0,0,0,0))] opacity-0 backdrop-blur-3xl duration-700 ease-in-out group-hover:translate-y-0 group-hover:opacity-100" />
                    </div>
                  </div>
                </AnimatedContent>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        <AnimatedContent
          delay={0.6}
          orientation="bottom"
          className="md:-translate-y-30"
        >
          <div className="flex items-center justify-between gap-2 px-6 sm:px-0">
            <CarouselNavigationDots dotClassName="bg-black/40" />
            <div className="space-x-4">
              <CarouselPrevious className="static size-11 translate-y-0 border-primary bg-primary" />
              <CarouselNext className="static size-11 translate-y-0 border-primary bg-primary" />
            </div>
          </div>
        </AnimatedContent>
      </Carousel>
    </section>
  )
}
