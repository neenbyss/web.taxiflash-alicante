"use client"

import Link from "next/link"

import { ReservaCard } from "@/components/cards/reserva-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"

/** Viajes asignados al chofer. Cada tarjeta abre la página completa del viaje. */
export function MisViajes({ soloActivas }: { soloActivas: boolean }) {
  const viajes = trpc.reservas.misViajes.useQuery(
    { soloActivas },
    { refetchInterval: soloActivas ? 12_000 : false }
  )

  if (viajes.isLoading) return <Skeleton className="h-40 rounded-4xl" />

  if (!viajes.data?.length) {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
        {soloActivas ? "No tienes viajes activos." : "Aún no tienes viajes registrados."}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {viajes.data.map((reserva) => (
        <ReservaCard
          key={reserva.id}
          reserva={reserva}
          contraparte={{ etiqueta: "Cliente", nombre: reserva.nombreContacto }}
          acciones={
            <Button
              size="sm"
              render={<Link href={`/driver/trips/${reserva.id}`} />}
            >
              Ver viaje
            </Button>
          }
        />
      ))}
    </div>
  )
}
