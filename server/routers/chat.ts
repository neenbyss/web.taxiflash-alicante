// Chat por reserva — funcionalidad BETA.
// Sin garantías de entrega ni cifrado extremo a extremo; los mensajes se
// obtienen por polling desde el cliente. Documentado como experimental.

import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { sanitizeMultiline } from "@/lib/sanitize"
import { enviarMensajeSchema } from "@/lib/validations/chat"
import {
  createTRPCRouter,
  protectedProcedure,
  withRateLimit,
} from "@/server/trpc"
import { usuarioPublicoSelect } from "@/server/routers/selects"

/** Participantes del chat: cliente dueño, chofer asignado o admin. */
async function assertParticipante(
  db: Parameters<Parameters<typeof protectedProcedure.query>[0]>[0]["ctx"]["db"],
  reservaId: string,
  userId: string,
  role: string
) {
  const reserva = await db.reserva.findUnique({
    where: { id: reservaId },
    select: { id: true, clienteId: true, choferId: true, estado: true },
  })
  if (!reserva) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Reserva no encontrada." })
  }
  const esParticipante =
    reserva.clienteId === userId || reserva.choferId === userId || role === "ADMIN"
  if (!esParticipante) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Sin acceso a este chat." })
  }
  return reserva
}

export const chatRouter = createTRPCRouter({
  mensajes: protectedProcedure
    .input(z.object({ reservaId: z.cuid() }))
    .query(async ({ ctx, input }) => {
      await assertParticipante(
        ctx.db,
        input.reservaId,
        ctx.session.user.id,
        ctx.session.user.role
      )
      return ctx.db.mensaje.findMany({
        where: { reservaId: input.reservaId },
        include: { autor: { select: usuarioPublicoSelect } },
        orderBy: { createdAt: "asc" },
        take: 200,
      })
    }),

  enviar: protectedProcedure
    .use(withRateLimit("chat.enviar", 20, 60_000))
    .input(enviarMensajeSchema)
    .mutation(async ({ ctx, input }) => {
      const reserva = await assertParticipante(
        ctx.db,
        input.reservaId,
        ctx.session.user.id,
        ctx.session.user.role
      )
      if (!["ACEPTADA", "EN_CURSO"].includes(reserva.estado)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El chat solo está disponible en reservas aceptadas o en curso.",
        })
      }
      return ctx.db.mensaje.create({
        data: {
          reservaId: input.reservaId,
          autorId: ctx.session.user.id,
          cuerpo: sanitizeMultiline(input.cuerpo),
        },
        include: { autor: { select: usuarioPublicoSelect } },
      })
    }),
})
