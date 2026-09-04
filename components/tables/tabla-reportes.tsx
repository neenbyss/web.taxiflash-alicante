"use client"

import Link from "next/link"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { CATEGORIAS_REPORTE } from "@/lib/validations/reporte"
import { formatearFecha } from "@/lib/formato"
import { trpc } from "@/lib/trpc"

const ESTADO_ITEMS = [
  { value: "ABIERTO", label: "Abierto" },
  { value: "EN_REVISION", label: "En revisión" },
  { value: "RESUELTO", label: "Resuelto" },
]
const ESTADO_COLOR: Record<string, string> = {
  ABIERTO: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  EN_REVISION: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  RESUELTO: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
}
const CATEGORIA_LABEL = Object.fromEntries(
  CATEGORIAS_REPORTE.map((c) => [c.valor, c.label])
)

/** Gestión de reportes/incidencias (admin). */
export function TablaReportes() {
  const utils = trpc.useUtils()
  const reportes = trpc.soporte.listarAdmin.useQuery({}, { refetchInterval: 30_000 })
  const gestionar = trpc.soporte.gestionar.useMutation({
    onSuccess: () => {
      toast.success("Reporte actualizado.")
      void utils.soporte.listarAdmin.invalidate()
      void utils.soporte.contarAbiertos.invalidate()
    },
    onError: (error) => toast.error(error.message),
  })

  if (reportes.isLoading) return <Skeleton className="h-64 rounded-2xl" />

  if (!reportes.data?.length) {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
        No hay reportes.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {reportes.data.map((reporte) => (
        <div key={reporte.id} className="flex flex-col gap-2 rounded-2xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={ESTADO_COLOR[reporte.estado]}>
                {ESTADO_ITEMS.find((e) => e.value === reporte.estado)?.label}
              </Badge>
              <span className="text-sm font-medium">
                {CATEGORIA_LABEL[reporte.categoria] ?? reporte.categoria}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatearFecha(reporte.createdAt)}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{reporte.descripcion}</p>
          <p className="text-xs text-muted-foreground">
            Por {reporte.autor.name}
            {reporte.reserva && (
              <>
                {" · "}
                <Link
                  href={`/admin/bookings`}
                  className="underline underline-offset-4"
                >
                  reserva {reporte.reserva.codigo}
                </Link>
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Cambiar estado:</span>
            <Select
              value={reporte.estado}
              onValueChange={(valor) =>
                valor &&
                gestionar.mutate({
                  reporteId: reporte.id,
                  estado: valor as "ABIERTO" | "EN_REVISION" | "RESUELTO",
                })
              }
              items={ESTADO_ITEMS}
            >
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADO_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  )
}
