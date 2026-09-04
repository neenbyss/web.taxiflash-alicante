import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { emailOTP } from "better-auth/plugins"

import {
  ONBOARDING_COOKIE,
  readCookieHeader,
  verifyOnboardingProof,
} from "@/lib/auth-onboarding"
import { getClientIp } from "@/lib/rate-limit"
import { db } from "@/server/db"
import { enviarEmail } from "@/server/services/email.service"

const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
)
const trustedProxyHeader =
  process.env.TRUSTED_PROXY_HEADER?.trim().toLowerCase()

// Máximo de cuentas nuevas por IP en 24h (anti-bot).
const MAX_CUENTAS_POR_IP_24H = 5

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: process.env.BETTER_AUTH_URL
    ? [process.env.BETTER_AUTH_URL]
    : [],
  advanced:
    trustedProxyHeader === "x-real-ip" ||
    trustedProxyHeader === "cf-connecting-ip"
      ? { ipAddress: { ipAddressHeaders: [trustedProxyHeader] } }
      : undefined,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  plugins: [
    emailOTP({
      disableSignUp: true,
      otpLength: 6,
      expiresIn: 10 * 60,
      allowedAttempts: 5,
      storeOTP: "hashed",
      rateLimit: { window: 5 * 60, max: 3 },
      async sendVerificationOTP({ email, otp, type }) {
        const reset = type === "forget-password"
        // No esperamos la entrega para que el tiempo de respuesta no revele si
        // el correo existe. En el servidor Node el trabajo continúa en segundo plano.
        void enviarEmail({
          to: email,
          subject: `${otp} es tu código de TaxiFlash`,
          titulo: reset ? "Restablece tu contraseña" : "Confirma tu acceso",
          lineas: [
            reset
              ? "Introduce este código para crear una contraseña nueva."
              : "Introduce este código para confirmar que el correo te pertenece.",
            "El código caduca en 10 minutos y solo se puede utilizar una vez.",
          ],
          codigo: otp,
          required: true,
        }).catch(() => undefined)
      },
    }),
  ],
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
      "/email-otp/request-password-reset": { window: 300, max: 3 },
      "/email-otp/reset-password": { window: 300, max: 5 },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Anti-bot: límite de cuentas nuevas por IP.
      if (ctx.path === "/sign-up/email") {
        const email = (
          ctx.body as { email?: string } | undefined
        )?.email?.toLowerCase()
        const proof = verifyOnboardingProof(
          readCookieHeader(
            ctx.request?.headers.get("cookie") ?? null,
            ONBOARDING_COOKIE
          )
        )
        if (!email || proof?.email !== email) {
          throw new APIError("FORBIDDEN", {
            message: "Verifica tu correo antes de crear la cuenta.",
          })
        }
        const ip = ctx.request ? getClientIp(ctx.request.headers) : "unknown"
        if (ip !== "unknown") {
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
              message:
                "Esta cuenta está desactivada. Contacta al administrador.",
            })
          }
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const ip = ctx.request ? getClientIp(ctx.request.headers) : "unknown"
        const email = (
          ctx.body as { email?: string } | undefined
        )?.email?.toLowerCase()
        if (email) {
          await db.user.updateMany({
            where: { email },
            data: { emailVerified: true },
          })
        }
        ctx.setCookie(ONBOARDING_COOKIE, "", { path: "/", maxAge: 0 })
        if (ip !== "unknown") await db.registroCuenta.create({ data: { ip } })
      }
    }),
  },
})

export type Session = typeof auth.$Infer.Session
export type SessionUser = Session["user"]

export const isGoogleAuthEnabled = googleEnabled
