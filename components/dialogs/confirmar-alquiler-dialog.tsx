"use client"

import { useState } from "react"
import { toast } from "sonner"

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
import { Input } from "@/components/ui/input"
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

/** Confirmación manual del precio de un alquiler (y chofer opcional). */
export function ConfirmarAlquilerDialog({
  alquilerId,
  codigo,
  onConfirmado,
}: ConfirmarAlquilerDialogProps) {
  const [abierto, setAbierto] = useState(false)
  const [precio, setPrecio] = useState("")
  const [choferId, setChoferId] = useState<string | null>(null)

  const choferes = trpc.usuarios.choferesActivos.useQuery(undefined, {
    enabled: abierto,
  })
  const confirmar = trpc.alquiler.confirmar.useMutation({
    onSuccess: () => {
      toast.success(`Alquiler ${codigo} confirmado. Se avisó al cliente.`)
      setAbierto(false)
      setPrecio("")
      setChoferId(null)
      onConfirmado?.()
    },
    onError: (error) => toast.error(error.message),
  })

  const precioNumero = Number(precio)
  const precioValido = Number.isFinite(precioNumero) && precioNumero > 0

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger render={<Button size="sm" />}>Confirmar precio</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar alquiler {codigo}</DialogTitle>
          <DialogDescription>
            El cliente recibirá el precio confirmado por email y notificación.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="precio-alquiler">Precio (EUR) *</FieldLabel>
            <Input
              id="precio-alquiler"
              type="number"
              min="1"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="120.00"
            />
          </Field>
          <Field>
            <FieldLabel>Chofer (opcional)</FieldLabel>
            <Select
              value={choferId}
              onValueChange={(valor) => setChoferId(valor as string | null)}
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
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAbierto(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!precioValido || confirmar.isPending}
            onClick={() =>
              confirmar.mutate({
                alquilerId,
                precioConfirmado: precioNumero,
                choferId: choferId ?? undefined,
              })
            }
          >
            {confirmar.isPending ? "Confirmando…" : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
