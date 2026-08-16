/* eslint-disable @next/next/no-img-element */
"use client";
import { AnimatedContent } from "@/components/animated/animated-content";
import { RevealText } from "@/components/animated/reveal-text";
import {
  RiAccessibilityLine,
  RiArrowRightLine,
  RiBriefcaseLine,
  RiCalendar2Line,
  RiBankCardLine,
  RiBox3Line,
  RiPlaneLine,
} from "@remixicon/react";

const zonas = [
  "Alicante",
  "Benidorm",
  "Calpe",
  "Altea",
  "Denia",
  "Elche",
  "Santa Pola",
  "Villajoyosa",
  "El Campello",
  "Tabarca",
  "Guadalest",
  "Torrevieja",
];

export function Extended() {
  return (
    <section className="container-screen-2xl py-15 sm:py-30">
      <div className="flex flex-col items-start gap-4 mb-12 sm:mb-20">
        <AnimatedContent delay={0.1} orientation="bottom" distance={40}>
          <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm">
            Otros servicios
          </span>
        </AnimatedContent>
        <RevealText
          as="h2"
          className="text-3xl md:text-5xl max-w-4xl font-medium capitalize leading-tight"
          text={`Mucho Más Que\n<gold>Un Simple Taxi</gold>`}
          styles={{
            gold: "gradient-gold text-transparent bg-clip-text",
          }}
          delay={0.2}
        />
        <AnimatedContent delay={0.6} orientation="bottom">
          <p className="max-w-2xl opacity-80">
            Cubrimos toda la <strong>Costa Blanca</strong> con servicios
            adaptados a empresas, eventos, movilidad reducida y mensajería
            urgente.
          </p>
        </AnimatedContent>
      </div>

      <AnimatedContent
        delay={0.2}
        duration={1.4}
        orientation="bottom"
        initialScale={0.95}
        distance={60}
        className="grid grid-cols-2 lg:grid-cols-6 auto-rows-[minmax(180px,auto)] gap-3 sm:gap-4"
      >
        {/* Servicio empresarial — bloque grande con imagen */}
        <div className="col-span-2 lg:col-span-3 lg:row-span-2 relative rounded-4xl overflow-clip group">
          <img
            alt="Servicio empresarial Taxi Gold Alicante"
            src="/service-taxi.png"
            className="absolute inset-0 size-full object-cover scale-110 group-hover:scale-115 transition duration-700"
          />
          <div className="absolute inset-0 bg-linear-to-t from-neutral-900/95 via-neutral-900/40 to-transparent" />
          <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-end h-full min-h-80 text-white gap-3">
            <div className="flex items-center justify-center size-11 rounded-full bg-primary">
              <RiBriefcaseLine className="size-5 text-primary-foreground" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-medium">
              Cuentas empresariales
            </h3>
            <p className="opacity-80 text-sm max-w-md">
              Facturación mensual, traslados ejecutivos y servicio prioritario
              para empresas, hoteles y agencias en Alicante.
            </p>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 text-sm font-medium mt-2 group/link text-white"
            >
              Solicitar cuenta
              <RiArrowRightLine className="size-4 group-hover/link:translate-x-1 transition" />
            </a>
          </div>
        </div>

        {/* Zonas — chip cloud para SEO local */}
        <div className="col-span-2 lg:col-span-3 lg:row-span-2 rounded-4xl bg-card border border-border p-6 sm:p-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <RiPlaneLine className="size-7 text-primary" />
            <span className="text-xs uppercase tracking-widest opacity-60">
              Cobertura
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-medium">
            <span className="gradient-gold-2 text-transparent bg-clip-text">
              +12 destinos
            </span>{" "}
            en la Costa Blanca
          </h3>
          <p className="opacity-70 text-sm">
            Traslados directos desde y hacia los principales municipios y
            puntos turísticos de la provincia.
          </p>
          <ul className="flex flex-wrap gap-2 mt-2">
            {zonas.map((z) => (
              <li
                key={z}
                className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm"
              >
                {z}
              </li>
            ))}
          </ul>
        </div>

        {/* Bodas y eventos */}
        <div className="col-span-1 lg:col-span-2 rounded-4xl bg-card border border-border p-6 flex flex-col justify-between gap-3 hover:border-primary transition">
          <RiCalendar2Line className="size-8 text-primary" />
          <div>
            <h3 className="font-medium">Bodas y eventos</h3>
            <p className="opacity-70 text-sm mt-1">
              Flotas coordinadas con conductores uniformados.
            </p>
          </div>
        </div>

        {/* Movilidad reducida */}
        <div className="col-span-1 lg:col-span-2 rounded-4xl bg-card border border-border p-6 flex flex-col justify-between gap-3 hover:border-primary transition">
          <RiAccessibilityLine className="size-8 text-primary" />
          <div>
            <h3 className="font-medium">Vehículos adaptados</h3>
            <p className="opacity-70 text-sm mt-1">
              Rampa para personas con movilidad reducida.
            </p>
          </div>
        </div>

        {/* Mensajería */}
        <div className="col-span-2 lg:col-span-2 rounded-4xl bg-linear-to-br from-primary to-purple-700 text-primary-foreground p-6 flex flex-col justify-between gap-3">
          <RiBox3Line className="size-8" />
          <div>
            <h3 className="font-medium">Mensajería urgente</h3>
            <p className="opacity-80 text-sm mt-1">
              Llaves, documentos o paquetes en menos de 1 h dentro de la
              ciudad.
            </p>
          </div>
        </div>

        {/* Pago flexible — full width inferior */}
        <div className="col-span-2 lg:col-span-6 rounded-4xl bg-card border border-border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <RiBankCardLine className="size-8 text-primary shrink-0" />
            <div>
              <h3 className="font-medium">Paga como prefieras</h3>
              <p className="opacity-70 text-sm">
                Sin cargos ocultos. Recibes factura por cada trayecto.
              </p>
            </div>
          </div>
          <ul className="flex flex-wrap gap-2">
            {["Efectivo", "Tarjeta", "Bizum", "Transferencia", "Apple Pay"].map(
              (m) => (
                <li
                  key={m}
                  className="px-3 py-1.5 rounded-full border border-border text-sm"
                >
                  {m}
                </li>
              )
            )}
          </ul>
        </div>
      </AnimatedContent>
    </section>
  );
}
