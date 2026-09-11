import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { emailOTP } from "better-auth/plugins"
import { after } from "next/server"

import { getAuthOrigins } from "@/lib/auth-origins"
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
const trustedProxyIps = (process.env.TRUSTED_PROXY_IPS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
const authOrigins = getAuthOrigins()
const authFallback = process.env.BETTER_AUTH_URL ?? authOrigins[0]
const authProtocol =
  authFallback && new URL(authFallback).protocol === "http:" ? "http" : "https"

// Máximo de cuentas nuevas por IP en 24h (anti-bot).
const MAX_CUENTAS_POR_IP_24H = 5

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  // Resuelve el origen por petición, pero solo entre hosts declarados. Esto
  // permite probar desde localhost y desde un teléfono en la LAN sin aceptar
  // hosts arbitrarios ni desactivar la protección CSRF.
  baseURL:
    authOrigins.length > 0
      ? {
          allowedHosts: authOrigins.map((origin) => new URL(origin).host),
          // En el build standalone NODE_ENV es production. Declarar "http" es
          // necesario durante la prueba LAN para que la cookie no lleve Secure;
          // al publicar, BETTER_AUTH_URL debe ser HTTPS y esto cambia a "https".
          protocol: authProtocol,
          fallback: authFallback,
        }
      : undefined,
  trustedOrigins: authOrigins,
  advanced:
    trustedProxyHeader === "x-real-ip" ||
    trustedProxyHeader === "cf-connecting-ip" ||
    trustedProxyHeader === "x-forwarded-for"
      ? {
          ipAddress: {
            ipAddressHeaders: [trustedProxyHeader],
            ...(trustedProxyIps.length > 0
              ? { trustedProxies: trustedProxyIps }
              : {}),
          },
        }
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
        // el correo existe. after mantiene la tarea viva también en Vercel.
        after(() =>
          enviarEmail({
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
          })
            .then(() => undefined)
            .catch(() => undefined)
        )
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
      if (ctx.path === "/sign-up/email" && ctx.context.newSession) {
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
