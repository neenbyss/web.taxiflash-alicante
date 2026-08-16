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
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return headers.get("x-real-ip") ?? "unknown"
}
