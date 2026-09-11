import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { PERMISOS } from "@/lib/permisos"
import { sanitizeMultiline, sanitizeText } from "@/lib/sanitize"
import {
  confirmarAlquilerSchema,
  crearAlquilerSchema,
} from "@/lib/validations/alquiler"
import {
  createTRPCRouter,
  permissionProcedure,
  protectedProcedure,
  withRateLimit,
} from "@/server/trpc"
import { generarCodigo } from "@/server/services/codigo.service"
import {
  notificarConEmail,
  notificarPorRol,
} from "@/server/services/notificaciones.service"
import { usuarioPublicoSelect } from "@/server/routers/selects"

export const alquilerRouter = createTRPCRouter({
  /**
   * Solicitud de alquiler entre ciudades / por horas: precio a confirmar.
   * Requiere sesión; el contacto se toma del perfil del usuario.
   */
  crear: protectedProcedure
    .use(withRateLimit("alquiler.crear", 5, 60_000))
    .input(crearAlquilerSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user
      const alquiler = await ctx.db.alquilerEntreCiudades.create({
        data: {
          codigo: generarCodigo("A"),
          clienteId: user.id,
          nombreContacto: user.name,
          telefonoContacto: user.telefono ?? null,
          emailContacto: user.email,
          ciudadOrigen: sanitizeText(input.ciudadOrigen),
          ciudadDestino: sanitizeText(input.ciudadDestino),
          fecha: input.fecha,
          modalidad: input.modalidad,
          horas: input.modalidad === "por_horas" ? input.horas : null,
          notas: input.notas ? sanitizeMultiline(input.notas) : null,
        },
      })

      await notificarPorRol("ADMIN", {
        tipo: "alquiler_nuevo",
        titulo: "Nuevo alquiler a confirmar",
        cuerpo: `${alquiler.ciudadOrigen} → ${alquiler.ciudadDestino} (${alquiler.codigo})`,
        url: "/admin/rentals",
      })

      return { id: alquiler.id, codigo: alquiler.codigo }
    }),

  /** Alquileres del cliente autenticado. */
  mios: protectedProcedure.query(({ ctx }) =>
    ctx.db.alquilerEntreCiudades.findMany({
      where: { clienteId: ctx.session.user.id },
      include: { chofer: { select: usuarioPublicoSelect } },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  ),

  // ------------------------------------------------------------
  // Gestión (permiso gestionar_alquileres)
  // ------------------------------------------------------------

  listarAdmin: permissionProcedure(PERMISOS.GESTIONAR_ALQUILERES)
    .input(
      z.object({
        estado: z
          .enum([
            "A_CONFIRMAR",
            "CONFIRMADO",
            "RECHAZADO",
            "CANCELADO",
            "FINALIZADO",
          ])
          .optional(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.db.alquilerEntreCiudades.findMany({
        where: input.estado ? { estado: input.estado } : {},
        include: {
          cliente: { select: usuarioPublicoSelect },
          chofer: { select: usuarioPublicoSelect },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    ),

  /** Confirmación manual de precio (y opcionalmente chofer). */
  confirmar: permissionProcedure(PERMISOS.GESTIONAR_ALQUILERES)
    .input(confirmarAlquilerSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.choferId) {
        const driver = await ctx.db.user.findFirst({
          where: { id: input.choferId, role: "CHOFER", activo: true },
          select: { id: true },
        })
        if (!driver)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Selecciona un chofer activo.",
          })
      }
      const { count } = await ctx.db.alquilerEntreCiudades.updateMany({
        where: { id: input.alquilerId, estado: "A_CONFIRMAR" },
        data: {
          estado: "CONFIRMADO",
          precioConfirmado: input.precioConfirmado,
          choferId: input.choferId ?? null,
        },
      })
      if (count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "El alquiler ya no está pendiente de confirmación.",
        })
      }
      const alquiler = await ctx.db.alquilerEntreCiudades.findUniqueOrThrow({
        where: { id: input.alquilerId },
      })
      const cuerpo = `Tu alquiler ${alquiler.codigo} (${alquiler.ciudadOrigen} → ${alquiler.ciudadDestino}) fue confirmado por ${input.precioConfirmado.toFixed(2)}.`
      if (alquiler.clienteId) {
        await notificarConEmail({
          userId: alquiler.clienteId,
          tipo: "alquiler_confirmado",
          titulo: "Alquiler confirmado",
          cuerpo,
          url: "/customer/rentals",
          emailDestino: alquiler.emailContacto,
        })
      }
      if (input.choferId) {
        await notificarConEmail({
          userId: input.choferId,
          tipo: "alquiler_asignado",
          titulo: "Alquiler asignado",
          cuerpo: `Se te asignó el alquiler ${alquiler.codigo}: ${alquiler.ciudadOrigen} → ${alquiler.ciudadDestino}.`,
          url: "/driver",
        })
      }
      return { ok: true }
    }),

  cambiarEstado: permissionProcedure(PERMISOS.GESTIONAR_ALQUILERES)
    .input(
      z.object({
        alquilerId: z.cuid(),
        estado: z.enum(["RECHAZADO", "CANCELADO", "FINALIZADO"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const alquiler = await ctx.db.alquilerEntreCiudades.update({
        where: { id: input.alquilerId },
        data: { estado: input.estado },
      })
      if (alquiler.clienteId && input.estado === "RECHAZADO") {
        await notificarConEmail({
          userId: alquiler.clienteId,
          tipo: "alquiler_rechazado",
          titulo: "Alquiler rechazado",
          cuerpo: `Tu solicitud de alquiler ${alquiler.codigo} no pudo ser atendida.`,
          url: "/customer/rentals",
          emailDestino: alquiler.emailContacto,
        })
      }
      return { ok: true }
    }),
})
