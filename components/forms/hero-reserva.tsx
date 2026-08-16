"use client"

import { RiArrowRightLine } from "@remixicon/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { DateTimePicker } from "@/components/forms/date-time-picker"
import { DireccionAutocomplete } from "@/components/forms/direccion-autocomplete"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { formatearMoneda } from "@/lib/formato"
import type { ResultadoGeocoding } from "@/lib/geocoding"
import { trpc } from "@/lib/trpc"

/**
 * Widget de reserva rápida del landing: origen y destino por autocompletado
 * (solo 2 puntos). Crea la reserva si hay sesión; si no, lleva a registro.
 */
export function HeroReserva() {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const [origen, setOrigen] = useState<ResultadoGeocoding | null>(null)
  const [destino, setDestino] = useState<ResultadoGeocoding | null>(null)
  const [fecha, setFecha] = useState<Date | null>(null)

  const completa = Boolean(origen && destino)
  const estimacion = trpc.reservas.estimarTarifa.useQuery(
    {
      puntos: [
        ...(origen ? [{ lat: origen.lat, lng: origen.lng }] : []),
        ...(destino ? [{ lat: destino.lat, lng: destino.lng }] : []),
      ],
    },
    { enabled: completa, staleTime: 30_000 }
  )

  const crear = trpc.reservas.crear.useMutation({
    onSuccess: (data) => {
      toast.success(`Reserva ${data.codigo} creada.`)
      router.push(`/cliente/reservas/${data.id}`)
    },
    onError: (error) => toast.error(error.message),
  })

  const reservar = () => {
    if (!origen || !destino) {
      toast.error("Indica el punto de partida y el destino.")
      return
    }
    // Solo se crea la reserva si hay sesión; si no, se lleva a registro.
    if (!session) {
      router.push("/register")
      return
    }
    crear.mutate({
      tipo: fecha ? "PROGRAMADA" : "INMEDIATA",
      fechaProgramada: fecha ?? undefined,
      origen,
      destino,
      paradas: [],
      notas: undefined,
    })
  }

  const tarifa = estimacion.data?.tarifaEstimada ?? null

  return (
    <div className="rounded-3xl bg-card p-6 text-card-foreground shadow-xl sm:p-10">
      <h2 className="mb-6 font-heading text-3xl sm:text-4xl">Reserva Ahora</h2>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <DireccionAutocomplete
          label="Punto de partida"
          value={origen}
          onChange={setOrigen}
          placeholder="¿Dónde te recogemos?"
        />
        <DireccionAutocomplete
          label="Destino"
          value={destino}
          onChange={setDestino}
          placeholder="¿A dónde vas?"
        />
        <div className="flex flex-col gap-1.5 w-64">
          <Label className="pl-2 text-sm font-medium text-secondary/70 dark:text-white/70">
            Fecha (opcional)
          </Label>
          <DateTimePicker value={fecha} onChange={setFecha} />
        </div>
        <Button
          type="button"
          size="lg"
          onClick={reservar}
          disabled={crear.isPending}
          className="h-12 gap-5 pl-5 pr-1 text-base font-medium"
        >
          {crear.isPending ? "Creando…" : "Reservar Ahora"}

          <span className=" size-10 flex flex-col justify-center items-center bg-secondary-foreground text-foreground rounded-sm">
            <RiArrowRightLine aria-hidden />
          </span>
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-sm">
        <span>
          Tarifa estimada para esta ruta:{" "}
          <strong>
            {completa && tarifa != null
              ? `${formatearMoneda(Math.round(tarifa * 0.9))} – ${formatearMoneda(Math.round(tarifa * 1.1))}`
              : "indica origen y destino"}
          </strong>
        </span>
        <span className="text-muted-foreground">
          {session ? "Se creará en tu cuenta" : "Necesitarás registrarte para reservar"}
        </span>
      </div>
    </div>
  )
}
