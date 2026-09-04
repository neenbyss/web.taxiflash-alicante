"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useSyncExternalStore } from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { PuntosRuta } from "@/components/forms/puntos-ruta"
import { TarifaEstimada } from "@/components/forms/tarifa-estimada"
import { RiArrowRightLine, RiTaxiLine, RiUser3Line } from "@/components/icons"
import { DireccionSearch } from "@/components/mapa/direccion-search"
import { MapaSelector } from "@/components/mapa/mapa-selector"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { trpc } from "@/lib/trpc"
import { crearReservaSchema, type CrearReservaInput } from "@/lib/validations/reserva"
import { useReservaBorrador } from "@/stores/reserva-borrador"

type ReservaFormProps = { nombreUsuario: string }

const DESKTOP_QUERY = "(min-width: 1024px)"
const subscribeDesktop = (callback: () => void) => {
  const query = window.matchMedia(DESKTOP_QUERY)
  query.addEventListener("change", callback)
  return () => query.removeEventListener("change", callback)
}
const getDesktopSnapshot = () => window.matchMedia(DESKTOP_QUERY).matches
const getDesktopServerSnapshot = () => false

export function ReservaForm({ nombreUsuario }: ReservaFormProps) {
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, getDesktopServerSnapshot)
  const router = useRouter()
  const { origen, destino, paradas, puntoActivo, reiniciar, setPunto } = useReservaBorrador()
  const form = useForm<CrearReservaInput>({
    resolver: zodResolver(crearReservaSchema),
    defaultValues: { tipo: "INMEDIATA", paradas: [], notas: "" },
  })
  const tipo = useWatch({ control: form.control, name: "tipo" })
  const errores = form.formState.errors

  useEffect(() => {
    if (origen) form.setValue("origen", origen, { shouldValidate: form.formState.isSubmitted })
  }, [origen, form])
  useEffect(() => {
    if (destino) form.setValue("destino", destino, { shouldValidate: form.formState.isSubmitted })
  }, [destino, form])
  useEffect(() => {
    form.setValue("paradas", paradas.filter((point) => point !== null))
  }, [paradas, form])

  const crear = trpc.reservas.crear.useMutation({
    onSuccess: (data) => {
      toast.success(`Reserva ${data.codigo} registrada. Quedó pendiente de aceptación.`)
      reiniciar()
      form.reset()
      router.push(`/customer/bookings/${data.id}`)
    },
    onError: (error) => toast.error(error.message),
  })
  const onSubmit = form.handleSubmit((values) => crear.mutate(values))

  const timingFields = (
    <Field className="rounded-2xl bg-card p-4 shadow-sm">
      <FieldLabel htmlFor="tipo-reserva">¿Cuándo?</FieldLabel>
      <Tabs value={tipo} onValueChange={(value) => form.setValue("tipo", value as CrearReservaInput["tipo"])}>
        <TabsList className="w-full" id="tipo-reserva">
          <TabsTrigger value="INMEDIATA" className="flex-1">Ahora mismo</TabsTrigger>
          <TabsTrigger value="PROGRAMADA" className="flex-1">Programar</TabsTrigger>
        </TabsList>
      </Tabs>
      {tipo === "PROGRAMADA" && (
        <>
          <Input
            type="datetime-local"
            aria-label="Fecha y hora del viaje"
            aria-invalid={Boolean(errores.fechaProgramada)}
            onChange={(event) => form.setValue(
              "fechaProgramada",
              event.target.value ? new Date(event.target.value) : undefined,
              { shouldValidate: form.formState.isSubmitted }
            )}
          />
          <FieldError errors={[errores.fechaProgramada]} />
        </>
      )}
    </Field>
  )

  const notesField = (
    <Field data-invalid={Boolean(errores.notas)} className="rounded-2xl bg-card p-4 shadow-sm">
      <FieldLabel htmlFor="notas">Notas y preferencias</FieldLabel>
      <Textarea
        id="notas"
        rows={3}
        placeholder="Ej.: llevo equipaje grande, prefiero vehículo amplio, voy con mascota…"
        {...form.register("notas")}
      />
      <FieldError errors={[errores.notas]} />
    </Field>
  )

  const submitButton = (
    <Button
      type="submit"
      form="reserva-form"
      size="lg"
      disabled={crear.isPending}
      className="h-12 w-full shadow-sm lg:ml-auto lg:w-fit lg:min-w-56"
    >
      {crear.isPending ? "Enviando…" : "Solicitar reserva"}
    </Button>
  )

  return (
    <form id="reserva-form" onSubmit={onSubmit} noValidate className="h-full min-w-0 max-w-full overflow-hidden lg:h-auto lg:pb-4">
      <FieldGroup className="h-full gap-5 lg:h-auto">
        <div className="hidden items-center gap-3 rounded-2xl bg-secondary px-5 py-3 text-secondary-foreground shadow-sm lg:flex">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <RiUser3Line className="size-5" aria-hidden />
          </span>
          <p className="min-w-0 text-sm leading-snug text-secondary-foreground/65">
            Reservando como <strong className="text-secondary-foreground">{nombreUsuario}</strong>
            <span> · El contacto se toma de tu perfil.</span>
          </p>
        </div>

        {isDesktop && timingFields}

        <Field className="h-full min-h-0 min-w-0 max-w-full overflow-hidden lg:h-auto">
          <div className="hidden pb-2 lg:block">
            <FieldLabel className="text-base">Diseña tu ruta</FieldLabel>
            <p className="mt-1 text-sm text-muted-foreground">
              Busca el origen y el destino. Puedes ajustar cada punto desde las opciones del viaje.
            </p>
          </div>
          <div className="relative h-full lg:h-auto">
            <MapaSelector />
            {!isDesktop && (
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      type="button"
                      variant="secondary"
                      className="absolute left-1/2 -translate-x-1/2  bottom-20 z-30 h-auto justify-start gap-3 rounded-2xl bg-primary px-2 py-2 text-primary-foreground shadow-[0_12px_32px_rgb(30_29_26/22%)] hover:bg-primary/90"
                    />
                  }
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                    <RiTaxiLine className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-left leading-tight">
                    <span className="block text-sm font-semibold">Revisa tu reserva</span>
                    <span className="mt-1 block truncate text-xs font-normal text-primary-foreground/70">
                      {origen && destino
                        ? "Recorrido listo · consulta la tarifa"
                        : origen
                          ? "Añade el destino y el horario"
                          : "Ruta, horario, tarifa y preferencias"}
                    </span>
                  </span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
                    <RiArrowRightLine className="size-4" aria-hidden />
                  </span>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[calc(100dvh-1rem)] overflow-hidden rounded-t-3xl border-0 p-0">
                  <SheetHeader className="shrink-0 px-5 pt-5 pb-3 text-left">
                    <SheetTitle>Configura tu viaje</SheetTitle>
                    <SheetDescription>Elige el recorrido y revisa los detalles antes de solicitar.</SheetDescription>
                  </SheetHeader>
                  <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                    <div className="sticky top-0 z-10 bg-popover py-1">
                      <DireccionSearch
                        placeholder={`Buscar dirección para ${
                          puntoActivo === "origen"
                            ? "el origen"
                            : puntoActivo === "destino"
                              ? "el destino"
                              : `la parada ${puntoActivo.parada + 1}`
                        }…`}
                        onSelect={(resultado) => setPunto(puntoActivo, resultado)}
                      />
                    </div>
                    {timingFields}
                    <PuntosRuta />
                    <TarifaEstimada />
                    {notesField}
                    {submitButton}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
          <FieldError errors={[
            errores.origen ? { message: "Fija el origen en el mapa" } : undefined,
            errores.destino ? { message: "Fija el destino en el mapa" } : undefined,
          ]} />
        </Field>

        {isDesktop && notesField}
        {isDesktop && submitButton}
      </FieldGroup>
    </form>
  )
}
