"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { RiAlarmWarningLine, RiMessageLine } from "@/components/icons"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FormTextareaControl } from "@/components/forms/form-control"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { trpc } from "@/lib/trpc"
import {
  CATEGORIAS_REPORTE,
  crearReporteSchema,
  type CrearReporteInput,
} from "@/lib/validations/reporte"

type ReporteDialogProps = {
  /** Si se pasa, el reporte queda ligado a esa reserva. */
  reservaId?: string
  /** Texto/estilo del botón que abre el diálogo. */
  variante?: "boton" | "sutil"
}

const ITEMS = CATEGORIAS_REPORTE.map((c) => ({
  value: c.valor,
  label: c.label,
}))

/** Reportar un problema (opcionalmente sobre una reserva). */
export function ReporteDialog({
  reservaId,
  variante = "boton",
}: ReporteDialogProps) {
  const [abierto, setAbierto] = useState(false)
  const form = useForm<CrearReporteInput>({
    resolver: zodResolver(crearReporteSchema),
    defaultValues: { reservaId, categoria: "problema_viaje", descripcion: "" },
  })
  const errores = form.formState.errors

  const crear = trpc.soporte.crear.useMutation({
    onSuccess: () => {
      toast.success("Reporte enviado. Nuestro equipo lo revisará.")
      setAbierto(false)
      form.reset({ reservaId, categoria: "problema_viaje", descripcion: "" })
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger
        render={
          variante === "sutil" ? (
            <Button variant="ghost" size="sm" />
          ) : (
            <Button variant="outline" size="sm" />
          )
        }
      >
        <RiAlarmWarningLine data-icon="inline-start" aria-hidden />
        Reportar un problema
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar un problema</DialogTitle>
          <DialogDescription>
            Cuéntanos qué pasó. Si el reporte es sobre un viaje concreto,
            quedará ligado a él para que podamos revisarlo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => crear.mutate(v))} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errores.categoria)}>
              <FieldLabel>Categoría</FieldLabel>
              <Controller
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => v && field.onChange(v)}
                    items={ITEMS}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errores.categoria]} />
            </Field>
            <FormTextareaControl
              id="reporte-desc"
              label="¿Qué ocurrió?"
              icon={RiMessageLine}
              error={errores.descripcion}
              rows={4}
              placeholder="Describe el problema con el mayor detalle posible…"
              {...form.register("descripcion")}
            />
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? "Enviando…" : "Enviar reporte"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
