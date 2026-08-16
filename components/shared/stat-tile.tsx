import type { RemixiconComponentType } from "@remixicon/react"

import { cn } from "@/lib/utils"

type StatTileProps = {
  label: string
  valor: React.ReactNode
  icono?: RemixiconComponentType
  hint?: React.ReactNode
  className?: string
}

/** Tarjeta compacta de KPI para los dashboards (sin borde, estilo bento). */
export function StatTile({ label, valor, icono: Icono, hint, className }: StatTileProps) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-3xl bg-card p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icono && (
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icono className="size-4" aria-hidden />
          </span>
        )}
      </div>
      <span className="font-heading text-3xl font-semibold tabular-nums">
        {valor}
      </span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}
