import { z } from "zod"

export const enviarMensajeSchema = z.object({
  reservaId: z.cuid(),
  cuerpo: z
    .string()
    .min(1, "Escribe un mensaje")
    .max(500, "Máximo 500 caracteres"),
})

export type EnviarMensajeInput = z.infer<typeof enviarMensajeSchema>
