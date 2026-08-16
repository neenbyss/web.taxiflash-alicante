import { z } from "zod"

// El contacto se toma del perfil del usuario autenticado (no se pide aquí).
export const crearAlquilerSchema = z
  .object({
    ciudadOrigen: z.string().min(2, "Indica la ciudad de origen").max(80),
    ciudadDestino: z.string().min(2, "Indica la ciudad de destino").max(80),
    fecha: z.coerce.date<Date>({ error: "Indica la fecha del servicio" }),
    modalidad: z.enum(["interurbano", "por_horas"]),
    horas: z.number().int().min(1).max(24).optional(),
    notas: z.string().max(500).optional(),
  })
  .refine((d) => d.fecha.getTime() > Date.now(), {
    message: "La fecha debe ser futura",
    path: ["fecha"],
  })
  .refine((d) => d.modalidad !== "por_horas" || typeof d.horas === "number", {
    message: "Indica cuántas horas necesitas",
    path: ["horas"],
  })

export type CrearAlquilerInput = z.infer<typeof crearAlquilerSchema>

export const confirmarAlquilerSchema = z.object({
  alquilerId: z.cuid(),
  precioConfirmado: z
    .number({ error: "Indica el precio" })
    .positive("El precio debe ser mayor que 0")
    .max(100000),
  choferId: z.cuid().optional(),
})
