"use client"

import {
  RiAlarmWarningLine,
  RiCarLine,
  RiRoadMapLine,
  RiStarLine,
  RiTimeLine,
} from "@/components/icons"
import Link from "next/link"

import { StarRating } from "@/components/shared/star-rating"
import { StatTile } from "@/components/shared/stat-tile"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ESTADO_RESERVA_LABEL, ROL_LABEL } from "@/lib/formato"
import { trpc } from "@/lib/trpc"

/** Panel de control del admin: KPIs, distribución y ranking de choferes. */
export function ResumenReportes() {
  const resumen = trpc.reportes.resumen.useQuery()
  const choferes = trpc.reportes.choferes.useQuery()
  const reportesAbiertos = trpc.soporte.contarAbiertos.useQuery()

  if (resumen.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-3xl" />
        ))}
      </div>
    )
  }
  if (!resumen.data) return null

  const {
    reservasPorEstado,
    usuariosPorRol,
    resenas,
    reservasUltimos30Dias,
    alquileresPendientes,
  } = resumen.data

  const totalReservas = Object.values(reservasPorEstado).reduce(
    (a, b) => a + b,
    0
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Fila de KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Reservas (30 días)"
          valor={reservasUltimos30Dias}
          icono={RiRoadMapLine}
          hint={`${totalReservas} en total`}
        />
        <StatTile
          label="Pendientes ahora"
          valor={reservasPorEstado.PENDIENTE ?? 0}
          icono={RiTimeLine}
          hint="Esperando chofer"
        />
        <StatTile
          label="Alquileres a confirmar"
          valor={alquileresPendientes}
          icono={RiCarLine}
          hint="Precio manual"
        />
        <StatTile
          label="Valoración media"
          valor={
            <span className="flex items-center gap-2">
              {resenas.promedio?.toFixed(1) ?? "—"}
              <StarRating valor={Math.round(resenas.promedio ?? 0)} tamano="sm" />
            </span>
          }
          icono={RiStarLine}
          hint={`${resenas.total} reseñas`}
        />
      </div>

      {/* Aviso de reportes abiertos */}
      {(reportesAbiertos.data ?? 0) > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300">
          <RiAlarmWarningLine className="size-5 shrink-0" aria-hidden />
          <p className="flex-1 text-sm">
            Tienes <strong>{reportesAbiertos.data}</strong> reporte(s) abierto(s)
            sin revisar.
          </p>
          <Button size="sm" variant="outline" render={<Link href="/admin/reports" />}>
            Revisar
          </Button>
        </div>
      )}

      {/* Distribución */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reservas por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {Object.entries(ESTADO_RESERVA_LABEL).map(([estado, label]) => {
                const valor = reservasPorEstado[estado] ?? 0
                const pct = totalReservas > 0 ? (valor / totalReservas) * 100 : 0
                return (
                  <div key={estado} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <span className="font-medium tabular-nums">{valor}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios activos por rol</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {Object.entries(ROL_LABEL).map(([rol, label]) => (
                  <TableRow key={rol}>
                    <TableCell>{label}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {usuariosPorRol[rol] ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de choferes */}
      <Card>
        <CardHeader>
          <CardTitle>Choferes</CardTitle>
          <CardDescription>Viajes atendidos y valoración.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-w-0 max-w-full overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chofer</TableHead>
                  <TableHead className="text-right">Viajes</TableHead>
                  <TableHead className="text-right">Reseñas</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {choferes.data?.length ? (
                  choferes.data.map((chofer) => (
                    <TableRow key={chofer.id}>
                      <TableCell>
                        {chofer.name}
                        {!chofer.activo && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (inactivo)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {chofer.totalViajes}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {chofer.totalResenas}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {chofer.rating?.toFixed(1) ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                      Aún no hay choferes registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
