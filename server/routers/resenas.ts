import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { PERMISOS } from "@/lib/permisos"
import { sanitizeMultiline, sanitizeText } from "@/lib/sanitize"
import { crearResenaSchema } from "@/lib/validations/resena"
import {
  createTRPCRouter,
  permissionProcedure,
  protectedProcedure,
  withRateLimit,
} from "@/server/trpc"
import { notificar } from "@/server/services/notificaciones.service"
import { usuarioPublicoSelect } from "@/server/routers/selects"

export const resenasRouter = createTRPCRouter({
  /**
   * Crear reseña: SOLO el cliente dueño de una reserva FINALIZADA, una única
   * vez por reserva (además del check hay unique constraint en BD).
   */
  crear: protectedProcedure
    .use(withRateLimit("resenas.crear", 5, 60_000))
    .input(crearResenaSchema)
    .mutation(async ({ ctx, input }) => {
      const reserva = await ctx.db.reserva.findUnique({
        where: { id: input.reservaId },
        select: {
          id: true,
          codigo: true,
          clienteId: true,
          choferId: true,
          estado: true,
          resena: { select: { id: true } },
        },
      })
      if (!reserva || reserva.clienteId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reserva no encontrada o no te pertenece.",
        })
      }
      if (reserva.estado !== "FINALIZADA") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Solo puedes reseñar reservas finalizadas.",
        })
      }
      if (reserva.resena) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Esta reserva ya tiene una reseña.",
        })
      }
      const resena = await ctx.db.resena.create({
        data: {
          reservaId: reserva.id,
          clienteId: ctx.session.user.id,
          choferId: reserva.choferId,
          puntuacion: input.puntuacion,
          titulo: sanitizeText(input.titulo),
          descripcion: sanitizeMultiline(input.descripcion),
        },
      })
      if (reserva.choferId) {
        await notificar({
          userId: reserva.choferId,
          tipo: "resena_recibida",
          titulo: "Nueva reseña recibida",
          cuerpo: `Recibiste ${input.puntuacion}★ por el viaje ${reserva.codigo}.`,
          url: "/chofer/resenas",
        })
      }
      return resena
    }),

  /** Reseñas visibles de un chofer (perfil de chofer, feedback propio). */
  deChofer: protectedProcedure
    .input(z.object({ choferId: z.cuid() }))
    .query(async ({ ctx, input }) => {
      // Un chofer solo puede ver su propio feedback; el admin puede ver todos.
      const user = ctx.session.user
      if (user.role === "CHOFER" && user.id !== input.choferId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sin acceso." })
      }
      const [resenas, agregado] = await Promise.all([
        ctx.db.resena.findMany({
          where: { choferId: input.choferId, oculta: false },
          include: {
            cliente: { select: usuarioPublicoSelect },
            reserva: { select: { codigo: true, finalizadaEn: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        ctx.db.resena.aggregate({
          where: { choferId: input.choferId, oculta: false },
          _avg: { puntuacion: true },
          _count: true,
        }),
      ])
      return {
        resenas,
        promedio: agregado._avg.puntuacion,
        total: agregado._count,
      }
    }),

  // ------------------------------------------------------------
  // Moderación (admin con permiso)
  // ------------------------------------------------------------

  listarAdmin: permissionProcedure(PERMISOS.MODERAR_RESENAS)
    .input(
      z.object({
        incluirOcultas: z.boolean().default(true),
        cursor: z.cuid().optional(),
        limite: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const resenas = await ctx.db.resena.findMany({
        where: input.incluirOcultas ? {} : { oculta: false },
        include: {
          cliente: { select: usuarioPublicoSelect },
          chofer: { select: usuarioPublicoSelect },
          reserva: { select: { codigo: true } },
        },
        orderBy: { createdAt: "desc" },
        take: input.limite + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      })
      const nextCursor = resenas.length > input.limite ? resenas.pop()!.id : undefined
      return { resenas, nextCursor }
    }),

  setOculta: permissionProcedure(PERMISOS.MODERAR_RESENAS)
    .input(z.object({ resenaId: z.cuid(), oculta: z.boolean() }))
    .mutation(({ ctx, input }) =>
      ctx.db.resena.update({
        where: { id: input.resenaId },
        data: { oculta: input.oculta },
        select: { id: true, oculta: true },
      })
    ),
})
