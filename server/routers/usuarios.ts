import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { PERMISOS } from "@/lib/permisos"
import { sanitizeText } from "@/lib/sanitize"
import { perfilSchema } from "@/lib/validations/auth"
import {
  actualizarUsuarioAdminSchema,
  crearUsuarioAdminSchema,
  filtrosUsuariosSchema,
} from "@/lib/validations/usuario"
import { auth } from "@/server/auth"
import {
  createTRPCRouter,
  permissionProcedure,
  protectedProcedure,
  roleProcedure,
  withRateLimit,
} from "@/server/trpc"

const opcional = (v: string | undefined) => {
  const limpio = v ? sanitizeText(v) : ""
  return limpio.length > 0 ? limpio : null
}

export const usuariosRouter = createTRPCRouter({
  /** Perfil propio (cualquier rol). */
  miPerfil: protectedProcedure.query(({ ctx }) =>
    ctx.db.user.findUniqueOrThrow({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        telefono: true,
        direccionFrecuente: true,
        vehiculoPreferido: true,
        notasPreferencias: true,
        createdAt: true,
      },
    })
  ),

  actualizarPerfil: protectedProcedure
    .use(withRateLimit("usuarios.perfil", 10, 60_000))
    .input(perfilSchema)
    .mutation(({ ctx, input }) =>
      ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: sanitizeText(input.name),
          telefono: opcional(input.telefono),
          direccionFrecuente: opcional(input.direccionFrecuente),
          vehiculoPreferido: opcional(input.vehiculoPreferido),
          notasPreferencias: opcional(input.notasPreferencias),
        },
        select: { id: true },
      })
    ),

  /** Choferes activos (para el diálogo de asignación manual). */
  choferesActivos: permissionProcedure(PERMISOS.ASIGNAR_RESERVAS).query(({ ctx }) =>
    ctx.db.user.findMany({
      where: { role: "CHOFER", activo: true },
      select: { id: true, name: true, telefono: true },
      orderBy: { name: "asc" },
    })
  ),

  // ------------------------------------------------------------
  // Gestión de usuarios (admin con permiso)
  // ------------------------------------------------------------

  listar: permissionProcedure(PERMISOS.GESTIONAR_USUARIOS)
    .input(filtrosUsuariosSchema)
    .query(async ({ ctx, input }) => {
      const usuarios = await ctx.db.user.findMany({
        where: {
          ...(input.role ? { role: input.role } : {}),
          ...(input.incluirInactivos ? {} : { activo: true }),
          ...(input.busqueda
            ? {
                OR: [
                  { name: { contains: input.busqueda, mode: "insensitive" as const } },
                  { email: { contains: input.busqueda, mode: "insensitive" as const } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          telefono: true,
          activo: true,
          createdAt: true,
          _count: {
            select: { reservasComoCliente: true, reservasComoChofer: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limite + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      })
      const nextCursor =
        usuarios.length > input.limite ? usuarios.pop()!.id : undefined
      return { usuarios, nextCursor }
    }),

  /** Alta manual de cuentas (cliente, chofer o admin) desde el panel. */
  crear: permissionProcedure(PERMISOS.GESTIONAR_USUARIOS)
    .use(withRateLimit("usuarios.crear", 10, 60_000))
    .input(crearUsuarioAdminSchema)
    .mutation(async ({ ctx, input }) => {
      const existente = await ctx.db.user.findUnique({
        where: { email: input.email.toLowerCase() },
        select: { id: true },
      })
      if (existente) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya existe una cuenta con ese email.",
        })
      }
      // Se crea vía better-auth para que el hash de contraseña sea compatible.
      const creado = await auth.api.signUpEmail({
        body: {
          name: sanitizeText(input.name),
          email: input.email.toLowerCase(),
          password: input.password,
        },
      })
      const usuario = await ctx.db.user.update({
        where: { id: creado.user.id },
        data: {
          role: input.role,
          telefono: opcional(input.telefono),
          emailVerified: true,
        },
        select: { id: true, name: true, email: true, role: true },
      })
      return usuario
    }),

  actualizar: permissionProcedure(PERMISOS.GESTIONAR_USUARIOS)
    .input(actualizarUsuarioAdminSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id && input.activo === false) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No puedes desactivar tu propia cuenta.",
        })
      }
      if (input.userId === ctx.session.user.id && input.role && input.role !== "ADMIN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No puedes quitarte el rol de administrador a ti mismo.",
        })
      }
      const usuario = await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          ...(input.name !== undefined ? { name: sanitizeText(input.name) } : {}),
          ...(input.role !== undefined ? { role: input.role } : {}),
          ...(input.telefono !== undefined ? { telefono: opcional(input.telefono) } : {}),
          ...(input.activo !== undefined ? { activo: input.activo } : {}),
        },
        select: { id: true, activo: true },
      })
      // Al desactivar una cuenta se revocan sus sesiones abiertas.
      if (input.activo === false) {
        await ctx.db.session.deleteMany({ where: { userId: input.userId } })
      }
      return usuario
    }),

  /** Detalle de un usuario para el panel (incluye reseñas si es chofer). */
  detalle: roleProcedure("ADMIN")
    .input(z.object({ userId: z.cuid() }))
    .query(async ({ ctx, input }) => {
      const usuario = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          telefono: true,
          activo: true,
          createdAt: true,
          vehiculoPreferido: true,
          notasPreferencias: true,
        },
      })
      if (!usuario) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuario no encontrado." })
      }
      return usuario
    }),
})
