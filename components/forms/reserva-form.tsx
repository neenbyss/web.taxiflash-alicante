"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { RiUser3Line } from "@remixicon/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { MapaSelector } from "@/components/mapa/mapa-selector"
import { PuntosRuta } from "@/components/forms/puntos-ruta"
import { TarifaEstimada } from "@/components/forms/tarifa-estimada"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { trpc } from "@/lib/trpc"
import {
  crearReservaSchema,
  type CrearReservaInput,
} from "@/lib/validations/reserva"
import { useReservaBorrador } from "@/stores/reserva-borrador"

type ReservaFormProps = {
  /** Nombre del usuario autenticado, solo para mostrarlo (no editable). */
  nombreUsuario: string
}

/**
 * Formulario de reserva del portal de clientes. Requiere sesión: los datos de
 * contacto se toman del perfil, no se piden aquí. Los puntos se fijan en el
 * mapa (store de borrador) y se validan con zod en cliente y servidor.
 */
export function ReservaForm({ nombreUsuario }: ReservaFormProps) {
  const router = useRouter()
  const { origen, destino, paradas, reiniciar } = useReservaBorrador()

  const form = useForm<CrearReservaInput>({
    resolver: zodResolver(crearReservaSchema),
    defaultValues: { tipo: "INMEDIATA", paradas: [], notas: "" },
  })
  const tipo = form.watch("tipo")
  const errores = form.formState.errors

  // Sincroniza el borrador del mapa con los valores del formulario.
  useEffect(() => {
    if (origen)
      form.setValue("origen", origen, { shouldValidate: form.formState.isSubmitted })
  }, [origen, form])
  useEffect(() => {
    if (destino)
      form.setValue("destino", destino, { shouldValidate: form.formState.isSubmitted })
  }, [destino, form])
  useEffect(() => {
    form.setValue("paradas", paradas.filter((p) => p !== null))
  }, [paradas, form])

  const crear = trpc.reservas.crear.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Reserva ${data.codigo} registrada. Quedó pendiente de aceptación.`
      )
      reiniciar()
      form.reset()
      router.push(`/cliente/reservas/${data.id}`)
    },
    onError: (error) => toast.error(error.message),
  })

  const onSubmit = form.handleSubmit((values) => crear.mutate(values))

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <p className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          <RiUser3Line className="size-4 shrink-0" aria-hidden />
          Reservando como <strong className="text-foreground">{nombreUsuario}</strong>.
          Puedes actualizar tu teléfono en tu perfil.
        </p>

        <Field>
          <FieldLabel htmlFor="tipo-reserva">¿Cuándo?</FieldLabel>
          <Tabs
            value={tipo}
            onValueChange={(valor) =>
              form.setValue("tipo", valor as CrearReservaInput["tipo"])
            }
          >
            <TabsList className="w-full" id="tipo-reserva">
              <TabsTrigger value="INMEDIATA" className="flex-1">
                Ahora mismo
              </TabsTrigger>
              <TabsTrigger value="PROGRAMADA" className="flex-1">
                Programar
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {tipo === "PROGRAMADA" && (
            <>
              <Input
                type="datetime-local"
                aria-label="Fecha y hora del viaje"
                aria-invalid={Boolean(errores.fechaProgramada)}
                onChange={(e) =>
                  form.setValue(
                    "fechaProgramada",
                    e.target.value ? new Date(e.target.value) : undefined,
                    { shouldValidate: form.formState.isSubmitted }
                  )
                }
              />
              <FieldError errors={[errores.fechaProgramada]} />
            </>
          )}
        </Field>

        <Field>
          <FieldLabel>Ruta *</FieldLabel>
          <MapaSelector />
          <PuntosRuta />
          <FieldError
            errors={[
              errores.origen ? { message: "Fija el origen en el mapa" } : undefined,
              errores.destino ? { message: "Fija el destino en el mapa" } : undefined,
            ]}
          />
        </Field>

        <TarifaEstimada />

        <Field data-invalid={Boolean(errores.notas)}>
          <FieldLabel htmlFor="notas">Notas y preferencias</FieldLabel>
          <Textarea
            id="notas"
            rows={3}
            placeholder="Ej.: llevo equipaje grande, prefiero vehículo amplio, voy con mascota…"
            {...form.register("notas")}
          />
          <FieldError errors={[errores.notas]} />
        </Field>

        <Button type="submit" size="lg" disabled={crear.isPending}>
          {crear.isPending ? "Enviando…" : "Solicitar reserva"}
        </Button>
      </FieldGroup>
    </form>
  )
}
