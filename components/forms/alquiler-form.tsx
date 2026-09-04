"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
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
    <form onSubmit={form.handleSubmit((values) => crear.mutate(values))} noValidate>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errores.ciudadOrigen)}>
            <FieldLabel htmlFor="alq-origen">Ciudad de origen *</FieldLabel>
            <Input id="alq-origen" {...form.register("ciudadOrigen")} />
            <FieldError errors={[errores.ciudadOrigen]} />
          </Field>
          <Field data-invalid={Boolean(errores.ciudadDestino)}>
            <FieldLabel htmlFor="alq-destino">Ciudad de destino *</FieldLabel>
            <Input id="alq-destino" {...form.register("ciudadDestino")} />
            <FieldError errors={[errores.ciudadDestino]} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="alq-modalidad">Modalidad</FieldLabel>
          <Tabs
            value={modalidad}
            onValueChange={(valor) =>
              form.setValue("modalidad", valor as CrearAlquilerInput["modalidad"])
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
          <Field data-invalid={Boolean(errores.fecha)}>
            <FieldLabel htmlFor="alq-fecha">Fecha y hora *</FieldLabel>
            <Input
              id="alq-fecha"
              type="datetime-local"
              onChange={(e) =>
                form.setValue(
                  "fecha",
                  e.target.value ? new Date(e.target.value) : (undefined as unknown as Date),
                  { shouldValidate: form.formState.isSubmitted }
                )
              }
            />
            <FieldError errors={[errores.fecha]} />
          </Field>
          {modalidad === "por_horas" && (
            <Field data-invalid={Boolean(errores.horas)}>
              <FieldLabel htmlFor="alq-horas">Horas *</FieldLabel>
              <Input
                id="alq-horas"
                type="number"
                min={1}
                max={24}
                {...form.register("horas", { valueAsNumber: true })}
              />
              <FieldError errors={[errores.horas]} />
            </Field>
          )}
        </div>

        <Field data-invalid={Boolean(errores.notas)}>
          <FieldLabel htmlFor="alq-notas">Notas</FieldLabel>
          <Textarea id="alq-notas" rows={3} {...form.register("notas")} />
          <FieldDescription>
            El precio se confirma manualmente: recibirás la propuesta en tu
            portal (y por email si está configurado).
          </FieldDescription>
          <FieldError errors={[errores.notas]} />
        </Field>

        <Button type="submit" size="lg" disabled={crear.isPending}>
          {crear.isPending ? "Enviando…" : "Solicitar presupuesto"}
        </Button>
      </FieldGroup>
    </form>
  )
}
