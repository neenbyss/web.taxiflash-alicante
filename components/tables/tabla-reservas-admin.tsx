"use client"

import { useState } from "react"

import { AsignarReservaDialog } from "@/components/dialogs/asignar-reserva-dialog"
import { EstadoBadge } from "@/components/shared/estado-badge"
import { Button } from "@/components/ui/button"
import { RiSearchLine } from "@/components/icons"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ESTADO_RESERVA_LABEL,
  formatearFecha,
  formatearMoneda,
} from "@/lib/formato"
import { trpc } from "@/lib/trpc"

type EstadoFiltro =
  | "TODOS"
  | "PENDIENTE"
  | "ACEPTADA"
  | "EN_CURSO"
  | "FINALIZADA"
  | "CANCELADA"
  | "RECHAZADA"

const ITEMS_FILTRO = [
  { value: "TODOS", label: "Todos los estados" },
  ...Object.entries(ESTADO_RESERVA_LABEL).map(([value, label]) => ({
    value,
    label,
  })),
]

/** Listado completo de reservas con filtros y asignación manual. */
export function TablaReservasAdmin() {
  const utils = trpc.useUtils()
  const [estado, setEstado] = useState<EstadoFiltro>("TODOS")
  const [busqueda, setBusqueda] = useState("")

  const reservas = trpc.reservas.listarAdmin.useInfiniteQuery(
    {
      estado: estado === "TODOS" ? undefined : estado,
      busqueda: busqueda.trim() || undefined,
      limite: 20,
    },
    {
      getNextPageParam: (ultima) => ultima.nextCursor,
      refetchInterval: 20_000,
    }
  )

  const filas = reservas.data?.pages.flatMap((pagina) => pagina.reservas) ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="max-w-xs">
          <InputGroupAddon>
            <RiSearchLine aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código, cliente o dirección…"
            aria-label="Buscar reservas"
          />
        </InputGroup>
        <Select
          value={estado}
          onValueChange={(valor) =>
            setEstado((valor as EstadoFiltro) ?? "TODOS")
          }
          items={ITEMS_FILTRO}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ITEMS_FILTRO.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {reservas.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="max-w-full min-w-0 overflow-hidden rounded-2xl bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Chofer</TableHead>
                <TableHead className="text-right">Estimado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No hay reservas con estos filtros.
                  </TableCell>
                </TableRow>
              )}
              {filas.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCell className="font-mono text-xs">
                    {reserva.codigo}
                  </TableCell>
                  <TableCell>
                    <EstadoBadge estado={reserva.estado} />
                  </TableCell>
                  <TableCell>
                    {reserva.nombreContacto}
                    {!reserva.cliente && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (invitado)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-64">
                    <p className="truncate" title={reserva.origenDireccion}>
                      {reserva.origenDireccion}
                    </p>
                    <p
                      className="truncate text-muted-foreground"
                      title={reserva.destinoDireccion}
                    >
                      → {reserva.destinoDireccion}
                    </p>
                  </TableCell>
                  <TableCell>{reserva.chofer?.name ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {formatearMoneda(reserva.tarifaEstimada)}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {reserva.tipo === "PROGRAMADA"
                      ? `Prog.: ${formatearFecha(reserva.fechaProgramada)}`
                      : formatearFecha(reserva.createdAt)}
                  </TableCell>
                  <TableCell>
                    {reserva.estado === "PENDIENTE" && (
                      <AsignarReservaDialog
                        reservaId={reserva.id}
                        codigo={reserva.codigo}
                        onAsignada={() =>
                          void utils.reservas.listarAdmin.invalidate()
                        }
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {reservas.hasNextPage && (
        <Button
          variant="outline"
          className="self-center"
          disabled={reservas.isFetchingNextPage}
          onClick={() => void reservas.fetchNextPage()}
        >
          {reservas.isFetchingNextPage ? "Cargando…" : "Cargar más"}
        </Button>
      )}
    </div>
  )
}
