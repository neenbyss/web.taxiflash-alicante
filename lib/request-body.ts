/** Limit the bytes actually read; Content-Length alone is not trustworthy. */
export async function readLimitedBody(
  request: Request,
  limit: number
): Promise<Uint8Array> {
  if (Number(request.headers.get("content-length")) > limit) {
    throw new RangeError("Payload too large")
  }
  const reader = request.body?.getReader()
  if (!reader) return new Uint8Array()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > limit) {
        void reader.cancel().catch(() => undefined)
        throw new RangeError("Payload too large")
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body
}

export async function readLimitedJson(
  request: Request,
  limit: number
): Promise<unknown> {
  return JSON.parse(
    new TextDecoder().decode(await readLimitedBody(request, limit))
  )
}
