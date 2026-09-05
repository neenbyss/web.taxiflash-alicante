// Rate limiter en memoria (ventana deslizante simple).
// Suficiente para el prototipo de instancia única; en producción con varias
// instancias debería sustituirse por un almacén compartido (Redis/Upstash).

type Bucket = { timestamps: number[] }

const buckets = new Map<string, Bucket>()

const MAX_BUCKETS = 10_000

function prune(now: number, windowMs: number) {
  if (buckets.size < MAX_BUCKETS) return
  for (const [key, bucket] of buckets) {
    if (bucket.timestamps.every((t) => now - t > windowMs)) buckets.delete(key)
  }
}

export function checkRateLimit(opts: {
  /** Identificador del recurso, ej. "reservas.crear" */
  key: string
  /** Identificador del actor, normalmente la IP o el userId */
  actor: string
  /** Máximo de peticiones permitidas dentro de la ventana */
  limit: number
  /** Tamaño de la ventana en milisegundos */
  windowMs: number
}): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const id = `${opts.key}:${opts.actor}`
  prune(now, opts.windowMs)

  const bucket = buckets.get(id) ?? { timestamps: [] }
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < opts.windowMs)

  if (bucket.timestamps.length >= opts.limit) {
    const oldest = bucket.timestamps[0]
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((oldest + opts.windowMs - now) / 1000),
    }
  }

  bucket.timestamps.push(now)
  buckets.set(id, bucket)
  return { ok: true, retryAfterSeconds: 0 }
}

export function getClientIp(headers: Headers): string {
  const configured = process.env.TRUSTED_PROXY_HEADER?.trim().toLowerCase()
  const allowedHeaders = new Set([
    "x-real-ip",
    "cf-connecting-ip",
    "x-forwarded-for",
  ])

  // No se confía en X-Forwarded-For directamente: un cliente puede falsificar
  // su primer valor si el origen queda accesible sin pasar por el proxy.
  if (!configured || !allowedHeaders.has(configured)) return "unknown"

  const value = headers.get(configured)?.trim()
  // Una cadena X-Forwarded-For solo es interpretable con conocimiento del
  // proxy. Este limitador adicional falla de forma segura ante cadenas.
  if (!value || value.length > 64 || value.includes(",")) return "unknown"
  return value
}
