import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { sanitizeMultiline } from "@/lib/sanitize"
import {
  crearReporteSchema,
  gestionarReporteSchema,
} from "@/lib/validations/reporte"
import {
  createTRPCRouter,
  protectedProcedure,
  roleProcedure,
  withRateLimit,
} from "@/server/trpc"
import { notificarPorRol } from "@/server/services/notificaciones.service"
import { usuarioPublicoSelect } from "@/server/routers/selects"

/**
 * Reportes / incidencias: cualquier usuario autenticado puede reportar un
 * problema (opcionalmente ligado a una reserva). Los admins los revisan.
 */
export const soporteRouter = createTRPCRouter({
  crear: protectedProcedure
    .use(withRateLimit("soporte.crear", 5, 60_000))
    .input(crearReporteSchema)
    .mutation(async ({ ctx, input }) => {
      // Si se ancla a una reserva, el autor debe ser parte de ella.
      if (input.reservaId) {
        const reserva = await ctx.db.reserva.findUnique({
          where: { id: input.reservaId },
          select: { clienteId: true, choferId: true },
        })
        const user = ctx.session.user
        const parte =
          reserva &&
          (reserva.clienteId === user.id ||
            reserva.choferId === user.id ||
            user.role === "ADMIN")
        if (!parte) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No puedes reportar sobre esa reserva.",
          })
        }
      }
      const reporte = await ctx.db.reporte.create({
        data: {
          autorId: ctx.session.user.id,
          reservaId: input.reservaId ?? null,
          categoria: input.categoria,
          descripcion: sanitizeMultiline(input.descripcion),
        },
      })
      await notificarPorRol("ADMIN", {
        tipo: "reporte_nuevo",
        titulo: "Nuevo reporte",
        cuerpo: `${ctx.session.user.name} reportó una incidencia (${input.categoria}).`,
        url: "/admin/reports",
      })
      return { id: reporte.id }
    }),

  /** Reportes creados por el usuario autenticado. */
  mios: protectedProcedure.query(({ ctx }) =>
    ctx.db.reporte.findMany({
      where: { autorId: ctx.session.user.id },
      include: { reserva: { select: { codigo: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  ),

  // ------------------------------------------------------------
  // Gestión (admin)
  // ------------------------------------------------------------

  listarAdmin: roleProcedure("ADMIN")
    .input(
      z
        .object({
          estado: z.enum(["ABIERTO", "EN_REVISION", "RESUELTO"]).optional(),
        })
        .optional()
        .default({})
    )
    .query(({ ctx, input }) =>
      ctx.db.reporte.findMany({
        where: input.estado ? { estado: input.estado } : {},
        include: {
          autor: { select: usuarioPublicoSelect },
          reserva: { select: { id: true, codigo: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    ),

  contarAbiertos: roleProcedure("ADMIN").query(({ ctx }) =>
    ctx.db.reporte.count({ where: { estado: "ABIERTO" } })
  ),

  gestionar: roleProcedure("ADMIN")
    .input(gestionarReporteSchema)
    .mutation(({ ctx, input }) =>
      ctx.db.reporte.update({
        where: { id: input.reporteId },
        data: {
          estado: input.estado,
          notaAdmin: input.notaAdmin ? sanitizeMultiline(input.notaAdmin) : null,
        },
        select: { id: true, estado: true },
      })
    ),
})
