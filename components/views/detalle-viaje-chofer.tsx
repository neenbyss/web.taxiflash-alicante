"use client"

import { RiPhoneLine } from "@/components/icons"
import { toast } from "sonner"

import { ChatReserva } from "@/components/chat/chat-reserva"
import { ReporteDialog } from "@/components/dialogs/reporte-dialog"
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

/** Página de viaje del chofer: ruta+mapa, pasajero, chat y acciones de estado. */
export function DetalleViajeChofer({
  reservaId,
  miUserId,
}: {
  reservaId: string
  miUserId: string
}) {
  const utils = trpc.useUtils()
  const detalle = trpc.reservas.detalle.useQuery(
    { reservaId },
    { refetchInterval: 12_000 }
  )

  const invalidar = () => {
    void utils.reservas.detalle.invalidate({ reservaId })
    void utils.reservas.misViajes.invalidate()
  }
  const onErr = (e: { message: string }) => toast.error(e.message)

  const enCamino = trpc.reservas.marcarEnCamino.useMutation({ onSuccess: invalidar, onError: onErr })
  const llegada = trpc.reservas.marcarLlegada.useMutation({
    onSuccess: () => {
      toast.success("Avisamos al cliente de tu llegada.")
      invalidar()
    },
    onError: onErr,
  })
  const cambiarEstado = trpc.reservas.cambiarEstado.useMutation({
    onSuccess: invalidar,
    onError: onErr,
  })

  if (detalle.isLoading) return <Skeleton className="h-96 rounded-4xl" />
  if (!detalle.data) return <p className="text-sm">Viaje no encontrado.</p>

  const r = detalle.data
  const paradas = (r.paradas as PuntoRuta[]) ?? []
  const chatActivo = ["ACEPTADA", "EN_CURSO"].includes(r.estado)

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="font-mono">{r.codigo}</CardTitle>
              <EstadoBadge estado={r.estado} />
            </div>
            <CardDescription>
              {r.tipo === "PROGRAMADA"
                ? `Programada para ${formatearFecha(r.fechaProgramada)}`
                : `Solicitada el ${formatearFecha(r.createdAt)}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <LineaEstadoViaje
              estado={r.estado}
              choferEnCaminoEn={r.choferEnCaminoEn}
              choferLlegoEn={r.choferLlegoEn}
              clienteSaleEn={r.clienteSaleEn}
            />

            {/* Acciones de la fase de recogida y del viaje */}
            {r.estado === "ACEPTADA" && (
              <div className="flex flex-col gap-2 rounded-xl border p-3">
                <p className="text-sm font-medium">Acciones del viaje</p>
                {r.clienteSaleEn && (
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    El cliente confirmó que va saliendo.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {!r.choferEnCaminoEn && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={enCamino.isPending}
                      onClick={() => enCamino.mutate({ reservaId })}
                    >
                      Voy en camino
                    </Button>
                  )}
                  {!r.choferLlegoEn ? (
                    <Button
                      size="sm"
                      disabled={llegada.isPending}
                      onClick={() => llegada.mutate({ reservaId })}
                    >
                      Ya llegué
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={cambiarEstado.isPending}
                      onClick={() =>
                        cambiarEstado.mutate({ reservaId, accion: "iniciar" })
                      }
                    >
                      Iniciar viaje
                    </Button>
                  )}
                </div>
                {r.choferLlegoEn && !r.clienteSaleEn && (
                  <p className="text-xs text-muted-foreground">
                    Esperando a que el cliente confirme su salida. Si no se
                    presenta, la reserva se cancela sola.
                  </p>
                )}
              </div>
            )}
            {r.estado === "EN_CURSO" && (
              <Button
                className="self-start"
                disabled={cambiarEstado.isPending}
                onClick={() =>
                  cambiarEstado.mutate({ reservaId, accion: "finalizar" })
                }
              >
                Finalizar viaje
              </Button>
            )}

            <DetalleRuta
              reservaId={reservaId}
              origen={{
                direccion: r.origenDireccion,
                lat: r.origenLat,
                lng: r.origenLng,
              }}
              destino={{
                direccion: r.destinoDireccion,
                lat: r.destinoLat,
                lng: r.destinoLng,
              }}
              paradas={paradas}
              distanciaKm={r.distanciaKm}
              tarifaEstimada={r.tarifaEstimada}
            />

            {r.notas && (
              <div className="text-sm">
                <p className="text-xs text-muted-foreground uppercase">
                  Notas del cliente
                </p>
                <p className="whitespace-pre-wrap">{r.notas}</p>
              </div>
            )}

            <ReporteDialog reservaId={reservaId} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pasajero</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{r.nombreContacto}</p>
            {r.telefonoContacto && (
              <a
                href={`tel:${r.telefonoContacto}`}
                className="mt-1 inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
              >
                <RiPhoneLine className="size-4" aria-hidden />
                {r.telefonoContacto}
              </a>
            )}
          </CardContent>
        </Card>
        <ChatReserva
          reservaId={reservaId}
          miUserId={miUserId}
          puedeEscribir={chatActivo}
        />
      </div>
    </div>
  )
}
