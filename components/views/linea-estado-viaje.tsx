import { RiCheckLine } from "@remixicon/react"

import {
  FASE_RECOGIDA_LABEL,
  PASOS_VIAJE,
  faseRecogida,
  indiceEstado,
} from "@/lib/viaje"
import { cn } from "@/lib/utils"

type LineaEstadoProps = {
  estado: string
  choferEnCaminoEn: Date | string | null
  choferLlegoEn: Date | string | null
  clienteSaleEn: Date | string | null
}

/** Línea de tiempo del viaje (Solicitada → Aceptada → En curso → Finalizada). */
export function LineaEstadoViaje({
  estado,
  choferEnCaminoEn,
  choferLlegoEn,
  clienteSaleEn,
}: LineaEstadoProps) {
  const cancelada = ["CANCELADA", "RECHAZADA"].includes(estado)
  const actual = indiceEstado(estado)

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex items-center" aria-label="Progreso del viaje">
        {PASOS_VIAJE.map((paso, i) => {
          const completado = !cancelada && actual >= i
          const esActual = !cancelada && actual === i
          return (
            <li key={paso.clave} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border text-xs font-medium",
                    completado
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                    esActual && "ring-2 ring-primary/30"
                  )}
                  aria-current={esActual ? "step" : undefined}
                >
                  {completado && actual > i ? (
                    <RiCheckLine className="size-4" aria-hidden />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={cn(
                    "text-[11px]",
                    esActual ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {paso.label}
                </span>
              </div>
              {i < PASOS_VIAJE.length - 1 && (
                <span
                  className={cn(
                    "mx-1 h-0.5 flex-1",
                    !cancelada && actual > i ? "bg-primary" : "bg-border"
                  )}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>

      {cancelada && (
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {estado === "CANCELADA" ? "Reserva cancelada." : "Reserva rechazada."}
        </p>
      )}
      {estado === "ACEPTADA" && (
        <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">
          {FASE_RECOGIDA_LABEL[faseRecogida({ choferEnCaminoEn, choferLlegoEn, clienteSaleEn })]}
        </p>
      )}
    </div>
  )
}
