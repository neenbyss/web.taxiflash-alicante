import { toNextJsHandler } from "better-auth/next-js"

import { auth } from "@/server/auth"
import { readLimitedBody } from "@/lib/request-body"

const handlers = toNextJsHandler(auth.handler)
export const GET = handlers.GET

export async function POST(request: Request) {
  let body: Uint8Array
  try {
    body = await readLimitedBody(request, 16 * 1024)
  } catch (error) {
    return Response.json(
      { message: "Solicitud no válida." },
      { status: error instanceof RangeError ? 413 : 400 }
    )
  }
  return handlers.POST(
    new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: Buffer.from(body),
      signal: request.signal,
    })
  )
}
