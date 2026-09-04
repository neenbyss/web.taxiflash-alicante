"use client"

import { RiPhoneLine } from "@/components/icons"
import { toast } from "sonner"

import { ChatReserva } from "@/components/chat/chat-reserva"
import { ResenaCard } from "@/components/cards/resena-card"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { ReporteDialog } from "@/components/dialogs/reporte-dialog"
import { ResenaDialog } from "@/components/dialogs/resena-dialog"
import { EsperaCountdown } from "@/components/shared/espera-countdown"
import { EstadoBadge } from "@/components/shared/estado-badge"
import { DetalleRuta } from "@/components/views/detalle-ruta"
import { LineaEstadoViaje } from "@/components/views/linea-estado-viaje"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatearFecha } from "@/lib/formato"
import { trpc } from "@/lib/trpc"
import type { PuntoRuta } from "@/lib/validations/reserva"

type DetalleReservaClienteProps = {
  reservaId: string
  miUserId: string
}

/** Página de viaje del cliente: ruta+mapa, estado, chofer, chat y acciones. */
export function DetalleReservaCliente({
  reservaId,
  miUserId,
}: DetalleReservaClienteProps) {
  const utils = trpc.useUtils()
  const detalle = trpc.reservas.detalle.useQuery(
    { reservaId },
    { refetchInterval: 12_000 }
  )

  const invalidar = () => {
    void utils.reservas.detalle.invalidate({ reservaId })
    void utils.reservas.mias.invalidate()
  }
  const cancelar = trpc.reservas.cancelar.useMutation({
    onSuccess: () => {
      toast.success("Reserva cancelada.")
      invalidar()
    },
    onError: (error) => toast.error(error.message),
  })
  const confirmarSalida = trpc.reservas.confirmarSalida.useMutation({
    onSuccess: () => {
      toast.success("Aviso enviado al chofer. ¡Te espera!")
      invalidar()
    },
    onError: (error) => toast.error(error.message),
  })
  const expirar = trpc.reservas.expirarEspera.useMutation({ onSuccess: invalidar })

  if (detalle.isLoading) return <Skeleton className="h-96 rounded-4xl" />
  if (!detalle.data) return <p className="text-sm">Reserva no encontrada.</p>

  const reserva = detalle.data
  const paradas = (reserva.paradas as PuntoRuta[]) ?? []
  const cancelable = ["PENDIENTE", "ACEPTADA"].includes(reserva.estado)
  const chatActivo = ["ACEPTADA", "EN_CURSO"].includes(reserva.estado)
  const choferLlego =
    reserva.estado === "ACEPTADA" && reserva.choferLlegoEn && !reserva.clienteSaleEn

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="font-mono">{reserva.codigo}</CardTitle>
              <EstadoBadge estado={reserva.estado} />
            </div>
            <CardDescription>
              Solicitada el {formatearFecha(reserva.createdAt)}
              {reserva.tipo === "PROGRAMADA" &&
                ` · programada para ${formatearFecha(reserva.fechaProgramada)}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <LineaEstadoViaje
              estado={reserva.estado}
              choferEnCaminoEn={reserva.choferEnCaminoEn}
              choferLlegoEn={reserva.choferLlegoEn}
              clienteSaleEn={reserva.clienteSaleEn}
            />

            {/* Alerta: el chofer llegó → confirmar salida con cuenta atrás */}
            {choferLlego && reserva.esperaHasta && (
              <div className="flex flex-col gap-2 rounded-xl border border-primary/40 bg-primary/5 p-3">
                <p className="text-sm font-medium">¡Tu chofer llegó y te espera!</p>
                <p className="text-sm text-muted-foreground">
                  Confirma tu salida antes de que termine el tiempo o la reserva se
                  cancelará automáticamente.
                </p>
                <div className="flex items-center justify-between gap-2">
                  <EsperaCountdown
                    esperaHasta={reserva.esperaHasta}
                    onExpire={() =>
                      !expirar.isPending && expirar.mutate({ reservaId })
                    }
                  />
                  <Button
                    size="sm"
                    disabled={confirmarSalida.isPending}
                    onClick={() => confirmarSalida.mutate({ reservaId })}
                  >
                    Ya voy saliendo
                  </Button>
                </div>
              </div>
            )}
            {reserva.clienteSaleEn && reserva.estado === "ACEPTADA" && (
              <p className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                Confirmaste tu salida. El chofer iniciará el viaje cuando subas.
              </p>
            )}

            <DetalleRuta
              reservaId={reservaId}
              origen={{
                direccion: reserva.origenDireccion,
                lat: reserva.origenLat,
                lng: reserva.origenLng,
              }}
              destino={{
                direccion: reserva.destinoDireccion,
                lat: reserva.destinoLat,
                lng: reserva.destinoLng,
              }}
              paradas={paradas}
              distanciaKm={reserva.distanciaKm}
              tarifaEstimada={reserva.tarifaEstimada}
            />

            {reserva.notas && (
              <div className="text-sm">
                <p className="text-xs text-muted-foreground uppercase">Notas</p>
                <p className="whitespace-pre-wrap">{reserva.notas}</p>
              </div>
            )}
            {reserva.motivoEstado &&
              ["CANCELADA", "RECHAZADA"].includes(reserva.estado) && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Motivo: {reserva.motivoEstado}
                </p>
              )}

            <div className="flex flex-wrap gap-2">
              {cancelable && (
                <ConfirmDialog
                  trigger={
                    <Button variant="destructive" size="sm">
                      Cancelar reserva
                    </Button>
                  }
                  titulo="Cancelar reserva"
                  descripcion="¿Seguro que quieres cancelar esta reserva? No se puede deshacer."
                  textoConfirmar="Cancelar reserva"
                  destructivo
                  conMotivo={{ placeholder: "Motivo (opcional)", obligatorio: false }}
                  onConfirmar={(motivo) => cancelar.mutateAsync({ reservaId, motivo })}
                />
              )}
              <ReporteDialog reservaId={reservaId} />
            </div>
          </CardContent>
        </Card>

        {reserva.estado === "FINALIZADA" &&
          (reserva.resena ? (
            <Card>
              <CardHeader>
                <CardTitle>Tu reseña</CardTitle>
              </CardHeader>
              <CardContent>
                <ResenaCard resena={reserva.resena} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Viaje finalizado</CardTitle>
                <CardDescription>
                  Puedes dejar una única reseña sobre este viaje.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResenaDialog reservaId={reservaId} />
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="flex flex-col gap-4">
        {reserva.chofer ? (
          <Card>
            <CardHeader>
              <CardTitle>Tu chofer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{reserva.chofer.name}</p>
              {reserva.chofer.telefono && (
                <a
                  href={`tel:${reserva.chofer.telefono}`}
                  className="mt-1 inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                >
                  <RiPhoneLine className="size-4" aria-hidden />
                  {reserva.chofer.telefono}
                </a>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Chofer</CardTitle>
              <CardDescription>
                Verás sus datos cuando un chofer acepte la reserva.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        <ChatReserva
          reservaId={reservaId}
          miUserId={miUserId}
          puedeEscribir={chatActivo}
        />
      </div>
    </div>
  )
}
