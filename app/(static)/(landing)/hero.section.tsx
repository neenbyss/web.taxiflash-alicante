"use client"
import { AnimatedContent } from "@/components/animated/animated-content"
import { RevealText } from "@/components/animated/reveal-text"
import { HeroReserva } from "@/components/forms/hero-reserva"
import { motion } from "motion/react"

export function Hero() {
  return (
    <>
      <section className="relative">
        <div className="relative z-20 container-screen-2xl py-10 text-white lg:py-25">
          <div className="flex h-full flex-col pt-40 pb-20">
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

        <motion.div
          initial={{ clipPath: "inset(50% 50% 50% 50% round 2rem)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0% round 2rem)" }}
          transition={{
            duration: 2.5,
            ease: [0.26, 0.66, 0, 0.98],
          }}
          className="pointer-events-none absolute inset-0 overflow-clip rounded-4xl"
        >
          <motion.img
            src="/images/hero_bg.webp"
            alt=""
            className="pointer-events-none absolute top-1/2 left-1/2 size-full -translate-x-1/2 -translate-y-1/2 scale-110 object-cover select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          />

          <div className="absolute inset-0 bg-linear-to-r from-neutral-900 to-neutral-900/85" />
        </motion.div>
      </section>
      <section className="relative z-10 container-screen-2xl -mt-40">
        <AnimatedContent delay={1} distance={120} duration={1.6} orientation="bottom" initialScale={.8} className="origin-bottom">
          <HeroReserva />
        </AnimatedContent>
      </section>
    </>
  )
}
