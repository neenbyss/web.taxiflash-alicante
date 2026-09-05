"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FormInputControl } from "@/components/forms/form-control"
import { RiCarLine } from "@/components/icons"
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
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { trpc } from "@/lib/trpc"

type ConfirmarAlquilerDialogProps = {
  alquilerId: string
  codigo: string
  onConfirmado?: () => void
}

const confirmarAlquilerSchema = z.object({
  precio: z
    .string()
    .trim()
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      "Indica un precio mayor que cero"
    ),
  choferId: z.string().nullable(),
})

type ConfirmarAlquilerInput = z.infer<typeof confirmarAlquilerSchema>

/** Confirmación manual del precio de un alquiler (y chofer opcional). */
export function ConfirmarAlquilerDialog({
  alquilerId,
  codigo,
  onConfirmado,
}: ConfirmarAlquilerDialogProps) {
  const [abierto, setAbierto] = useState(false)
  const form = useForm<ConfirmarAlquilerInput>({
    resolver: zodResolver(confirmarAlquilerSchema),
    defaultValues: { precio: "", choferId: null },
  })

  const choferes = trpc.usuarios.choferesActivos.useQuery(undefined, {
    enabled: abierto,
  })
  const confirmar = trpc.alquiler.confirmar.useMutation({
    onSuccess: () => {
      toast.success(`Alquiler ${codigo} confirmado. Se avisó al cliente.`)
      setAbierto(false)
      form.reset()
      onConfirmado?.()
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger render={<Button size="sm" />}>
        Confirmar precio
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar alquiler {codigo}</DialogTitle>
          <DialogDescription>
            El cliente recibirá el precio confirmado por email y notificación.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          noValidate
          onSubmit={form.handleSubmit(({ precio, choferId }) =>
            confirmar.mutate({
              alquilerId,
              precioConfirmado: Number(precio),
              choferId: choferId ?? undefined,
            })
          )}
        >
          <FormInputControl
            id="precio-alquiler"
            label="Precio (EUR) *"
            icon={RiCarLine}
            error={form.formState.errors.precio}
            type="number"
            min="1"
            step="0.01"
            placeholder="120.00"
            {...form.register("precio")}
          />
          <Field>
            <FieldLabel>Chofer (opcional)</FieldLabel>
            <Controller
              control={form.control}
              name="choferId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={(choferes.data ?? []).map((chofer) => ({
                    value: chofer.id,
                    label: chofer.name,
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Asignar más tarde" />
                  </SelectTrigger>
                  <SelectContent>
                    {choferes.data?.map((chofer) => (
                      <SelectItem key={chofer.id} value={chofer.id}>
                        {chofer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAbierto(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={confirmar.isPending}>
              {confirmar.isPending ? "Confirmando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
