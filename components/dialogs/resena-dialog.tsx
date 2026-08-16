"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { StarRating } from "@/components/shared/star-rating"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { trpc } from "@/lib/trpc"
import {
  crearResenaSchema,
  type CrearResenaInput,
} from "@/lib/validations/resena"

/**
 * Diálogo para dejar UNA reseña sobre una reserva finalizada propia.
 * El servidor vuelve a validar propiedad, estado y unicidad.
 */
export function ResenaDialog({ reservaId }: { reservaId: string }) {
  const [abierto, setAbierto] = useState(false)
  const utils = trpc.useUtils()

  const form = useForm<CrearResenaInput>({
    resolver: zodResolver(crearResenaSchema),
    defaultValues: { reservaId, puntuacion: 0, titulo: "", descripcion: "" },
  })
  const errores = form.formState.errors

  const crear = trpc.resenas.crear.useMutation({
    onSuccess: () => {
      toast.success("¡Gracias por tu reseña!")
      setAbierto(false)
      void utils.reservas.detalle.invalidate({ reservaId })
      void utils.reservas.mias.invalidate()
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger render={<Button />}>Dejar reseña</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cómo fue tu viaje?</DialogTitle>
          <DialogDescription>
            Tu opinión ayuda a mejorar el servicio. Solo se permite una reseña
            por reserva.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((values) => crear.mutate(values))}
          noValidate
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errores.puntuacion)}>
              <FieldLabel>Puntuación *</FieldLabel>
              <Controller
                control={form.control}
                name="puntuacion"
                render={({ field }) => (
                  <StarRating valor={field.value} onChange={field.onChange} tamano="lg" />
                )}
              />
              <FieldError errors={[errores.puntuacion]} />
            </Field>
            <Field data-invalid={Boolean(errores.titulo)}>
              <FieldLabel htmlFor="resena-titulo">Título *</FieldLabel>
              <Input
                id="resena-titulo"
                placeholder="Ej.: Excelente servicio"
                {...form.register("titulo")}
              />
              <FieldError errors={[errores.titulo]} />
            </Field>
            <Field data-invalid={Boolean(errores.descripcion)}>
              <FieldLabel htmlFor="resena-descripcion">Descripción *</FieldLabel>
              <Textarea
                id="resena-descripcion"
                rows={4}
                placeholder="Cuéntanos cómo fue el viaje…"
                {...form.register("descripcion")}
              />
              <FieldError errors={[errores.descripcion]} />
            </Field>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? "Enviando…" : "Publicar reseña"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
