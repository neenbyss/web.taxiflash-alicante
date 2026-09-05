"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { RiMessageLine } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group"

type ConfirmDialogProps = {
  trigger: React.ReactElement
  titulo: string
  descripcion: string
  textoConfirmar?: string
  destructivo?: boolean
  /** Si se define, muestra un textarea para el motivo (opcional u obligatorio). */
  conMotivo?: { placeholder: string; obligatorio: boolean; minimo?: number }
  onConfirmar: (motivo?: string) => void | Promise<unknown>
}

/** Diálogo de confirmación reutilizable (cancelar, rechazar, desactivar…). */
export function ConfirmDialog({
  trigger,
  titulo,
  descripcion,
  textoConfirmar = "Confirmar",
  destructivo = false,
  conMotivo,
  onConfirmar,
}: ConfirmDialogProps) {
  const [abierto, setAbierto] = useState(false)
  const minimo = conMotivo?.obligatorio ? (conMotivo.minimo ?? 3) : 0
  const form = useForm<{ motivo: string }>({
    resolver: zodResolver(
      z.object({
        motivo: z
          .string()
          .trim()
          .min(minimo, `Escribe al menos ${minimo} caracteres`)
          .max(300, "Máximo 300 caracteres"),
      })
    ),
    defaultValues: { motivo: "" },
  })

  const confirmar = form.handleSubmit(async ({ motivo }) => {
    try {
      await onConfirmar(motivo.trim() || undefined)
      setAbierto(false)
      form.reset()
    } catch {
      // La mutación ya mostró su toast de error (onError); el diálogo queda
      // abierto para corregir. Sin este catch, la promesa rechazada quedaba
      // como unhandledRejection en consola.
    }
  })

  return (
    <Dialog
      open={abierto}
      onOpenChange={(next) => {
        setAbierto(next)
        if (!next) form.reset()
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <form onSubmit={confirmar} noValidate className="space-y-4">
          {conMotivo && (
            <Field data-invalid={Boolean(form.formState.errors.motivo)}>
              <FieldLabel htmlFor="confirm-reason">Motivo</FieldLabel>
              <InputGroup className="h-auto items-start">
                <InputGroupAddon className="self-start pt-3">
                  <RiMessageLine aria-hidden />
                </InputGroupAddon>
                <InputGroupTextarea
                  id="confirm-reason"
                  placeholder={conMotivo.placeholder}
                  rows={3}
                  maxLength={300}
                  aria-invalid={Boolean(form.formState.errors.motivo)}
                  {...form.register("motivo")}
                />
              </InputGroup>
              <FieldError errors={[form.formState.errors.motivo]} />
            </Field>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAbierto(false)}
            >
              Volver
            </Button>
            <Button
              type="submit"
              variant={destructivo ? "destructive" : "default"}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Procesando…" : textoConfirmar}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
