import { z } from "zod"

const SPAIN_BOUNDS = {
  minLat: 35.5,
  maxLat: 43.9,
  minLng: -9.5,
  maxLng: 4.5,
} as const
const MAX_ROUTE_KM = 650
const MIN_ROUTE_KM = 0.05

type Coordenada = { lat: number; lng: number }

function haversineKm(a: Coordenada, b: Coordenada) {
  const radius = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * radius * Math.asin(Math.sqrt(value))
}

function routeDistanceKm(points: Coordenada[]) {
  return points.slice(1).reduce(
    (total, point, index) => total + haversineKm(points[index], point),
    0
  )
}

const coordenadaSchema = z.object({
  lat: z.number().min(SPAIN_BOUNDS.minLat, "La ubicación debe estar en España").max(SPAIN_BOUNDS.maxLat, "La ubicación debe estar en España"),
  lng: z.number().min(SPAIN_BOUNDS.minLng, "La ubicación debe estar en España").max(SPAIN_BOUNDS.maxLng, "La ubicación debe estar en España"),
})

function validateRoute(points: Coordenada[], context: z.RefinementCtx) {
  const distance = routeDistanceKm(points)
  if (distance < MIN_ROUTE_KM) {
    context.addIssue({ code: "custom", message: "El origen y el destino deben ser diferentes" })
  }
  if (distance > MAX_ROUTE_KM) {
    context.addIssue({ code: "custom", message: `El recorrido no puede superar ${MAX_ROUTE_KM} km` })
  }
}

export const puntoSchema = coordenadaSchema.extend({
  direccion: z
    .string()
    .min(3, "La dirección es demasiado corta")
    .max(200, "La dirección es demasiado larga"),
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
  .superRefine((data, context) => {
    validateRoute([data.origen, ...data.paradas, data.destino], context)
  })

export type CrearReservaInput = z.infer<typeof crearReservaSchema>

export const estimarTarifaSchema = z.object({
  puntos: z
    .array(coordenadaSchema)
    .min(2, "Se necesitan al menos origen y destino")
    .max(5),
}).superRefine((data, context) => validateRoute(data.puntos, context))

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
