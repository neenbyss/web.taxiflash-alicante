import { z } from "zod"

import { telefonoSchema } from "@/lib/validations/reserva"

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "Indica tu contraseña"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registroEmailSchema = z.object({
  email: z.email("Email inválido").max(254),
})

export const registroCodigoSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Introduce los 6 dígitos"),
})

export const registroSchema = z
  .object({
    name: z.string().min(2, "Indica tu nombre").max(80),
    email: z.email("Email inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(128)
      .regex(/[a-zA-Z]/, "Debe incluir letras")
      .regex(/\d/, "Debe incluir al menos un número"),
    confirmPassword: z.string(),
    telefono: telefonoSchema.optional().or(z.literal("")),
    // Honeypot anti-bot: campo oculto que debe llegar vacío.
    website: z.string().max(0, "Solicitud inválida").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type RegistroInput = z.infer<typeof registroSchema>

export const perfilSchema = z.object({
  name: z.string().min(2, "Indica tu nombre").max(80),
  telefono: telefonoSchema.optional().or(z.literal("")),
  direccionFrecuente: z.string().max(200, "Máximo 200 caracteres").optional(),
  vehiculoPreferido: z.string().max(60).optional(),
  notasPreferencias: z.string().max(300).optional(),
})

export type PerfilInput = z.infer<typeof perfilSchema>
