"use client"

import Link from "next/link"

import { EstadoBadge } from "@/components/shared/estado-badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatearFecha, formatearKm, formatearMoneda } from "@/lib/formato"
import { trpc } from "@/lib/trpc"

/** Vista pública del estado de una reserva, consultada por código. */
export function EstadoReservaPublico({ codigo }: { codigo: string }) {
  const consulta = trpc.reservas.consultarPorCodigo.useQuery(
    { codigo },
    { refetchInterval: 30_000, retry: false }
  )

  if (consulta.isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />

  if (consulta.error || !consulta.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reserva no encontrada</CardTitle>
          <CardDescription>
            Revisa que el código sea correcto.{" "}
            <Link href="/reserva" className="underline underline-offset-4">
              Volver a intentar
            </Link>
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const reserva = consulta.data
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Reserva {reserva.codigo}</CardTitle>
          <EstadoBadge estado={reserva.estado} />
        </div>
        <CardDescription>
          Solicitada el {formatearFecha(reserva.createdAt)}
          {reserva.tipo === "PROGRAMADA" &&
            ` · programada para ${formatearFecha(reserva.fechaProgramada)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground uppercase">Origen</p>
          <p>{reserva.origenDireccion}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Destino</p>
          <p>{reserva.destinoDireccion}</p>
        </div>
        <Separator />
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <span>
            Distancia: <strong>{formatearKm(reserva.distanciaKm)}</strong>
          </span>
          <span>
            Tarifa estimada:{" "}
            <strong>{formatearMoneda(reserva.tarifaEstimada)}</strong>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          La tarifa es aproximada; el cobro real es por taxímetro.
        </p>
        {reserva.chofer && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground uppercase">Tu chofer</p>
              <p className="font-medium">{reserva.chofer.name}</p>
              {reserva.chofer.telefono && <p>{reserva.chofer.telefono}</p>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
