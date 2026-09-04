"use client"

import { toast } from "sonner"

import { ConfirmarAlquilerDialog } from "@/components/dialogs/confirmar-alquiler-dialog"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { EstadoBadge } from "@/components/shared/estado-badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatearFecha, formatearMoneda } from "@/lib/formato"
import { trpc } from "@/lib/trpc"

/** Gestión de alquileres entre ciudades: confirmar precio, rechazar, finalizar. */
export function TablaAlquileres() {
  const utils = trpc.useUtils()
  const alquileres = trpc.alquiler.listarAdmin.useQuery(
    {},
    { refetchInterval: 30_000 }
  )
  const invalidar = () => void utils.alquiler.listarAdmin.invalidate()
  const cambiarEstado = trpc.alquiler.cambiarEstado.useMutation({
    onSuccess: () => {
      toast.success("Estado actualizado.")
      invalidar()
    },
    onError: (error) => toast.error(error.message),
  })

  if (alquileres.isLoading) return <Skeleton className="h-64 rounded-2xl" />

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-2xl bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Trayecto</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {!alquileres.data?.length && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                No hay solicitudes de alquiler.
              </TableCell>
            </TableRow>
          )}
          {alquileres.data?.map((alquiler) => (
            <TableRow key={alquiler.id}>
              <TableCell className="font-mono text-xs">{alquiler.codigo}</TableCell>
              <TableCell>
                <EstadoBadge estado={alquiler.estado} />
              </TableCell>
              <TableCell>
                <p>{alquiler.nombreContacto}</p>
                <p className="text-xs text-muted-foreground">
                  {alquiler.telefonoContacto ?? alquiler.emailContacto ?? ""}
                </p>
              </TableCell>
              <TableCell>
                {alquiler.ciudadOrigen} → {alquiler.ciudadDestino}
                <p className="text-xs text-muted-foreground">
                  {alquiler.modalidad === "por_horas"
                    ? `Por horas (${alquiler.horas ?? "?"}h)`
                    : "Interurbano"}
                  {alquiler.chofer && ` · ${alquiler.chofer.name}`}
                </p>
              </TableCell>
              <TableCell className="text-xs whitespace-nowrap">
                {formatearFecha(alquiler.fecha)}
              </TableCell>
              <TableCell className="text-right">
                {formatearMoneda(alquiler.precioConfirmado)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {alquiler.estado === "A_CONFIRMAR" && (
                    <>
                      <ConfirmarAlquilerDialog
                        alquilerId={alquiler.id}
                        codigo={alquiler.codigo}
                        onConfirmado={invalidar}
                      />
                      <ConfirmDialog
                        trigger={
                          <Button variant="outline" size="sm">
                            Rechazar
                          </Button>
                        }
                        titulo={`Rechazar alquiler ${alquiler.codigo}`}
                        descripcion="Se avisará al cliente de que la solicitud no pudo atenderse."
                        textoConfirmar="Rechazar"
                        destructivo
                        onConfirmar={() =>
                          cambiarEstado.mutateAsync({
                            alquilerId: alquiler.id,
                            estado: "RECHAZADO",
                          })
                        }
                      />
                    </>
                  )}
                  {alquiler.estado === "CONFIRMADO" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cambiarEstado.isPending}
                      onClick={() =>
                        cambiarEstado.mutate({
                          alquilerId: alquiler.id,
                          estado: "FINALIZADO",
                        })
                      }
                    >
                      Finalizar
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
