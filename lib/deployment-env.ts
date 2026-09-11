type Environment = Record<string, string | undefined>

/** Validación estructural; no conecta ni muestra credenciales. */
export function validateDeploymentEnv(env: Environment): string[] {
  const errors: string[] = []
  const placeholder =
    /REEMPLAZAR|TU-PROYECTO|TU-DOMINIO|cambia-esto|POOL_HOST|USER:PASSWORD/i
  const required = (key: string) => {
    const value = env[key]?.trim()
    if (!value || placeholder.test(value))
      errors.push(`${key}: falta un valor real`)
    return value ?? ""
  }
  const remoteOrigin = (key: string, value: string) => {
    try {
      const url = new URL(value)
      if (
        url.protocol !== "https:" ||
        url.origin !== value ||
        url.hostname.includes("*") ||
        url.username ||
        url.password ||
        /^(localhost|127\.|192\.168\.|10\.|\[::1\])/.test(url.hostname)
      )
        throw new Error()
    } catch {
      errors.push(
        `${key}: usa un origen HTTPS público exacto, sin ruta ni barra final`
      )
    }
  }
  const db = required("DATABASE_URL")
  for (const [key, value] of [
    ["DATABASE_URL", db],
    ["DIRECT_URL", env.DIRECT_URL?.trim()],
  ] as const) {
    if (!value) continue
    try {
      const url = new URL(value)
      if (
        !["postgres:", "postgresql:"].includes(url.protocol) ||
        /^(localhost|127\.|192\.168\.|10\.|db$|\[::1\])/.test(url.hostname)
      )
        throw new Error()
    } catch {
      errors.push(
        `${key}: debe ser una conexión PostgreSQL remota, no Docker local`
      )
    }
  }
  const secret = required("BETTER_AUTH_SECRET")
  if (secret.length < 32)
    errors.push("BETTER_AUTH_SECRET: mínimo 32 caracteres aleatorios")
  const authUrl = required("BETTER_AUTH_URL")
  const appUrl = required("NEXT_PUBLIC_APP_URL")
  remoteOrigin("BETTER_AUTH_URL", authUrl)
  remoteOrigin("NEXT_PUBLIC_APP_URL", appUrl)
  if (authUrl !== appUrl)
    errors.push(
      "BETTER_AUTH_URL y NEXT_PUBLIC_APP_URL deben coincidir en esta instalación"
    )
  const origins = required("BETTER_AUTH_TRUSTED_ORIGINS")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  origins.forEach((value) => remoteOrigin("BETTER_AUTH_TRUSTED_ORIGINS", value))
  if (!origins.includes(appUrl))
    errors.push(
      "BETTER_AUTH_TRUSTED_ORIGINS: incluye el dominio de la aplicación"
    )
  if (env.TRUSTED_PROXY_HEADER !== "x-forwarded-for")
    errors.push("TRUSTED_PROXY_HEADER: usa x-forwarded-for para Vercel")
  const provider = required("EMAIL_PROVIDER")
  if (provider === "resend") required("RESEND_API_KEY")
  else if (provider === "smtp") {
    const host = required("SMTP_HOST")
    if (/localhost|127\.0\.0\.1|mailpit|\.local$/i.test(host))
      errors.push("SMTP_HOST: usa un servidor SMTP remoto")
    required("SMTP_USER")
    required("SMTP_PASS")
    if (
      !Number.isInteger(Number(env.SMTP_PORT)) ||
      Number(env.SMTP_PORT) < 1 ||
      Number(env.SMTP_PORT) > 65535
    )
      errors.push("SMTP_PORT: puerto inválido")
    if (!["true", "false"].includes(env.SMTP_SECURE ?? ""))
      errors.push("SMTP_SECURE: usa true o false")
  } else
    errors.push(
      "EMAIL_PROVIDER: debe ser resend o smtp; el registro necesita correo"
    )
  const sender = required("EMAIL_FROM")
  if (!/@/.test(sender) || /\.local(?:>|$)/i.test(sender))
    errors.push("EMAIL_FROM: usa un remitente autorizado por el proveedor")
  if (Boolean(env.GOOGLE_CLIENT_ID) !== Boolean(env.GOOGLE_CLIENT_SECRET))
    errors.push(
      "Google OAuth requiere GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET juntos"
    )
  for (const key of ["TARIFA_BASE", "TARIFA_POR_KM", "TARIFA_MINIMA"]) {
    const value = Number(required(key))
    if (!Number.isFinite(value) || value <= 0)
      errors.push(`${key}: debe ser positivo`)
  }
  if (!["true", "false"].includes(env.SITE_NOINDEX ?? ""))
    errors.push(
      "SITE_NOINDEX: define true para la demo, false para el sitio definitivo"
    )
  return errors
}
