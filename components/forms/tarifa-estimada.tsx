"use client"

import { RiInformationLine } from "@remixicon/react"

import { Skeleton } from "@/components/ui/skeleton"
import { formatearKm, formatearMoneda } from "@/lib/formato"
import { trpc } from "@/lib/trpc"
import { useReservaBorrador } from "@/stores/reserva-borrador"

/**
 * Tarifa estimada según los puntos fijados (calculada en el servidor).
 * Aviso permanente: es aproximada, el cobro real es por taxímetro.
 */
export function TarifaEstimada() {
  const { origen, destino, paradas } = useReservaBorrador()

  const puntos = [
    ...(origen ? [{ lat: origen.lat, lng: origen.lng }] : []),
    ...paradas.filter((p) => p !== null).map((p) => ({ lat: p.lat, lng: p.lng })),
    ...(destino ? [{ lat: destino.lat, lng: destino.lng }] : []),
  ]
  const completa = Boolean(origen && destino)

  const estimacion = trpc.reservas.estimarTarifa.useQuery(
    { puntos },
    { enabled: completa, staleTime: 30_000 }
  )

  if (!completa) return null

  return (
    <div className="rounded-2xl border bg-muted/40 px-4 py-3 text-sm">
      {estimacion.isLoading ? (
        <Skeleton className="h-5 w-48" />
      ) : estimacion.data ? (
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span>
            Distancia aproximada:{" "}
            <strong>{formatearKm(estimacion.data.distanciaKm)}</strong>
          </span>
          <span>
            Tarifa estimada:{" "}
            <strong className="text-base">
              {formatearMoneda(estimacion.data.tarifaEstimada)}
            </strong>
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground">
          No se pudo calcular la estimación.
        </span>
      )}
      <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
        <RiInformationLine className="mt-0.5 size-3.5 shrink-0" />
        Importe aproximado según la distancia de la ruta. El cobro real se hace
        por taxímetro al finalizar el viaje.
      </p>
    </div>
  )
}
