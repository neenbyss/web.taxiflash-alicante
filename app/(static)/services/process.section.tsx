"use client";
import { AnimatedContent } from "@/components/animated/animated-content";
import { RevealText } from "@/components/animated/reveal-text";
import { Button } from "@/components/ui/button";
import {
  RiCarLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiMapPin2Line,
  RiPhoneLine,
  RiShieldCheckLine,
  RiStarFill,
} from "@remixicon/react";

const steps = [
  { icon: RiPhoneLine, label: "Reserva" },
  { icon: RiCheckboxCircleLine, label: "Confirmamos" },
  { icon: RiCarLine, label: "En camino" },
  { icon: RiMapPin2Line, label: "Llegas" },
];

export function Process() {
  return (
    <section className="container-screen-2xl py-15 sm:py-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-20">
        <RevealText
          as="h2"
          className="text-3xl md:text-5xl max-w-3xl font-medium capitalize leading-tight"
          text={`Cómo <gold>Funciona</gold>\nNuestro <gold>Servicio</gold>`}
          styles={{
            gold: "gradient-gold text-transparent bg-clip-text",
          }}
          delay={0.2}
        />
        <AnimatedContent delay={0.6} orientation="right">
          <p className="max-w-md opacity-80">
            Reservar un taxi en Alicante con nosotros es inmediato. Cuatro
            pasos, cero esperas, tarifa cerrada de inicio a fin.
          </p>
        </AnimatedContent>
      </div>

      <AnimatedContent
        delay={0.3}
        duration={1.4}
        orientation="bottom"
        initialScale={0.95}
        distance={60}
        className="grid grid-cols-2 lg:grid-cols-6 auto-rows-[minmax(180px,auto)] gap-3 sm:gap-4"
      >
        {/* Timeline 4 pasos — bloque grande */}
        <div className="col-span-2 lg:col-span-4 lg:row-span-2 relative rounded-4xl bg-card border border-border p-6 sm:p-10 overflow-clip flex flex-col justify-between gap-8">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs uppercase tracking-widest opacity-60">
              Proceso de reserva
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
            <div className="absolute top-6 sm:top-7 left-[12.5%] right-[12.5%] h-px bg-linear-to-r from-primary/0 via-primary/60 to-primary/0" />
            {steps.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 text-center relative z-10"
              >
                <div className="flex items-center justify-center size-12 sm:size-14 rounded-full bg-primary text-primary-foreground ring-4 ring-card">
                  <Icon className="size-5 sm:size-6" />
                </div>
                <div>
                  <span className="block text-xs opacity-60">
                    Paso {i + 1}
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="opacity-70 text-sm max-w-md">
            Sin registros, sin tarjetas guardadas, sin sorpresas en el precio.
            Reserva en menos de 30 segundos.
          </p>
        </div>

        {/* Stat: tiempo de respuesta */}
        <div className="col-span-1 lg:col-span-2 relative rounded-4xl bg-linear-to-br from-primary to-purple-700 text-primary-foreground p-6 overflow-clip flex flex-col justify-between">
          <RiTimeLine className="size-8 opacity-80" />
          <div>
            <span className="block text-5xl sm:text-6xl font-medium leading-none">
              &lt; 3<span className="text-2xl"> min</span>
            </span>
            <span className="block text-sm opacity-80 mt-2">
              Tiempo medio de respuesta
            </span>
          </div>
        </div>

        {/* CTA llamada directa */}
        <div className="col-span-1 lg:col-span-2 relative rounded-4xl bg-card border border-border p-6 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <RiPhoneLine className="size-7 text-primary" />
            <span className="text-xs uppercase tracking-widest opacity-60">
              24/7
            </span>
          </div>
          <div>
            <span className="block text-xs opacity-60 mb-1">
              Llama ahora mismo
            </span>
            <a
              href="tel:613951973"
              className="block text-2xl sm:text-3xl font-medium hover:text-primary transition"
            >
              613 951 973
            </a>
          </div>
          <Button size="sm" className="w-full">
            Reservar por teléfono
          </Button>
        </div>

        {/* Badge tarifa cerrada */}
        <div className="col-span-2 lg:col-span-3 rounded-4xl bg-card border border-border p-6 flex items-center gap-4">
          <RiShieldCheckLine className="size-10 text-primary shrink-0" />
          <div>
            <h3 className="font-medium">Tarifa cerrada antes de salir</h3>
            <p className="opacity-70 text-sm">
              El precio que ves es el precio que pagas. Sin recargos por tráfico
              ni por horario nocturno cuando reservas con antelación.
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="col-span-2 lg:col-span-3 rounded-4xl bg-card border border-border p-6 flex items-center gap-5">
          <div className="flex flex-col items-center justify-center bg-amber-500/15 rounded-3xl p-4 min-w-20">
            <span className="text-3xl font-medium text-amber-500">5.0</span>
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <RiStarFill
                  key={i}
                  className="size-3 text-amber-500 fill-amber-500"
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium">+1.200 viajes con valoración 5★</h3>
            <p className="opacity-70 text-sm">
              Conductores con licencia oficial y formación continua.
            </p>
          </div>
        </div>
      </AnimatedContent>
    </section>
  );
}
