"use client"

import { RiSendPlaneFill } from "@/components/icons"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatearFecha } from "@/lib/formato"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

type ChatReservaProps = {
  reservaId: string
  /** Id del usuario actual, para alinear sus mensajes a la derecha. */
  miUserId: string
  /** El envío solo está activo en reservas aceptadas o en curso. */
  puedeEscribir: boolean
}

// Frases frecuentes para enviar con un toque (facilidad del chat).
const RESPUESTAS_RAPIDAS = [
  "Voy en camino",
  "Llego en 5 minutos",
  "Estoy en la puerta",
  "Ya salí, un momento",
  "Gracias 🙏",
]

/**
 * Chat por reserva — BETA. Actualización por polling (5s); sin garantías de
 * entrega ni cifrado. Accesible: la lista de mensajes es un `log` con
 * `aria-live` para que los lectores de pantalla anuncien los nuevos.
 */
export function ChatReserva({ reservaId, miUserId, puedeEscribir }: ChatReservaProps) {
  const [texto, setTexto] = useState("")
  const finRef = useRef<HTMLDivElement>(null)
  const utils = trpc.useUtils()

  const mensajes = trpc.chat.mensajes.useQuery(
    { reservaId },
    { refetchInterval: 5_000 }
  )
  const enviar = trpc.chat.enviar.useMutation({
    onSuccess: () => {
      setTexto("")
      void utils.chat.mensajes.invalidate({ reservaId })
    },
    onError: (error) => toast.error(error.message),
  })

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes.data?.length])

  const enviarTexto = (valor: string) => {
    const limpio = valor.trim()
    if (limpio && !enviar.isPending) enviar.mutate({ reservaId, cuerpo: limpio })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Chat de la reserva
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
            Beta
          </Badge>
        </CardTitle>
        <CardDescription>
          Funcionalidad experimental: sin garantías de entrega ni cifrado.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div
          className="flex max-h-72 min-h-24 flex-col gap-2 overflow-y-auto rounded-xl bg-muted/30 p-3"
          role="log"
          aria-live="polite"
          aria-label="Mensajes del chat"
        >
          {mensajes.data?.length ? (
            mensajes.data.map((mensaje) => {
              const mio = mensaje.autorId === miUserId
              return (
                <div
                  key={mensaje.id}
                  className={cn("flex flex-col", mio ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm wrap-break-word whitespace-pre-wrap",
                      mio ? "bg-primary text-primary-foreground" : "bg-background border"
                    )}
                  >
                    {mensaje.cuerpo}
                  </div>
                  <span className="mt-0.5 text-[10px] text-muted-foreground">
                    {mio ? "Tú" : mensaje.autor.name} · {formatearFecha(mensaje.createdAt)}
                  </span>
                </div>
              )
            })
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {mensajes.isLoading ? "Cargando…" : "Aún no hay mensajes."}
            </p>
          )}
          <div ref={finRef} />
        </div>

        {puedeEscribir ? (
          <>
            <div className="flex flex-wrap gap-1.5" aria-label="Respuestas rápidas">
              {RESPUESTAS_RAPIDAS.map((frase) => (
                <Button
                  key={frase}
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={enviar.isPending}
                  onClick={() => enviarTexto(frase)}
                >
                  {frase}
                </Button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                enviarTexto(texto)
              }}
            >
              <Input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe un mensaje…"
                maxLength={500}
                aria-label="Mensaje"
              />
              <Button
                type="submit"
                size="icon"
                disabled={enviar.isPending || !texto.trim()}
                aria-label="Enviar mensaje"
              >
                <RiSendPlaneFill aria-hidden />
              </Button>
            </form>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            El chat solo está activo mientras la reserva está aceptada o en curso.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
