import { randomBytes, randomInt } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { isTrustedAuthOrigin } from "@/lib/auth-origins"
import {
  authDigest,
  createOnboardingProof,
  ONBOARDING_COOKIE,
  ONBOARDING_TTL_SECONDS,
  safeEqualDigest,
} from "@/lib/auth-onboarding"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { db } from "@/server/db"
import { enviarEmail } from "@/server/services/email.service"

const emailSchema = z.object({ email: z.email().max(254) })
const codeSchema = emailSchema.extend({ code: z.string().regex(/^\d{6}$/) })
const OTP_PREFIX = "taxiflash-register-otp:"
const LINK_PREFIX = "taxiflash-register-link:"

const otpIdentifier = (email: string) => `${OTP_PREFIX}${authDigest(email)}`
const linkIdentifier = (token: string) => `${LINK_PREFIX}${authDigest(token)}`

function sameOrigin(request: NextRequest): boolean {
  return isTrustedAuthOrigin(request.headers.get("origin"))
}

function rateLimited(request: NextRequest, email: string) {
  const ip = getClientIp(request.headers)
  const byIp = checkRateLimit({
    key: "auth.register.email.ip",
    actor: ip,
    limit: ip === "unknown" ? 20 : 5,
    windowMs: 10 * 60_000,
  })
  const byEmail = checkRateLimit({
    key: "auth.register.email.address",
    actor: authDigest(email),
    limit: 3,
    windowMs: 10 * 60_000,
  })
  return !byIp.ok || !byEmail.ok
}

function verificationRateLimited(request: NextRequest, email: string) {
  const ip = getClientIp(request.headers)
  const byIp = checkRateLimit({
    key: "auth.register.verify.ip",
    actor: ip,
    limit: ip === "unknown" ? 50 : 15,
    windowMs: 10 * 60_000,
  })
  const byEmail = checkRateLimit({
    key: "auth.register.verify.address",
    actor: authDigest(email),
    limit: 10,
    windowMs: 10 * 60_000,
  })
  return !byIp.ok || !byEmail.ok
}

function setProofCookie(response: NextResponse, email: string) {
  response.cookies.set(ONBOARDING_COOKIE, createOnboardingProof(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false,
    path: "/",
    maxAge: ONBOARDING_TTL_SECONDS,
  })
}

async function consumeChallenge(email: string) {
  await db.verification.deleteMany({
    where: {
      OR: [
        { identifier: otpIdentifier(email) },
        { identifier: { startsWith: LINK_PREFIX }, value: email },
      ],
    },
  })
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { message: "Origen no permitido." },
      { status: 403 }
    )
  if (Number(request.headers.get("content-length") ?? 0) > 2_048)
    return NextResponse.json(
      { message: "Solicitud demasiado grande." },
      { status: 413 }
    )
  const parsed = emailSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success)
    return NextResponse.json(
      { message: "Introduce un correo válido." },
      { status: 400 }
    )
  const email = parsed.data.email.trim().toLowerCase()
  if (rateLimited(request, email)) {
    return NextResponse.json(
      { message: "Has solicitado demasiados códigos. Espera unos minutos." },
      { status: 429, headers: { "Retry-After": "600" } }
    )
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0")
  const token = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + ONBOARDING_TTL_SECONDS * 1000)
  await db.$transaction(async (tx) => {
    await tx.verification.deleteMany({
      where: {
        OR: [
          { identifier: otpIdentifier(email) },
          { identifier: { startsWith: LINK_PREFIX }, value: email },
        ],
      },
    })
    await tx.verification.createMany({
      data: [
        {
          identifier: otpIdentifier(email),
          value: JSON.stringify({ digest: authDigest(code), attempts: 0 }),
          expiresAt,
        },
        { identifier: linkIdentifier(token), value: email, expiresAt },
      ],
    })
  })

  try {
    await enviarEmail({
      to: email,
      subject: `${code} es tu código de TaxiFlash`,
      titulo: "Confirma tu correo",
      lineas: [
        "Usa este código para continuar creando tu cuenta. Caduca en 10 minutos.",
        "También puedes continuar con el enlace seguro de un solo uso.",
      ],
      codigo: code,
      urlAccion: {
        texto: "Verificar mi correo",
        href: `/api/onboarding/register?token=${encodeURIComponent(token)}`,
      },
      required: true,
    })
  } catch {
    await consumeChallenge(email)
    return NextResponse.json(
      {
        message:
          "No pudimos enviar el correo. Revisa la configuración e inténtalo de nuevo.",
      },
      { status: 503 }
    )
  }
  return NextResponse.json({
    message:
      "Si el correo puede recibir mensajes, enviaremos un código y un enlace de acceso.",
  })
}

export async function PUT(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { message: "Origen no permitido." },
      { status: 403 }
    )
  if (Number(request.headers.get("content-length") ?? 0) > 2_048)
    return NextResponse.json(
      { message: "Solicitud demasiado grande." },
      { status: 413 }
    )
  const parsed = codeSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success)
    return NextResponse.json(
      { message: "El código debe tener 6 dígitos." },
      { status: 400 }
    )
  const email = parsed.data.email.trim().toLowerCase()
  if (verificationRateLimited(request, email)) {
    return NextResponse.json(
      { message: "Demasiados intentos. Espera antes de volver a probar." },
      { status: 429, headers: { "Retry-After": "600" } }
    )
  }
  const record = await db.verification.findFirst({
    where: { identifier: otpIdentifier(email) },
    orderBy: { createdAt: "desc" },
  })
  if (!record || record.expiresAt <= new Date()) {
    if (record) await consumeChallenge(email)
    return NextResponse.json(
      { message: "El código ha caducado. Solicita uno nuevo." },
      { status: 400 }
    )
  }

  let stored: { digest: string; attempts: number }
  try {
    stored = JSON.parse(record.value) as { digest: string; attempts: number }
  } catch {
    await consumeChallenge(email)
    return NextResponse.json(
      { message: "El código no es válido." },
      { status: 400 }
    )
  }
  if (stored.attempts >= 5) {
    await consumeChallenge(email)
    return NextResponse.json(
      { message: "Demasiados intentos. Solicita un código nuevo." },
      { status: 429 }
    )
  }
  if (!safeEqualDigest(stored.digest, authDigest(parsed.data.code))) {
    await db.verification.update({
      where: { id: record.id },
      data: {
        value: JSON.stringify({ ...stored, attempts: stored.attempts + 1 }),
      },
    })
    return NextResponse.json(
      { message: "El código no es válido." },
      { status: 400 }
    )
  }

  const consumed = await db.verification.deleteMany({
    where: { id: record.id },
  })
  if (consumed.count !== 1)
    return NextResponse.json(
      { message: "El código ya fue utilizado." },
      { status: 409 }
    )
  await db.verification.deleteMany({
    where: { identifier: { startsWith: LINK_PREFIX }, value: email },
  })
  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  })
  if (existing) return NextResponse.json({ existing: true })

  const response = NextResponse.json({ verified: true })
  setProofCookie(response, email)
  return response
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const fallback = new URL("/register?error=enlace-invalido", request.url)
  if (!token || token.length > 128) return NextResponse.redirect(fallback)
  const record = await db.verification.findFirst({
    where: { identifier: linkIdentifier(token) },
    orderBy: { createdAt: "desc" },
  })
  if (!record || record.expiresAt <= new Date()) {
    if (record) await consumeChallenge(record.value)
    return NextResponse.redirect(fallback)
  }
  const consumed = await db.verification.deleteMany({
    where: { id: record.id },
  })
  if (consumed.count !== 1) return NextResponse.redirect(fallback)
  await db.verification.deleteMany({
    where: { identifier: otpIdentifier(record.value) },
  })
  const existing = await db.user.findUnique({
    where: { email: record.value },
    select: { id: true },
  })
  if (existing)
    return NextResponse.redirect(
      new URL("/login?notice=cuenta-existente", request.url)
    )

  const response = NextResponse.redirect(
    new URL("/complete-profile", request.url)
  )
  setProofCookie(response, record.value)
  return response
}
