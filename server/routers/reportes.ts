import { PERMISOS } from "@/lib/permisos"
import { createTRPCRouter, permissionProcedure } from "@/server/trpc"

export const reportesRouter = createTRPCRouter({
  /** Resumen general para el panel de admin. */
  resumen: permissionProcedure(PERMISOS.VER_REPORTES).query(async ({ ctx }) => {
    const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [porEstado, recientes, usuarios, ratingPromedio, alquileresPendientes] =
      await Promise.all([
        ctx.db.reserva.groupBy({
          by: ["estado"],
          _count: { _all: true },
        }),
        ctx.db.reserva.count({ where: { createdAt: { gte: hace30dias } } }),
        ctx.db.user.groupBy({
          by: ["role"],
          where: { activo: true },
          _count: { _all: true },
        }),
        ctx.db.resena.aggregate({
          where: { oculta: false },
          _avg: { puntuacion: true },
          _count: true,
        }),
        ctx.db.alquilerEntreCiudades.count({ where: { estado: "A_CONFIRMAR" } }),
      ])

    return {
      reservasPorEstado: Object.fromEntries(
        porEstado.map((fila) => [fila.estado, fila._count._all])
      ),
      reservasUltimos30Dias: recientes,
      usuariosPorRol: Object.fromEntries(
        usuarios.map((fila) => [fila.role, fila._count._all])
      ),
      resenas: {
        promedio: ratingPromedio._avg.puntuacion,
        total: ratingPromedio._count,
      },
      alquileresPendientes,
    }
  }),

  /** Ranking simple de choferes por viajes finalizados y rating. */
  choferes: permissionProcedure(PERMISOS.VER_REPORTES).query(async ({ ctx }) => {
    const choferes = await ctx.db.user.findMany({
      where: { role: "CHOFER" },
      select: {
        id: true,
        name: true,
        activo: true,
        _count: { select: { reservasComoChofer: true } },
        resenasRecibidas: {
          where: { oculta: false },
          select: { puntuacion: true },
        },
      },
      orderBy: { name: "asc" },
    })
    return choferes.map((chofer) => ({
      id: chofer.id,
      name: chofer.name,
      activo: chofer.activo,
      totalViajes: chofer._count.reservasComoChofer,
      rating:
        chofer.resenasRecibidas.length > 0
          ? chofer.resenasRecibidas.reduce((acc, r) => acc + r.puntuacion, 0) /
            chofer.resenasRecibidas.length
          : null,
      totalResenas: chofer.resenasRecibidas.length,
    }))
  }),
})
