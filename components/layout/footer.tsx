import { RiArrowRightLine } from "@remixicon/react"
import Link from "next/link"
import Image from "next/image"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

const NAVEGACION = [
  { href: "/", label: "Inicio" },
  { href: "/services", label: "Servicios" },
  { href: "/ubicaciones", label: "Estaciones" },
  { href: "/contacto", label: "Contáctanos" },
  { href: "/register", label: "Reservas" },
]

const LEGAL = [
  { href: "/contacto", label: "Términos y condiciones" },
  { href: "/contacto", label: "Políticas de privacidad" },
  { href: "/choferes", label: "Portal de choferes" },
]

export function Footer() {
  return (
    <>
      <section className="relative z-10 container-screen-2xl -mb-40">
        <div className="relative gap-6 overflow-hidden rounded-4xl px-12 py-18 text-primary-foreground sm:p-12">
          <div className="relative z-20 flex flex-col items-start justify-between sm:flex-row sm:items-end">
            <h2 className="font-heading text-3xl leading-tight sm:text-6xl">
              ¿Listo para tu
              <br />
              siguiente viaje?
            </h2>
            <Button
              variant="secondary"
              size="lg"
              className="gap-5 pr-2 pl-5 text-base"
              render={<Link href="/" />}
            >
              Reserva Ahora
              <span className="flex size-10 flex-col items-center justify-center rounded-sm bg-secondary-foreground text-foreground">
                <RiArrowRightLine aria-hidden />
              </span>
            </Button>
          </div>

          <div className="absolute inset-0 size-full bg-linear-to-r from-primary to-primary/90 z-10" />
          <Image src="/images/service-taxi.png" alt="TAXI" width={1200} height={1200} className="absolute inset-0 size-full object-cover object-bottom" />
        </div>
      </section>

      <footer className="lg:p-2">
        <div className="rounded-4xl bg-[#161512] text-secondary-foreground">
          <div className="container-screen-2xl pt-54 pb-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <Logo href="/" size="lg" className="text-secondary-foreground" />
                <p className="mt-3 max-w-xs text-secondary-foreground/70">
                  Reservas de taxi en Alicante y alrededores, desde la web. Taxi
                  inmediato, programado, al aeropuerto ALC y entre ciudades.
                </p>
                <div className="mt-12 flex gap-18">
                  <div>
                    <p className="text-xl font-medium">Teléfono</p>
                    <a
                      href="tel:+34631288429"
                      className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground"
                    >
                      +34 631 28 84 29
                    </a>
                  </div>
                  <div>
                    <p className="text-xl font-medium">Email</p>
                    <a
                      href="mailto:support@taxiflash.com"
                      className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground"
                    >
                      support@taxiflash.com
                    </a>
                  </div>
                </div>
              </div>

              <nav aria-label="Navegación">
                <p className="mb-8 font-heading text-lg text-primary">
                  Navegación
                </p>
                <ul className="flex flex-col gap-4">
                  {NAVEGACION.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-secondary-foreground/70 uppercase transition hover:text-secondary-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Legal">
                <p className="mb-6 font-heading text-lg text-primary">Legal</p>
                <ul className="flex flex-col gap-4">
                  {LEGAL.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-secondary-foreground/70 uppercase transition hover:text-secondary-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="mt-12 pt-18 pb-4 text-center text-secondary-foreground/50">
              © {new Date().getFullYear()} TaxiFlash — Taxi Alicante. Todos los
              derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
