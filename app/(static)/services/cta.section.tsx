/* eslint-disable @next/next/no-img-element */
"use client";
import { AnimatedContent } from "@/components/animated/animated-content";
import { RevealText } from "@/components/animated/reveal-text";
import { MessageIcon } from "@/components/icons/message";
import { Button } from "@/components/ui/button";
import { RiPhoneLine } from "@remixicon/react";
import { motion } from "motion/react";

export function Cta() {
  return (
    <section className="relative md:rounded-4xl bg-cover overflow-clip">
      <div className="relative z-10 container-screen-2xl py-24 sm:py-40 flex flex-col items-center text-center gap-6">
        <RevealText
          as="h2"
          className="text-3xl sm:text-5xl lg:text-6xl max-w-4xl font-medium text-white capitalize leading-tight"
          text={`¿Listo Para\n<gold>Tu Próximo Viaje</gold>?`}
          styles={{
            gold: "gradient-gold text-transparent bg-clip-text",
          }}
          delay={0.2}
        />
        <AnimatedContent delay={0.6} orientation="bottom">
          <p className="text-white/80 max-w-xl text-balance text-sm sm:text-lg">
            Reserva ahora y descubre por qué cientos de viajeros confían cada
            día en Taxi Gold Alicante. Atención inmediata, sin esperas.
          </p>
        </AnimatedContent>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <AnimatedContent scroll={false} delay={1} orientation="bottom">
            <Button className="pl-4 pr-1 shadow-[0_0px_50px_0px] shadow-primary/40 flex">
              Reservar Ahora
              <div className="bg-white p-2 rounded-full text-neutral-700">
                <MessageIcon />
              </div>
            </Button>
          </AnimatedContent>
          <AnimatedContent scroll={false} delay={1.2} orientation="bottom">
            <Button
              variant="outline"
              className="bg-transparent border-2 text-white hover:text-white"
            >
              Llamar Ahora
              <RiPhoneLine />
            </Button>
          </AnimatedContent>
        </div>
      </div>

      <motion.div
        initial={{ clipPath: "inset(50% 50% 50% 50% round 2rem)" }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0% round 2rem)" }}
        transition={{
          duration: 2.5,
          ease: [0.26, 0.66, 0, 0.98],
        }}
        viewport={{ once: true }}
        className="absolute inset-0 rounded-4xl overflow-clip pointer-events-none"
      >
        <motion.img
          src="/alicante.png"
          alt="alicante_bg"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-full object-cover select-none pointer-events-none scale-110"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true, margin: "-20%" }}
        />

        <div className="absolute inset-0 bg-linear-to-t from-neutral-900/95 via-neutral-900/70 to-neutral-900/50" />
      </motion.div>
    </section>
  );
}
