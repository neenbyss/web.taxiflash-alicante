/* eslint-disable @next/next/no-img-element */
"use client";
import { AnimatedContent } from "@/components/animated/animated-content";
import { RevealText } from "@/components/animated/reveal-text";
import { HailTaxiIcon } from "@/components/icons/hail-taxi";
import { TaxiIcon } from "@/components/icons/taxi";
import { TaxiAirportIcon } from "@/components/icons/taxi-airport";
import { Button } from "@/components/ui/button";
import { RiArrowRightLine } from "@/components/icons";

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
];

export function Services() {
  return (
    <section className="container-screen-2xl py-15 sm:py-30">
      <div className="flex justify-between items-end gap-4">
        <RevealText
          as="h2"
          className="text-3xl md:text-6xl max-w-4xl font-heading leading-normal"
          text={`<primary>Servicios</primary> De Taxi\nPara Todos <primary>Tus Viajes</primary>`}
          styles={{
            primary: "text-primary",
          }}
          delay={0.2}
        />
        <AnimatedContent delay={1.5} orientation="left">
          <Button size="lg" className="hidden sm:flex" variant="secondary">
            Otros Servicios
            <RiArrowRightLine />
          </Button>
        </AnimatedContent>
      </div>

      <div className="flex flex-col lg:grid grid-cols-3 gap-4 mt-8 sm:mt-20 mb-12 sm:mb-0">
        {services.map(({ title, description, icon: Icon, image }, i) => {
          return (
            <AnimatedContent delay={0.6 + i * 0.02} duration={1.6} initialScale={.8} key={i} orientation="right" distance={200} className="relative rounded-3xl overflow-clip origin-bottom-right">
              <div className="relative z-10 p-2 xl:p-4 flex flex-col h-full">
                <div className="h-50 lg:h-100" />
                <div className="p-2 sm:p-4 bg-card/90 text-card-foreground rounded-xl backdrop-blur-sm grow">
                  <h3 className="flex items-center gap-2 text-lg sm:text-xl capitalize font-medium">
                    <div className="flex flex-col items-center justify-center size-7 sm:size-10 bg-primary rounded-full">
                      {" "}
                      <Icon className="size-4 sm:size-5 text-primary-foreground" />{" "}
                    </div>
                    {title}
                  </h3>
                  <p className="opacity-80 px-4 mt-2">{description}</p>
                </div>
              </div>

              <img
                alt="BG"
                src={image}
                className="absolute size-full top-0 left-0 object-cover"
              />
            </AnimatedContent>
          );
        })}
      </div>

      <AnimatedContent delay={0.2} orientation="bottom" className="sm:hidden">
        <Button className="w-full" variant="secondary">
          Otros Servicios
          <RiArrowRightLine />
        </Button>
      </AnimatedContent>
    </section>
  );
}

