"use client"

import { AnimatedContent } from "@/components/animated/animated-content"
import { RevealText } from "@/components/animated/reveal-text"
import { HeroReserva } from "@/components/forms/hero-reserva"
import { useIsMobile } from "@/hooks/use-mobile"
import { m, useReducedMotion } from "motion/react"
import Image from "next/image"

export function Hero() {
  const isMobile = useIsMobile()
  const reduceMotion = useReducedMotion()
  const animateHero = !isMobile && !reduceMotion

  return (
    <>
      <section className="relative w-full min-w-0">
        <div className="relative z-20 container-screen-2xl py-4 sm:py-10 text-white lg:py-25">
          <div className="flex h-full flex-col pt-40 pb-0 md:pb-20">
            <RevealText
              as="h2"
              className="font-heading text-4xl leading-snug sm:text-5xl lg:text-8xl"
              text={`La forma más <primary>elegante</primary> \n de moverte por Alicante`}
              styles={{
                primary: "text-primary",
              }}
              delay={0.6}
            />

            <RevealText
              as="p"
              className="mt-6 text-sm text-balance text-white/80 sm:max-w-xl sm:text-xl"
              text={`Traslados, taxi al aeropuerto ALC, reservas por horas y rutas entre ciudades. Conductores profesionales, tarifa clara antes de subir y reserva desde la web, sin app.`}
              delay={1}
            />
          </div>
        </div>

        <m.div
          initial={animateHero ? { clipPath: "inset(50% 50% 50% 50% round 2rem)" } : false}
          animate={{ clipPath: "inset(0% 0% 0% 0% round 2rem)" }}
          transition={{ duration: animateHero ? 1.2 : 0, ease: [0.26, 0.66, 0, 0.98] }}
          className="pointer-events-none absolute inset-0 size-full overflow-clip rounded-4xl"
        >
          <m.div
            className="absolute inset-0"
            initial={animateHero ? { opacity: 0, scale: 1.08 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: animateHero ? 0.9 : 0 }}
          >
            <Image
              src="/images/hero_bg.webp"
              alt=""
              priority
              fill
              sizes="100vw"
              className="pointer-events-none object-cover select-none"
            />
          </m.div>

          <div className="absolute inset-0 bg-linear-to-r from-neutral-900 to-neutral-900/85" />
        </m.div>
      </section>
      <section className="relative z-10 container-screen-2xl mt-20 lg:-mt-40">
        <AnimatedContent delay={1} distance={120} duration={1.6} orientation="bottom" initialScale={.8} className="origin-bottom">
          <HeroReserva />
        </AnimatedContent>
      </section>
    </>
  )
}
