import { createTRPCRouter } from "@/server/trpc"
import { alquilerRouter } from "@/server/routers/alquiler"
import { chatRouter } from "@/server/routers/chat"
import { notificacionesRouter } from "@/server/routers/notificaciones"
import { permisosRouter } from "@/server/routers/permisos"
import { reportesRouter } from "@/server/routers/reportes"
import { reservasRouter } from "@/server/routers/reservas"
import { resenasRouter } from "@/server/routers/resenas"
import { soporteRouter } from "@/server/routers/soporte"
import { usuariosRouter } from "@/server/routers/usuarios"

export const appRouter = createTRPCRouter({
  reservas: reservasRouter,
  usuarios: usuariosRouter,
  permisos: permisosRouter,
  notificaciones: notificacionesRouter,
  resenas: resenasRouter,
  chat: chatRouter,
  alquiler: alquilerRouter,
  reportes: reportesRouter,
  soporte: soporteRouter,
})

export type AppRouter = typeof appRouter
