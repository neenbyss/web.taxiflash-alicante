import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"

export const ONBOARDING_COOKIE = "taxiflash_onboarding"
export const ONBOARDING_TTL_SECONDS = 10 * 60

type OnboardingProof = { email: string; expiresAt: number }

function secret(): string {
  const value = process.env.BETTER_AUTH_SECRET
  if (!value || value.length < 32)
    throw new Error("BETTER_AUTH_SECRET debe tener al menos 32 caracteres")
  return value
}

export function authDigest(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex")
}

function signature(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url")
}

export function createOnboardingProof(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      email: email.trim().toLowerCase(),
      expiresAt: Date.now() + ONBOARDING_TTL_SECONDS * 1000,
    } satisfies OnboardingProof)
  ).toString("base64url")
  return `${payload}.${signature(payload)}`
}

export function verifyOnboardingProof(
  value?: string | null
): OnboardingProof | null {
  if (!value) return null
  const [payload, suppliedSignature, ...extra] = value.split(".")
  if (!payload || !suppliedSignature || extra.length > 0) return null
  const expected = Buffer.from(signature(payload))
  const supplied = Buffer.from(suppliedSignature)
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  )
    return null
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as OnboardingProof
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= Date.now()
    )
      return null
    return { email: parsed.email.toLowerCase(), expiresAt: parsed.expiresAt }
  } catch {
    return null
  }
}

export function readCookieHeader(
  cookieHeader: string | null,
  name: string
): string | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=")
    if (key === name) {
      try {
        return decodeURIComponent(value.join("="))
      } catch {
        return null
      }
    }
  }
  return null
}

export function safeEqualDigest(expected: string, supplied: string): boolean {
  const expectedBuffer = Buffer.from(expected)
  const suppliedBuffer = Buffer.from(supplied)
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  )
}
