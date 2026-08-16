"use client"

import { useState } from "react"

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
import { Textarea } from "@/components/ui/textarea"

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
  const [motivo, setMotivo] = useState("")
  const [enviando, setEnviando] = useState(false)

  // Coincide con el mínimo de los esquemas zod del servidor (3 caracteres).
  const minimo = conMotivo?.obligatorio ? (conMotivo.minimo ?? 3) : 0
  const motivoValido = motivo.trim().length >= minimo

  const confirmar = async () => {
    setEnviando(true)
    try {
      await onConfirmar(motivo.trim() || undefined)
      setAbierto(false)
      setMotivo("")
    } catch {
      // La mutación ya mostró su toast de error (onError); el diálogo queda
      // abierto para corregir. Sin este catch, la promesa rechazada quedaba
      // como unhandledRejection en consola.
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        {conMotivo && (
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={conMotivo.placeholder}
            rows={3}
            maxLength={300}
          />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setAbierto(false)}>
            Volver
          </Button>
          <Button
            variant={destructivo ? "destructive" : "default"}
            disabled={enviando || !motivoValido}
            onClick={confirmar}
          >
            {enviando ? "Procesando…" : textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
