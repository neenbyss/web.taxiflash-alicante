import { RiSteering2Line } from "@/components/icons"

import { MisViajes } from "@/components/lists/mis-viajes"
import { ReservasPendientes } from "@/components/lists/reservas-pendientes"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireRole } from "@/server/session"

export const metadata = { title: "Tablero de chofer" }

export default async function ChoferDashboardPage() {
  const session = await requireRole("CHOFER")
  const nombre = session.user.name.split(" ")[0]

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* Banner (bento: fila completa) */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary to-primary/85 p-8 text-primary-foreground xl:col-span-2">
        <p className="text-sm font-medium tracking-wide uppercase opacity-80">
          Portal de choferes
        </p>
        <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">
          Buen viaje, {nombre}
        </h1>
        <p className="mt-2 max-w-xl opacity-90">
          Gestiona tus viajes en marcha y toma nuevas reservas pendientes.
        </p>
        <RiSteering2Line
          className="absolute -right-6 -bottom-6 size-40 opacity-15"
          aria-hidden
        />
      </div>

      {/* Viajes activos */}
      <Card>
        <CardHeader>
          <CardTitle>Mis viajes activos</CardTitle>
          <CardDescription>
            Aceptados o en curso. Entra al viaje para marcar tu llegada,
            iniciar o finalizar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MisViajes soloActivas />
        </CardContent>
      </Card>

      {/* Pendientes para tomar */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas pendientes</CardTitle>
          <CardDescription>
            Disponibles para cualquier chofer: el primero en aceptar se la
            queda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReservasPendientes />
        </CardContent>
      </Card>
    </div>
  )
}
