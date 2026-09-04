import { AnimatedContent } from "@/components/animated/animated-content"
import { RevealText } from "@/components/animated/reveal-text"
import { Button } from "@/components/ui/button"
import {
  RiArrowRightLine,
  RiHourglassFill,
  RiShieldFill,
  RiStarFill,
} from "@/components/icons"

import Image from "next/image"

export function Info() {
  return (
    <section className="rounded-3xl bg-inner-background text-inner-foreground sm:rounded-4xl">
      <div className="container-screen-2xl py-3 sm:py-32 lg:py-56">
        <div className="mb-6 md:mb-12 flex flex-col items-start gap-5 sm:mb-20 sm:flex-row sm:items-center sm:justify-between">
          <RevealText
            as="h2"
            className="mb-8 sm:mb-12 mt-8 sm:mt-0 font-heading text-3xl leading-snug sm:text-7xl"
            text={`Viaja con nosotros`}
          />

          <AnimatedContent delay={0.6} orientation="left">
            <Button variant="inner" className="hidden lg:flex">
              Explorar estaciones
              <RiArrowRightLine />
            </Button>
          </AnimatedContent>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_.7fr] lg:gap-12">
          <AnimatedContent
            delay={0.4}
            duration={1.6}
            initialScale={0.8}
            orientation="right"
            distance={200}
            className="relative min-h-105 origin-bottom-right overflow-clip rounded-3xl sm:min-h-130 lg:h-150"
          >
            <div className="relative z-10 flex h-full flex-col items-start justify-end gap-4 p-5 sm:flex-row sm:items-end sm:justify-between xl:p-8">
              <h3 className="max-w-xl text-2xl font-medium text-balance sm:text-4xl">
                {" "}
                Una forma mejor de moverte por Alicante.{" "}
              </h3>

              <span className="flex items-center gap-3 rounded-lg bg-card p-4">
                <RiStarFill className="size-10! text-primary" />
                <span>
                  <span className="block text-4xl font-semibold text-foreground!">
                    {" "}
                    4.8{" "}
                  </span>
                  <p className="text-nowrap text-foreground">
                    {" "}
                    Gran puntualidad{" "}
                  </p>
                </span>
              </span>
            </div>

            <Image
              alt="BG"
              src={"/images/service-taxi.png"}
              className="absolute top-0 left-0 size-full object-cover"
              width={1200}
              height={1200}
            />

            <div className="absolute inset-0 bg-inner-background/60" />
            <div className="absolute inset-0 mask-[linear-gradient(to_top,rgba(0,0,0,1),rgba(0,0,0,0))] backdrop-blur-sm" />
          </AnimatedContent>

          <div className="py-4 flex flex-col">
            <div className="mb-8 grid grid-cols-1 gap-6 px-1 sm:grid-cols-2 sm:px-6 lg:mb-12">
              <AnimatedContent
                delay={0.6}
                duration={1.6}
                initialScale={0.8}
                orientation="right"
                distance={200}
              >
                <h3 className="mb-3 flex items-center gap-3 text-xl text-primary">
                  <span className="flex size-10 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <RiHourglassFill />
                  </span>
                  Rapidéz
                </h3>
                <p className="text-balance opacity-80">
                  {" "}
                  Confirmación y asignación en minutos{" "}
                </p>
              </AnimatedContent>
              <AnimatedContent
                delay={0.8}
                duration={1.6}
                initialScale={0.8}
                orientation="right"
                distance={200}
              >
                <h3 className="mb-3 flex items-center gap-3 text-xl text-primary">
                  <span className="flex size-10 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <RiShieldFill />
                  </span>
                  Seguro
                </h3>
                <p className="text-balance opacity-80">
                  {" "}
                  Conductores verificados y trayecto con seguimiento{" "}
                </p>
              </AnimatedContent>
            </div>

            <AnimatedContent
              delay={1}
              duration={1.6}
              initialScale={0.8}
              orientation="right"
              distance={200}
              className="relative min-h-80 grow origin-bottom-right overflow-clip rounded-3xl"
            >
              <Image
                alt="BG"
                src={"/images/service-taxi.png"}
                className="absolute top-0 left-0 size-full object-cover"
                width={1200}
                height={1200}
              />
            </AnimatedContent>
          </div>
        </div>

        <AnimatedContent delay={0.6} orientation="bottom">
            <Button variant="inner" className="flex lg:hidden ">
              Explorar estaciones
              <RiArrowRightLine />
            </Button>
          </AnimatedContent>
      </div>
    </section>
  )
}
