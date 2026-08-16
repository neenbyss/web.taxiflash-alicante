import { z } from "zod"

export const CATEGORIAS_REPORTE = [
  { valor: "problema_viaje", label: "Problema con el viaje" },
  { valor: "chofer", label: "Conducta del chofer" },
  { valor: "cliente", label: "Conducta del cliente" },
  { valor: "cobro", label: "Cobro o tarifa" },
  { valor: "app", label: "Fallo de la aplicación" },
  { valor: "otro", label: "Otro" },
] as const

const valores = CATEGORIAS_REPORTE.map((c) => c.valor) as [string, ...string[]]

export const crearReporteSchema = z.object({
  reservaId: z.cuid().optional(),
  categoria: z.enum(valores),
  descripcion: z
    .string()
    .min(10, "Describe el problema (mínimo 10 caracteres)")
    .max(1000, "Máximo 1000 caracteres"),
})

export type CrearReporteInput = z.infer<typeof crearReporteSchema>

export const gestionarReporteSchema = z.object({
  reporteId: z.cuid(),
  estado: z.enum(["ABIERTO", "EN_REVISION", "RESUELTO"]),
  notaAdmin: z.string().max(1000).optional(),
})
