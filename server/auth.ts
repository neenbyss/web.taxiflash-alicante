import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { APIError, createAuthMiddleware } from "better-auth/api"

import { getClientIp } from "@/lib/rate-limit"
import { db } from "@/server/db"

const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
)

// Máximo de cuentas nuevas por IP en 24h (anti-bot).
const MAX_CUENTAS_POR_IP_24H = 5

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : undefined,
  account: {
    // Account linking: si el email de Google coincide con una cuenta de
    // credenciales existente, se vinculan en el mismo usuario.
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  user: {
    additionalFields: {
      // input:false impide que el cliente fije rol/estado al registrarse.
      role: { type: "string", defaultValue: "CLIENTE", input: false },
      activo: { type: "boolean", defaultValue: true, input: false },
      telefono: { type: "string", required: false },
      vehiculoPreferido: { type: "string", required: false },
      notasPreferencias: { type: "string", required: false },
    },
  },
  // Rate limiting integrado de better-auth (en memoria) para endpoints de auth.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    customRules: {
      "/sign-up/email": { window: 3600, max: 5 },
      "/sign-in/email": { window: 60, max: 10 },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Anti-bot: límite de cuentas nuevas por IP.
      if (ctx.path === "/sign-up/email") {
        const ip = ctx.request ? getClientIp(ctx.request.headers) : "unknown"
        const desde = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const cuentas = await db.registroCuenta.count({
          where: { ip, createdAt: { gte: desde } },
        })
        if (cuentas >= MAX_CUENTAS_POR_IP_24H) {
          throw new APIError("TOO_MANY_REQUESTS", {
            message:
              "Se alcanzó el límite de registros desde esta red. Intenta más tarde.",
          })
        }
      }
      // Cuentas desactivadas por el admin no pueden iniciar sesión.
      if (ctx.path === "/sign-in/email") {
        const email = (ctx.body as { email?: string } | undefined)?.email
        if (email) {
          const user = await db.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { activo: true },
          })
          if (user && !user.activo) {
            throw new APIError("FORBIDDEN", {
              message: "Esta cuenta está desactivada. Contacta al administrador.",
            })
          }
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const ip = ctx.request ? getClientIp(ctx.request.headers) : "unknown"
        await db.registroCuenta.create({ data: { ip } })
      }
    }),
  },
})

export type Session = typeof auth.$Infer.Session
export type SessionUser = Session["user"]

export const isGoogleAuthEnabled = googleEnabled
