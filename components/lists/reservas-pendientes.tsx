"use client"

import { toast } from "sonner"

import { ReservaCard } from "@/components/cards/reserva-card"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PERMISOS } from "@/lib/permisos"
import { trpc } from "@/lib/trpc"
import { usePermisos } from "@/hooks/use-permisos"

/**
 * Reservas pendientes disponibles para tomar. El primero en aceptar se la
 * queda (update condicional en servidor: sin carreras).
 */
export function ReservasPendientes() {
  const utils = trpc.useUtils()
  const { tiene, cargando: cargandoPermisos } = usePermisos()
  const puedeAceptar = tiene(PERMISOS.ACEPTAR_RESERVAS)

  const pendientes = trpc.reservas.pendientes.useQuery(undefined, {
    refetchInterval: 10_000,
    enabled: puedeAceptar,
  })

  const invalidar = () => {
    void utils.reservas.pendientes.invalidate()
    void utils.reservas.misViajes.invalidate()
  }
  const aceptar = trpc.reservas.aceptar.useMutation({
    onSuccess: () => {
      toast.success("Reserva aceptada. ¡Buen viaje!")
      invalidar()
    },
    onError: (error) => {
      toast.error(error.message)
      invalidar()
    },
  })
  const rechazar = trpc.reservas.rechazar.useMutation({
    onSuccess: () => {
      toast.success("Reserva rechazada.")
      invalidar()
    },
    onError: (error) => toast.error(error.message),
  })

  if (cargandoPermisos || (puedeAceptar && pendientes.isLoading)) {
    return <Skeleton className="h-40 rounded-4xl" />
  }

  if (!puedeAceptar) {
    return (
      <Alert>
        <AlertTitle>Sin permiso para tomar reservas</AlertTitle>
        <AlertDescription>
          Un administrador debe concederte el permiso “aceptar_reservas” para
          ver y tomar reservas pendientes.
        </AlertDescription>
      </Alert>
    )
  }

  if (!pendientes.data?.length) {
    return (
      <div className="rounded-3xl bg-muted/50 px-6 py-12 text-center text-sm text-muted-foreground">
        No hay reservas pendientes ahora mismo. Esta lista se actualiza sola.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {pendientes.data.map((reserva) => (
        <ReservaCard
          key={reserva.id}
          reserva={reserva}
          contraparte={{ etiqueta: "Cliente", nombre: reserva.nombreContacto }}
          acciones={
            <>
              <ConfirmDialog
                trigger={
                  <Button variant="outline" size="sm">
                    Rechazar
                  </Button>
                }
                titulo="Rechazar reserva"
                descripcion="La reserva quedará rechazada para todos y se avisará al cliente."
                textoConfirmar="Rechazar"
                destructivo
                conMotivo={{ placeholder: "Motivo del rechazo *", obligatorio: true }}
                onConfirmar={(motivo) =>
                  rechazar.mutateAsync({ reservaId: reserva.id, motivo: motivo ?? "" })
                }
              />
              <Button
                size="sm"
                disabled={aceptar.isPending}
                onClick={() => aceptar.mutate({ reservaId: reserva.id })}
              >
                Aceptar
              </Button>
            </>
          }
        />
      ))}
    </div>
  )
}
