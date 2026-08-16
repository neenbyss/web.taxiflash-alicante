import { z } from "zod"

export const crearResenaSchema = z.object({
  reservaId: z.cuid(),
  puntuacion: z
    .number({ error: "Selecciona una puntuación" })
    .int()
    .min(1, "Selecciona una puntuación")
    .max(5),
  titulo: z.string().min(3, "Mínimo 3 caracteres").max(80, "Máximo 80 caracteres"),
  descripcion: z
    .string()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")
    .max(1000, "Máximo 1000 caracteres"),
})

export type CrearResenaInput = z.infer<typeof crearResenaSchema>
