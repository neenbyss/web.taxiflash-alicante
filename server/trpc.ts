import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"

import type { PermisoCodigo } from "@/lib/permisos"
import type { Role } from "@/lib/generated/prisma/enums"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { getPermisosEfectivos } from "@/server/services/permisos.service"

export async function createTRPCContext(opts: { headers: Headers }) {
  const session = await auth.api.getSession({ headers: opts.headers })
  return {
    db,
    session,
    ip: getClientIp(opts.headers),
  }
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const zodError = error.cause instanceof ZodError ? error.cause : null
    return {
      ...shape,
      // Sin esto, un fallo de validación llega al cliente como el JSON crudo
      // de los issues de Zod; aquí se sustituye por el primer mensaje legible.
      message:
        error.code === "INTERNAL_SERVER_ERROR"
          ? "No pudimos completar la solicitud. Inténtalo de nuevo."
          : (zodError?.issues[0]?.message ?? shape.message),
      data: {
        ...shape.data,
        stack:
          process.env.NODE_ENV === "production" ? undefined : shape.data.stack,
        zodError: zodError ? zodError.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
const limitedProcedure = t.procedure.use(({ ctx, type, next }) => {
  const result = checkRateLimit({
    key: `api.${type}`,
    actor: ctx.session?.user.id ?? ctx.ip,
    limit: type === "mutation" ? 30 : 240,
    windowMs: 60_000,
  })
  if (!result.ok)
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Demasiadas solicitudes. Espera un momento.",
    })
  return next()
})
export const publicProcedure = limitedProcedure

/**
 * Rate limit por procedimiento. Para usuarios autenticados limita por userId,
 * para anónimos por IP.
 */
export function withRateLimit(key: string, limit: number, windowMs: number) {
  return t.middleware(({ ctx, next }) => {
    const actor = ctx.session?.user.id ?? ctx.ip
    const result = checkRateLimit({ key, actor, limit, windowMs })
    if (!result.ok) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Demasiadas peticiones. Intenta de nuevo en ${result.retryAfterSeconds}s.`,
      })
    }
    return next()
  })
}

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Debes iniciar sesión.",
    })
  }
  if (!ctx.session.user.activo) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Esta cuenta está desactivada.",
    })
  }
  return next({
    ctx: { ...ctx, session: ctx.session },
  })
})

export const protectedProcedure = limitedProcedure.use(enforceAuth)

/** Restringe a uno o varios roles concretos. */
export function roleProcedure(...roles: Role[]) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!roles.includes(ctx.session.user.role as Role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes acceso a este recurso.",
      })
    }
    return next()
  })
}

/**
 * Exige un permiso efectivo (rol ± overrides). Inyecta el set de permisos
 * en el contexto para comprobaciones adicionales dentro del procedimiento.
 */
export function permissionProcedure(permiso: PermisoCodigo) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const permisos = await getPermisosEfectivos(
      ctx.session.user.id,
      ctx.session.user.role as Role
    )
    if (!permisos.has(permiso)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Te falta el permiso "${permiso}".`,
      })
    }
    return next({ ctx: { ...ctx, permisos } })
  })
}
