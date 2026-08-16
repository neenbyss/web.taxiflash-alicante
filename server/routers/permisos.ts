import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { PERMISOS } from "@/lib/permisos"
import {
  setRolPermisosSchema,
  setUserPermisoSchema,
} from "@/lib/validations/usuario"
import type { Role } from "@/lib/generated/prisma/enums"
import {
  createTRPCRouter,
  permissionProcedure,
  protectedProcedure,
} from "@/server/trpc"
import { getPermisosEfectivos } from "@/server/services/permisos.service"

export const permisosRouter = createTRPCRouter({
  /** Permisos efectivos del usuario autenticado (para condicionar la UI). */
  mios: protectedProcedure.query(async ({ ctx }) => {
    const permisos = await getPermisosEfectivos(
      ctx.session.user.id,
      ctx.session.user.role as Role
    )
    return [...permisos]
  }),

  /** Catálogo completo de permisos. */
  catalogo: permissionProcedure(PERMISOS.GESTIONAR_PERMISOS).query(({ ctx }) =>
    ctx.db.permiso.findMany({ orderBy: { nombre: "asc" } })
  ),

  /** Permisos por defecto de cada rol. */
  porRol: permissionProcedure(PERMISOS.GESTIONAR_PERMISOS).query(async ({ ctx }) => {
    const filas = await ctx.db.rolPermiso.findMany({
      include: { permiso: { select: { id: true, codigo: true } } },
    })
    return filas.reduce<Record<string, string[]>>((acc, fila) => {
      acc[fila.role] ??= []
      acc[fila.role].push(fila.permiso.id)
      return acc
    }, {})
  }),

  /** Reemplaza el set de permisos de un rol. */
  setRolPermisos: permissionProcedure(PERMISOS.GESTIONAR_PERMISOS)
    .input(setRolPermisosSchema)
    .mutation(async ({ ctx, input }) => {
      // Salvaguarda: el rol ADMIN no puede quedarse sin gestionar_permisos,
      // o nadie podría volver a administrar el sistema.
      if (input.role === "ADMIN") {
        const gestionar = await ctx.db.permiso.findUnique({
          where: { codigo: PERMISOS.GESTIONAR_PERMISOS },
          select: { id: true },
        })
        if (gestionar && !input.permisoIds.includes(gestionar.id)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: 'El rol ADMIN no puede perder el permiso "gestionar_permisos".',
          })
        }
      }
      await ctx.db.$transaction([
        ctx.db.rolPermiso.deleteMany({ where: { role: input.role } }),
        ctx.db.rolPermiso.createMany({
          data: input.permisoIds.map((permisoId) => ({
            role: input.role,
            permisoId,
          })),
        }),
      ])
      return { ok: true }
    }),

  /** Overrides individuales de un usuario. */
  overridesDeUsuario: permissionProcedure(PERMISOS.GESTIONAR_PERMISOS)
    .input(z.object({ userId: z.cuid() }))
    .query(async ({ ctx, input }) => {
      const usuario = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { id: true, name: true, role: true },
      })
      if (!usuario) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuario no encontrado." })
      }
      const [overrides, efectivos] = await Promise.all([
        ctx.db.userPermiso.findMany({
          where: { userId: input.userId },
          select: { permisoId: true, concedido: true },
        }),
        getPermisosEfectivos(usuario.id, usuario.role),
      ])
      return { usuario, overrides, efectivos: [...efectivos] }
    }),

  /** Concede/revoca un permiso a un usuario concreto (o quita el override). */
  setUserPermiso: permissionProcedure(PERMISOS.GESTIONAR_PERMISOS)
    .input(setUserPermisoSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        const permiso = await ctx.db.permiso.findUnique({
          where: { id: input.permisoId },
          select: { codigo: true },
        })
        if (permiso?.codigo === PERMISOS.GESTIONAR_PERMISOS && input.concedido === false) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No puedes revocarte a ti mismo la gestión de permisos.",
          })
        }
      }
      if (input.concedido === null) {
        await ctx.db.userPermiso.deleteMany({
          where: { userId: input.userId, permisoId: input.permisoId },
        })
      } else {
        await ctx.db.userPermiso.upsert({
          where: {
            userId_permisoId: { userId: input.userId, permisoId: input.permisoId },
          },
          create: {
            userId: input.userId,
            permisoId: input.permisoId,
            concedido: input.concedido,
          },
          update: { concedido: input.concedido },
        })
      }
      return { ok: true }
    }),
})
