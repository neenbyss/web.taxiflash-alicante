import {
  RiArrowRightLine,
  RiCarLine,
  RiRoadMapLine,
  RiTaxiLine,
  RiUser3Line,
} from "@/components/icons"
import Link from "next/link"

import { ListaReservasCliente } from "@/components/lists/lista-reservas-cliente"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/server/session"

export const metadata = { title: "Mi portal" }

const ACCESOS = [
  {
    href: "/customer/bookings",
    label: "Mis reservas",
    descripcion: "Historial y estado de tus viajes",
    icono: RiRoadMapLine,
  },
  {
    href: "/customer/rentals",
    label: "Alquileres",
    descripcion: "Viajes entre ciudades o por horas",
    icono: RiCarLine,
  },
  {
    href: "/customer/profile",
    label: "Mi perfil",
    descripcion: "Teléfono, dirección y preferencias",
    icono: RiUser3Line,
  },
]

export default async function ClienteDashboardPage() {
  const session = await requireRole("CLIENTE")
  const nombre = session.user.name.split(" ")[0]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Banner principal (bento: 2 columnas) */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary to-primary/85 p-8 text-primary-foreground lg:col-span-2">
        <p className="text-sm font-medium tracking-wide uppercase opacity-80">
          Portal de clientes
        </p>
        <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">
          Hola {nombre}, ¿a dónde
          <br />
          vamos hoy?
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="gap-3 pr-2"
            render={<Link href="/customer/book" />}
          >
            Reservar taxi
            <span className="flex size-8 items-center justify-center rounded-md bg-secondary-foreground text-foreground">
              <RiArrowRightLine className="size-4" aria-hidden />
            </span>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            render={<Link href="/customer/rentals/new" />}
          >
            Alquiler entre ciudades
          </Button>
        </div>
        <RiTaxiLine
          className="absolute -right-6 -bottom-6 size-40 opacity-15"
          aria-hidden
        />
      </div>

      {/* Accesos rápidos (bento: 1 columna) */}
      <div className="flex flex-col gap-4">
        {ACCESOS.map((acceso) => (
          <Link
            key={acceso.href}
            href={acceso.href}
            className="group flex flex-1 items-center gap-4 rounded-3xl bg-card p-5 transition-colors hover:bg-primary/10"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <acceso.icono className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-medium">{acceso.label}</span>
              <span className="block truncate text-sm text-muted-foreground">
                {acceso.descripcion}
              </span>
            </span>
            <RiArrowRightLine
              className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        ))}
      </div>

      {/* Viajes activos (bento: fila completa) */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Tus viajes activos</CardTitle>
          <CardDescription>
            Reservas pendientes, aceptadas o en curso. Haz click para ver el
            detalle, el mapa y el chat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListaReservasCliente soloActivas />
        </CardContent>
      </Card>
    </div>
  )
}
