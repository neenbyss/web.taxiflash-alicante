"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/lib/trpc"
import {
  crearAlquilerSchema,
  type CrearAlquilerInput,
} from "@/lib/validations/alquiler"

/**
 * Solicitud de alquiler entre ciudades o por horas. Requiere sesión: el
 * contacto se toma del perfil. No calcula tarifa: el precio lo confirma
 * manualmente el equipo (estado "a confirmar").
 */
export function AlquilerForm() {
  const router = useRouter()
  const form = useForm<CrearAlquilerInput>({
    resolver: zodResolver(crearAlquilerSchema),
    defaultValues: {
      ciudadOrigen: "",
      ciudadDestino: "",
      modalidad: "interurbano",
      notas: "",
    },
  })
  const modalidad = useWatch({ control: form.control, name: "modalidad" })
  const errores = form.formState.errors

  const crear = trpc.alquiler.crear.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Solicitud ${data.codigo} registrada. Te confirmaremos el precio a la brevedad.`
      )
      form.reset()
      router.push("/customer/rentals")
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <form
      onSubmit={form.handleSubmit((values) => crear.mutate(values))}
      noValidate
    >
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInputControl
            label="Ciudad de origen *"
            icon={RiBuildingLine}
            error={errores.ciudadOrigen}
            id="alq-origen"
            {...form.register("ciudadOrigen")}
          />
          <FormInputControl
            label="Ciudad de destino *"
            icon={RiBuildingLine}
            error={errores.ciudadDestino}
            id="alq-destino"
            {...form.register("ciudadDestino")}
          />
        </div>

        <Field>
          <FieldLabel htmlFor="alq-modalidad">Modalidad</FieldLabel>
          <Tabs
            value={modalidad}
            onValueChange={(valor) =>
              form.setValue(
                "modalidad",
                valor as CrearAlquilerInput["modalidad"]
              )
            }
          >
            <TabsList className="w-full" id="alq-modalidad">
              <TabsTrigger value="interurbano" className="flex-1">
                Viaje interurbano
              </TabsTrigger>
              <TabsTrigger value="por_horas" className="flex-1">
                Por horas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="fecha"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Fecha y hora *</FieldLabel>
                <DateTimePicker
                  value={field.value ?? null}
                  onChange={(value) => field.onChange(value ?? undefined)}
                  placeholder="Seleccionar fecha y hora"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {modalidad === "por_horas" && (
            <FormInputControl
              label="Horas *"
              icon={RiTimeLine}
              error={errores.horas}
              id="alq-horas"
              type="number"
              min={1}
              max={24}
              {...form.register("horas", { valueAsNumber: true })}
            />
          )}
        </div>

        <FormTextareaControl
          label="Notas"
          icon={RiFileTextLine}
          error={errores.notas}
          description="El precio se confirma manualmente: recibirás la propuesta en tu portal (y por email si está configurado)."
          id="alq-notas"
          rows={3}
          {...form.register("notas")}
        />

        <Button type="submit" size="lg" disabled={crear.isPending}>
          {crear.isPending ? "Enviando…" : "Solicitar presupuesto"}
        </Button>
      </FieldGroup>
    </form>
  )
}
import { DateTimePicker } from "@/components/forms/date-time-picker"
import {
  FormInputControl,
  FormTextareaControl,
} from "@/components/forms/form-control"
import { RiBuildingLine, RiFileTextLine, RiTimeLine } from "@/components/icons"
