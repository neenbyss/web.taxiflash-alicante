/* eslint-disable @next/next/no-img-element */
"use client";
import { AnimatedContent } from "@/components/animated/animated-content";
import { RevealText } from "@/components/animated/reveal-text";
import { HailTaxiIcon } from "@/components/icons/hail-taxi";
import { TaxiIcon } from "@/components/icons/taxi";
import { TaxiAirportIcon } from "@/components/icons/taxi-airport";
import { RiCheckLine } from "@remixicon/react";

const featured = [
  {
    id: "airport-transfer",
    icon: TaxiAirportIcon,
    title: "Transporte al aeropuerto",
    description:
      "Llega a tiempo a tu vuelo o recibe a tus invitados sin estrés. Servicio puerta a puerta al aeropuerto de Alicante–Elche con seguimiento de vuelo y espera gratuita.",
    image: "/service-aeropuerto.png",
    features: [
      "Seguimiento de vuelo en tiempo real",
      "Espera gratuita hasta 60 min",
      "Vehículos amplios para equipaje",
      "Tarifa cerrada sin sorpresas",
    ],
  },
  {
    id: "urban-taxi",
    icon: TaxiIcon,
    title: "Taxi urbano en Alicante",
    description:
      "Desplazamientos rápidos por la ciudad las 24 horas del día. Reserva inmediata, conductores locales y rutas optimizadas para que llegues antes y mejor.",
    image: "/service-taxi.png",
    features: [
      "Disponible 24/7 los 365 días",
      "Pago en efectivo o tarjeta",
      "Conductores con experiencia",
      "Tarifas oficiales reguladas",
    ],
  },
  {
    id: "tourist-transfer",
    icon: HailTaxiIcon,
    title: "Traslados turísticos",
    description:
      "Descubre Alicante y la Costa Blanca con un conductor local. Rutas guiadas a Santa Bárbara, Tabarca, Guadalest, Calpe y mucho más, a tu ritmo.",
    image: "/service-turismo.png",
    features: [
      "Rutas personalizadas",
      "Conductor con conocimiento local",
      "Paradas a tu ritmo",
      "Vehículos cómodos para grupos",
    ],
  },
];

export function Featured() {
  return (
    <section className="container-screen-2xl py-15 sm:py-30">
      <div className="flex flex-col items-start gap-4 mb-12 sm:mb-20">
        <AnimatedContent delay={0.1} orientation="bottom" distance={40}>
          <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm">
            Servicios destacados
          </span>
        </AnimatedContent>
        <RevealText
          as="h2"
          className="text-3xl md:text-5xl max-w-4xl font-medium capitalize leading-tight"
          text={`<gold>Movilidad Premium</gold>\nAdaptada A <gold>Cada Necesidad</gold>`}
          styles={{
            gold: "gradient-gold text-transparent bg-clip-text",
          }}
          delay={0.2}
        />
        <AnimatedContent delay={0.6} orientation="bottom">
          <p className="max-w-2xl opacity-80">
            Llevamos más de una década moviendo Alicante con un único objetivo:
            ofrecer un servicio puntual, seguro y cómodo para cualquier
            situación, desde un trayecto urbano hasta una ruta turística por la
            Costa Blanca.
          </p>
        </AnimatedContent>
      </div>

      <div className="flex flex-col gap-12 sm:gap-24">
        {featured.map(
          ({ title, description, icon: Icon, image, features, id }, i) => {
            const reverse = i % 2 === 1;
            return (
              <div
                key={id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                  reverse ? "lg:*:first:order-2" : ""
                }`}
              >
                <AnimatedContent
                  delay={0.2}
                  duration={1.6}
                  initialScale={0.9}
                  orientation={reverse ? "right" : "left"}
                  distance={120}
                  className="relative rounded-4xl overflow-clip aspect-4/5 sm:aspect-5/4"
                >
                  <img
                    alt={title}
                    src={image}
                    className="absolute size-full top-0 left-0 object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-neutral-900/70 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-3 bg-card/90 text-card-foreground rounded-3xl backdrop-blur-sm p-3 w-fit">
                      <div className="flex flex-col items-center justify-center size-12 bg-primary rounded-full">
                        <Icon className="size-6 text-primary-foreground" />
                      </div>
                      <span className="pr-3 font-medium capitalize">
                        {title}
                      </span>
                    </div>
                  </div>
                </AnimatedContent>

                <div className="flex flex-col gap-5">
                  <RevealText
                    as="h3"
                    className="text-2xl sm:text-4xl font-medium capitalize leading-tight"
                    text={title}
                    delay={0.2}
                  />
                  <AnimatedContent delay={0.4} orientation="bottom">
                    <p className="opacity-80 text-balance">{description}</p>
                  </AnimatedContent>
                  <AnimatedContent
                    delay={0.5}
                    duration={1.2}
                    orientation="left"
                    distance={50}
                  >
                    <ul className="flex flex-col gap-3 mt-2">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-3">
                          <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary shrink-0">
                            <RiCheckLine className="size-4" />
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </AnimatedContent>
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}
