import { z } from "zod"

import { telefonoSchema } from "@/lib/validations/reserva"

export const crearUsuarioAdminSchema = z.object({
  name: z.string().min(2, "Indica el nombre").max(80),
  email: z.email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres").max(128),
  role: z.enum(["CLIENTE", "CHOFER", "ADMIN"]),
  telefono: telefonoSchema.optional().or(z.literal("")),
})

export type CrearUsuarioAdminInput = z.infer<typeof crearUsuarioAdminSchema>

export const actualizarUsuarioAdminSchema = z.object({
  userId: z.cuid(),
  name: z.string().min(2).max(80).optional(),
  role: z.enum(["CLIENTE", "CHOFER", "ADMIN"]).optional(),
  telefono: telefonoSchema.optional().or(z.literal("")),
  activo: z.boolean().optional(),
})

export const filtrosUsuariosSchema = z.object({
  role: z.enum(["CLIENTE", "CHOFER", "ADMIN"]).optional(),
  busqueda: z.string().max(100).optional(),
  incluirInactivos: z.boolean().default(true),
  cursor: z.cuid().optional(),
  limite: z.number().int().min(1).max(100).default(20),
})

export const setRolPermisosSchema = z.object({
  role: z.enum(["CLIENTE", "CHOFER", "ADMIN"]),
  permisoIds: z.array(z.cuid()),
})

export const setUserPermisoSchema = z.object({
  userId: z.cuid(),
  permisoId: z.cuid(),
  // true = conceder extra, false = revocar del rol, null = quitar override
  concedido: z.boolean().nullable(),
})
