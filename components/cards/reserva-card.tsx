"use client"

import { RiArrowRightLine, RiMapPin2Line } from "@remixicon/react"

import { EstadoBadge } from "@/components/shared/estado-badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatearFecha, formatearMoneda } from "@/lib/formato"

type ReservaResumen = {
  id: string
  codigo: string
  estado: string
  tipo: string
  fechaProgramada: Date | null
  origenDireccion: string
  destinoDireccion: string
  tarifaEstimada: number | null
  createdAt: Date
  notas?: string | null
}

type ReservaCardProps = {
  reserva: ReservaResumen
  /** Nombre de la contraparte a mostrar (chofer para el cliente y viceversa). */
  contraparte?: { etiqueta: string; nombre: string } | null
  /** Acciones específicas del portal (botones, links). */
  acciones?: React.ReactNode
}

/** Card base de reserva, reutilizada por los tres portales. */
export function ReservaCard({ reserva, contraparte, acciones }: ReservaCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">{reserva.codigo}</span>
            <EstadoBadge estado={reserva.estado} />
          </div>
          <span className="text-xs text-muted-foreground">
            {reserva.tipo === "PROGRAMADA"
              ? `Programada: ${formatearFecha(reserva.fechaProgramada)}`
              : formatearFecha(reserva.createdAt)}
          </span>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <p className="flex items-start gap-1.5">
            <RiMapPin2Line className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span className="break-words">{reserva.origenDireccion}</span>
          </p>
          <p className="flex items-start gap-1.5">
            <RiArrowRightLine className="mt-0.5 size-4 shrink-0 text-red-600" />
            <span className="break-words">{reserva.destinoDireccion}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            {contraparte && (
              <span>
                {contraparte.etiqueta}: <strong>{contraparte.nombre}</strong>
                {" · "}
              </span>
            )}
            <span>Estimado: {formatearMoneda(reserva.tarifaEstimada)}</span>
          </div>
          {acciones && <div className="flex items-center gap-2">{acciones}</div>}
        </div>

        {reserva.notas && (
          <p className="rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            {reserva.notas}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
