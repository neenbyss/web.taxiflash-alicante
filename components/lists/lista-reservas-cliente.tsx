"use client"

import Link from "next/link"

import { ReservaCard } from "@/components/cards/reserva-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"

/** Listado de reservas del cliente autenticado (activas o historial). */
export function ListaReservasCliente({ soloActivas }: { soloActivas: boolean }) {
  const reservas = trpc.reservas.mias.useQuery(
    { soloActivas },
    { refetchInterval: soloActivas ? 15_000 : false }
  )

  if (reservas.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-36 rounded-4xl" />
        <Skeleton className="h-36 rounded-4xl" />
      </div>
    )
  }

  if (!reservas.data?.length) {
    return (
      <div className="rounded-3xl bg-card px-6 py-14 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
          {soloActivas
            ? "No tienes reservas activas ahora mismo."
            : "Todavía no has hecho ninguna reserva."}
        </p>
        <Button className="mt-4" render={<Link href="/customer/book" />}>
          Reservar un taxi
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {reservas.data.map((reserva) => (
        <ReservaCard
          key={reserva.id}
          reserva={reserva}
          contraparte={
            reserva.chofer ? { etiqueta: "Chofer", nombre: reserva.chofer.name } : null
          }
          acciones={
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/customer/bookings/${reserva.id}`} />}
            >
              Ver detalle
            </Button>
          }
        />
      ))}
    </div>
  )
}
