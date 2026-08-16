"use client"

import { EstadoBadge } from "@/components/shared/estado-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatearFecha, formatearMoneda } from "@/lib/formato"
import { trpc } from "@/lib/trpc"

/** Solicitudes de alquiler entre ciudades del cliente autenticado. */
export function ListaAlquileresCliente() {
  const alquileres = trpc.alquiler.mios.useQuery(undefined, {
    refetchInterval: 30_000,
  })

  if (alquileres.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-28 rounded-4xl" />
        <Skeleton className="h-28 rounded-4xl" />
      </div>
    )
  }

  if (!alquileres.data?.length) {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No tienes solicitudes de alquiler todavía.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {alquileres.data.map((alquiler) => (
        <Card key={alquiler.id}>
          <CardContent className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">
                  {alquiler.codigo}
                </span>
                <EstadoBadge estado={alquiler.estado} />
              </div>
              <span className="text-xs text-muted-foreground">
                {formatearFecha(alquiler.fecha)}
              </span>
            </div>
            <p className="text-sm">
              {alquiler.ciudadOrigen} → {alquiler.ciudadDestino}
              <span className="text-muted-foreground">
                {" "}
                ·{" "}
                {alquiler.modalidad === "por_horas"
                  ? `por horas (${alquiler.horas ?? "?"}h)`
                  : "interurbano"}
              </span>
            </p>
            <p className="text-sm">
              {alquiler.estado === "A_CONFIRMAR" ? (
                <span className="text-muted-foreground">
                  Precio pendiente de confirmación manual.
                </span>
              ) : alquiler.precioConfirmado != null ? (
                <>
                  Precio confirmado:{" "}
                  <strong>{formatearMoneda(alquiler.precioConfirmado)}</strong>
                </>
              ) : null}
              {alquiler.chofer && (
                <span className="text-muted-foreground">
                  {" "}
                  · Chofer: {alquiler.chofer.name}
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
