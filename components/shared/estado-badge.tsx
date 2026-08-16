import { Badge } from "@/components/ui/badge"
import { ESTADO_ALQUILER_LABEL, ESTADO_RESERVA_LABEL } from "@/lib/formato"
import { cn } from "@/lib/utils"

const COLORES: Record<string, string> = {
  PENDIENTE: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  ACEPTADA: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  EN_CURSO: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  FINALIZADA: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  CANCELADA: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  RECHAZADA: "bg-red-500/15 text-red-700 dark:text-red-400",
  A_CONFIRMAR: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  CONFIRMADO: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  RECHAZADO: "bg-red-500/15 text-red-700 dark:text-red-400",
  CANCELADO: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  FINALIZADO: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
}

export function EstadoBadge({ estado }: { estado: string }) {
  const label =
    ESTADO_RESERVA_LABEL[estado] ?? ESTADO_ALQUILER_LABEL[estado] ?? estado
  return (
    <Badge variant="secondary" className={cn("border-transparent", COLORES[estado])}>
      {label}
    </Badge>
  )
}
