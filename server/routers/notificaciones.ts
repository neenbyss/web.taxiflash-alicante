import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/trpc"

export const notificacionesRouter = createTRPCRouter({
  /** Últimas notificaciones in-app del usuario autenticado. */
  listar: protectedProcedure
    .input(z.object({ limite: z.number().int().min(1).max(50).default(20) }).optional())
    .query(({ ctx, input }) =>
      ctx.db.notificacion.findMany({
        where: { userId: ctx.session.user.id, canal: "IN_APP" },
        orderBy: { createdAt: "desc" },
        take: input?.limite ?? 20,
      })
    ),

  contarNoLeidas: protectedProcedure.query(({ ctx }) =>
    ctx.db.notificacion.count({
      where: { userId: ctx.session.user.id, canal: "IN_APP", leida: false },
    })
  ),

  marcarLeida: protectedProcedure
    .input(z.object({ notificacionId: z.cuid() }))
    .mutation(({ ctx, input }) =>
      ctx.db.notificacion.updateMany({
        where: { id: input.notificacionId, userId: ctx.session.user.id },
        data: { leida: true },
      })
    ),

  marcarTodasLeidas: protectedProcedure.mutation(({ ctx }) =>
    ctx.db.notificacion.updateMany({
      where: { userId: ctx.session.user.id, leida: false },
      data: { leida: true },
    })
  ),
})
