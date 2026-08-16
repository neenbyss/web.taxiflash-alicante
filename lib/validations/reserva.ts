import { z } from "zod"

export const puntoSchema = z.object({
  direccion: z
    .string()
    .min(3, "La dirección es demasiado corta")
    .max(200, "La dirección es demasiado larga"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export type PuntoRuta = z.infer<typeof puntoSchema>

export const telefonoSchema = z
  .string()
  .regex(/^[+\d][\d\s()-]{5,19}$/, "Teléfono inválido")

// El contacto (nombre, email, teléfono) NO se pide: se toma del perfil del
// usuario autenticado en el servidor. Solo requiere sesión iniciada.
export const crearReservaSchema = z
  .object({
    tipo: z.enum(["INMEDIATA", "PROGRAMADA"]),
    fechaProgramada: z.coerce.date<Date>().optional(),
    origen: puntoSchema,
    destino: puntoSchema,
    paradas: z.array(puntoSchema).max(3, "Máximo 3 paradas intermedias"),
    notas: z.string().max(500, "Máximo 500 caracteres").optional(),
  })
  .refine(
    (data) => data.tipo === "INMEDIATA" || data.fechaProgramada instanceof Date,
    { message: "Indica la fecha y hora del viaje", path: ["fechaProgramada"] }
  )
  .refine(
    (data) =>
      data.tipo === "INMEDIATA" ||
      (data.fechaProgramada && data.fechaProgramada.getTime() > Date.now()),
    { message: "La fecha debe ser futura", path: ["fechaProgramada"] }
  )

export type CrearReservaInput = z.infer<typeof crearReservaSchema>

export const estimarTarifaSchema = z.object({
  puntos: z
    .array(z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }))
    .min(2, "Se necesitan al menos origen y destino")
    .max(5),
})

export const cancelarReservaSchema = z.object({
  reservaId: z.cuid(),
  motivo: z.string().max(300).optional(),
})

export const rechazarReservaSchema = z.object({
  reservaId: z.cuid(),
  motivo: z.string().min(3, "Indica el motivo").max(300),
})

export const asignarReservaSchema = z.object({
  reservaId: z.cuid(),
  choferId: z.cuid(),
})

export const filtrosReservasAdminSchema = z.object({
  estado: z
    .enum(["PENDIENTE", "ACEPTADA", "EN_CURSO", "FINALIZADA", "CANCELADA", "RECHAZADA"])
    .optional(),
  clienteId: z.cuid().optional(),
  choferId: z.cuid().optional(),
  busqueda: z.string().max(100).optional(),
  desde: z.coerce.date<Date>().optional(),
  hasta: z.coerce.date<Date>().optional(),
  cursor: z.cuid().optional(),
  limite: z.number().int().min(1).max(100).default(20),
})
