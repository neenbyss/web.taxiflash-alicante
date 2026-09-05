import "server-only"

function normalizeOrigin(value: string | undefined): string | null {
  if (!value) return null

  try {
    const url = new URL(value.trim())
    if (!["http:", "https:"].includes(url.protocol)) return null
    if (url.username || url.password) return null
    return url.origin
  } catch {
    return null
  }
}

/** Lista cerrada de orígenes desde los que se permiten peticiones de auth. */
export function getAuthOrigins(): string[] {
  const extra = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((value) => normalizeOrigin(value))

  return [
    normalizeOrigin(process.env.BETTER_AUTH_URL),
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL),
    ...extra,
  ].filter(
    (origin, index, origins): origin is string =>
      Boolean(origin) && origins.indexOf(origin) === index
  )
}

export function isTrustedAuthOrigin(origin: string | null): boolean {
  const normalized = normalizeOrigin(origin ?? undefined)
  return normalized !== null && getAuthOrigins().includes(normalized)
}
