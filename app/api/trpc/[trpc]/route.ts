import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { isTrustedAuthOrigin } from "@/lib/auth-origins"
import { readLimitedBody } from "@/lib/request-body"

import { appRouter } from "@/server/routers/_app"
import { createTRPCContext } from "@/server/trpc"

async function handler(request: Request) {
  let req = request
  if (request.method === "POST") {
    if (!isTrustedAuthOrigin(request.headers.get("origin"))) {
      return Response.json({ message: "Origen no permitido." }, { status: 403 })
    }
    try {
      const body = await readLimitedBody(request, 64 * 1024)
      req = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: Buffer.from(body),
        signal: request.signal,
      })
    } catch (error) {
      return Response.json(
        { message: "Solicitud no válida." },
        { status: error instanceof RangeError ? 413 : 400 }
      )
    }
  }
  const response = await fetchRequestHandler({
    maxBatchSize: 10,
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `[tRPC] error en ${path ?? "<sin ruta>"}:`,
              error.message
            )
          }
        : undefined,
  })
  response.headers.set("Cache-Control", "private, no-store")
  return response
}

export { handler as GET, handler as POST }
