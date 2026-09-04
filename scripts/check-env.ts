import "dotenv/config"
import { z } from "zod"

const booleanString = z.enum(["true", "false"])
const positiveNumberString = z
  .string()
  .refine(
    (value) => Number.isFinite(Number(value)) && Number(value) > 0,
    "debe ser un número positivo"
  )

const schema = z
  .object({
    DATABASE_URL: z.url().startsWith("postgresql://"),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(12),
    POSTGRES_DB: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    NEXT_PUBLIC_APP_URL: z.url(),
    TRUSTED_PROXY_HEADER: z.enum(["x-real-ip", "cf-connecting-ip"]).optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    EMAIL_PROVIDER: z.enum(["resend", "smtp", "disabled"]),
    RESEND_API_KEY: z.string().optional(),
    RESEND_API: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65_535),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: booleanString,
    EMAIL_FROM: z.string().min(3),
    TARIFA_BASE: positiveNumberString,
    TARIFA_POR_KM: positiveNumberString,
    TARIFA_MINIMA: positiveNumberString,
    SEED_ADMIN_EMAIL: z.email(),
    SEED_ADMIN_PASSWORD: z.string().min(8),
  })
  .superRefine((env, ctx) => {
    if (
      new URL(env.BETTER_AUTH_URL).origin !==
      new URL(env.NEXT_PUBLIC_APP_URL).origin
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["NEXT_PUBLIC_APP_URL"],
        message: "debe tener el mismo origen que BETTER_AUTH_URL",
      })
    }
    if (Boolean(env.GOOGLE_CLIENT_ID) !== Boolean(env.GOOGLE_CLIENT_SECRET)) {
      ctx.addIssue({
        code: "custom",
        path: ["GOOGLE_CLIENT_ID"],
        message:
          "GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET deben configurarse juntos",
      })
    }
    if (env.SMTP_USER && !env.SMTP_PASS) {
      ctx.addIssue({
        code: "custom",
        path: ["SMTP_PASS"],
        message: "es obligatorio cuando SMTP_USER está configurado",
      })
    }
    if (
      env.EMAIL_PROVIDER === "resend" &&
      !(env.RESEND_API_KEY || env.RESEND_API)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["RESEND_API_KEY"],
        message: "es obligatoria cuando EMAIL_PROVIDER=resend",
      })
    }
    if (env.EMAIL_PROVIDER === "smtp" && !env.SMTP_HOST) {
      ctx.addIssue({
        code: "custom",
        path: ["SMTP_HOST"],
        message: "es obligatorio cuando EMAIL_PROVIDER=smtp",
      })
    }
  })

const result = schema.safeParse(process.env)

if (!result.success) {
  console.error("Configuración inválida:")
  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join(".") || "env"}: ${issue.message}`)
  }
  process.exit(1)
}

const developmentWarnings = [
  result.data.POSTGRES_PASSWORD === "taxiflash_dev_password"
    ? "POSTGRES_PASSWORD usa el valor local por defecto"
    : null,
  ["Admin123!", "cambia-esta-clave"].includes(result.data.SEED_ADMIN_PASSWORD)
    ? "SEED_ADMIN_PASSWORD usa una clave exclusiva de desarrollo"
    : null,
].filter(Boolean)

console.log("Configuración válida. No se imprimieron secretos.")
for (const warning of developmentWarnings) console.warn(`Aviso: ${warning}.`)
