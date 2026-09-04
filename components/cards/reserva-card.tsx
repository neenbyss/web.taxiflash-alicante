"use client"

import { RiArrowRightLine, RiMapPin2Line } from "@/components/icons"

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
    <Card className="transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgb(30_29_26/10%)]">
      <CardContent className="flex flex-col gap-4">
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

        <div className="relative flex flex-col gap-3 rounded-2xl bg-muted/45 p-3 text-sm before:absolute before:top-7 before:bottom-7 before:left-[1.17rem] before:w-px before:bg-foreground/12">
          <p className="relative flex items-start gap-2.5">
            <span className="z-10 grid size-6 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white"><RiMapPin2Line className="size-3.5" /></span>
            <span className="break-words">{reserva.origenDireccion}</span>
          </p>
          <p className="relative flex items-start gap-2.5">
            <span className="z-10 grid size-6 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground"><RiArrowRightLine className="size-3.5" /></span>
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
          {acciones && <div className="flex w-full items-center justify-end gap-2 sm:w-auto">{acciones}</div>}
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
