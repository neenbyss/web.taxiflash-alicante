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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { trpc } from "@/lib/trpc"

type AsignarReservaDialogProps = {
  reservaId: string
  codigo: string
  onAsignada?: () => void
}

/** Asignación manual de una reserva pendiente a un chofer concreto. */
export function AsignarReservaDialog({
  reservaId,
  codigo,
  onAsignada,
}: AsignarReservaDialogProps) {
  const [abierto, setAbierto] = useState(false)
  const [choferId, setChoferId] = useState<string | null>(null)

  const choferes = trpc.usuarios.choferesActivos.useQuery(undefined, {
    enabled: abierto,
  })
  const asignar = trpc.reservas.asignar.useMutation({
    onSuccess: () => {
      toast.success(`Reserva ${codigo} asignada. Se notificó al chofer y al cliente.`)
      setAbierto(false)
      setChoferId(null)
      onAsignada?.()
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger render={<Button size="sm" />}>Asignar chofer</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar reserva {codigo}</DialogTitle>
          <DialogDescription>
            El chofer recibirá una notificación y un email con el encargo; el
            cliente será avisado de la confirmación.
          </DialogDescription>
        </DialogHeader>
        <Select
          value={choferId}
          onValueChange={(valor) => setChoferId(valor as string | null)}
          items={(choferes.data ?? []).map((chofer) => ({
            value: chofer.id,
            label: chofer.name,
          }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un chofer…" />
          </SelectTrigger>
          <SelectContent>
            {choferes.data?.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No hay choferes activos.
              </p>
            )}
            {choferes.data?.map((chofer) => (
              <SelectItem key={chofer.id} value={chofer.id}>
                {chofer.name}
                {chofer.telefono ? ` · ${chofer.telefono}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAbierto(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!choferId || asignar.isPending}
            onClick={() => choferId && asignar.mutate({ reservaId, choferId })}
          >
            {asignar.isPending ? "Asignando…" : "Asignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
