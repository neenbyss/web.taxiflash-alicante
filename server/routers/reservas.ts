import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { PERMISOS } from "@/lib/permisos"
import { sanitizeMultiline, sanitizeText } from "@/lib/sanitize"
import {
  asignarReservaSchema,
  cancelarReservaSchema,
  crearReservaSchema,
  estimarTarifaSchema,
  filtrosReservasAdminSchema,
  rechazarReservaSchema,
} from "@/lib/validations/reserva"
import {
  createTRPCRouter,
  permissionProcedure,
  protectedProcedure,
  publicProcedure,
  roleProcedure,
  withRateLimit,
} from "@/server/trpc"
import { generarCodigo } from "@/server/services/codigo.service"
import {
  emailAInvitado,
  notificar,
  notificarConEmail,
  notificarPorRol,
} from "@/server/services/notificaciones.service"
import { estimarTarifa } from "@/server/services/tarifa.service"
import { obtenerRutaGeometria } from "@/server/services/ruta.service"
import { cancelarEsperasVencidas } from "@/server/services/viaje.service"
import { ESPERA_MINUTOS } from "@/lib/viaje"
import {
  reservaDetalleInclude,
  reservaListadoInclude,
  usuarioPublicoSelect,
} from "@/server/routers/selects"

export const reservasRouter = createTRPCRouter({
  /** Estimación de tarifa para el formulario (no persiste nada). */
  estimarTarifa: publicProcedure
    .use(withRateLimit("reservas.estimar", 30, 60_000))
    .input(estimarTarifaSchema)
    .query(({ input }) => estimarTarifa(input.puntos)),

  /**
   * Crear reserva. Requiere sesión: el contacto se toma del perfil del
   * usuario (no se pide en el formulario). La tarifa se calcula SIEMPRE en el
   * servidor a partir de los puntos.
   */
  crear: protectedProcedure
    .use(withRateLimit("reservas.crear", 5, 60_000))
    .input(crearReservaSchema)
    .mutation(async ({ ctx, input }) => {
      const puntos = [input.origen, ...input.paradas, input.destino]
      const { distanciaKm, tarifaEstimada } = await estimarTarifa(
        puntos.map((p) => ({ lat: p.lat, lng: p.lng }))
      )

      const user = ctx.session.user
      const reserva = await ctx.db.reserva.create({
        data: {
          codigo: generarCodigo("R"),
          tipo: input.tipo,
          fechaProgramada:
            input.tipo === "PROGRAMADA" ? input.fechaProgramada : null,
          clienteId: user.id,
          nombreContacto: user.name,
          telefonoContacto: user.telefono ?? null,
          emailContacto: user.email,
          origenDireccion: sanitizeText(input.origen.direccion),
          origenLat: input.origen.lat,
          origenLng: input.origen.lng,
          destinoDireccion: sanitizeText(input.destino.direccion),
          destinoLat: input.destino.lat,
          destinoLng: input.destino.lng,
          paradas: input.paradas.map((p) => ({
            direccion: sanitizeText(p.direccion),
            lat: p.lat,
            lng: p.lng,
          })),
          distanciaKm,
          tarifaEstimada,
          notas: input.notas ? sanitizeMultiline(input.notas) : null,
        },
      })

      const resumen = `${reserva.origenDireccion} → ${reserva.destinoDireccion}`
      await notificarPorRol("CHOFER", {
        tipo: "reserva_nueva",
        titulo: "Nueva reserva pendiente",
        cuerpo: resumen,
        url: "/chofer",
      })
      await notificarPorRol("ADMIN", {
        tipo: "reserva_nueva",
        titulo: "Nueva reserva pendiente",
        cuerpo: resumen,
        url: "/admin/reservas",
      })
      await notificar({
        userId: user.id,
        tipo: "reserva_creada",
        titulo: "Reserva registrada",
        cuerpo: `Tu reserva ${reserva.codigo} quedó pendiente de aceptación.`,
        url: `/cliente/reservas/${reserva.id}`,
      })

      return { id: reserva.id, codigo: reserva.codigo }
    }),

  /** Consulta pública por código (invitados sin cuenta). Datos limitados. */
  consultarPorCodigo: publicProcedure
    .use(withRateLimit("reservas.consultar", 20, 60_000))
    .input(z.object({ codigo: z.string().min(6).max(20) }))
    .query(async ({ ctx, input }) => {
      const reserva = await ctx.db.reserva.findUnique({
        where: { codigo: input.codigo.toUpperCase().trim() },
        select: {
          codigo: true,
          estado: true,
          tipo: true,
          fechaProgramada: true,
          origenDireccion: true,
          destinoDireccion: true,
          distanciaKm: true,
          tarifaEstimada: true,
          createdAt: true,
          // Contacto del chofer solo si la reserva ya fue aceptada.
          chofer: { select: { name: true, telefono: true } },
        },
      })
      if (!reserva) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reserva no encontrada." })
      }
      const choferVisible = ["ACEPTADA", "EN_CURSO", "FINALIZADA"].includes(
        reserva.estado
      )
      return { ...reserva, chofer: choferVisible ? reserva.chofer : null }
    }),

  /** Historial del cliente autenticado. */
  mias: protectedProcedure
    .input(
      z
        .object({ soloActivas: z.boolean().default(false) })
        .optional()
        .default({ soloActivas: false })
    )
    .query(async ({ ctx, input }) => {
      // Aplica auto-cancelaciones por espera vencida antes de listar.
      await cancelarEsperasVencidas(ctx.db)
      return ctx.db.reserva.findMany({
        where: {
          clienteId: ctx.session.user.id,
          ...(input.soloActivas
            ? { estado: { in: ["PENDIENTE", "ACEPTADA", "EN_CURSO"] } }
            : {}),
        },
        include: { chofer: { select: usuarioPublicoSelect }, resena: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    }),

  /** Geometría de la ruta (para dibujarla en el mapa del viaje). */
  ruta: protectedProcedure
    .input(z.object({ reservaId: z.cuid() }))
    .query(async ({ ctx, input }) => {
      const reserva = await ctx.db.reserva.findUnique({
        where: { id: input.reservaId },
        select: {
          clienteId: true,
          choferId: true,
          origenLat: true,
          origenLng: true,
          destinoLat: true,
          destinoLng: true,
          paradas: true,
        },
      })
      const user = ctx.session.user
      if (
        !reserva ||
        (reserva.clienteId !== user.id &&
          reserva.choferId !== user.id &&
          user.role !== "ADMIN")
      ) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reserva no encontrada." })
      }
      const paradas = (reserva.paradas as { lat: number; lng: number }[]) ?? []
      const puntos = [
        { lat: reserva.origenLat, lng: reserva.origenLng },
        ...paradas.map((p) => ({ lat: p.lat, lng: p.lng })),
        { lat: reserva.destinoLat, lng: reserva.destinoLng },
      ]
      return obtenerRutaGeometria(puntos)
    }),

  /** Detalle con control de acceso: dueño, chofer asignado o admin. */
  detalle: protectedProcedure
    .input(z.object({ reservaId: z.cuid() }))
    .query(async ({ ctx, input }) => {
      const reserva = await ctx.db.reserva.findUnique({
        where: { id: input.reservaId },
        include: reservaDetalleInclude,
      })
      if (!reserva) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reserva no encontrada." })
      }
      const user = ctx.session.user
      const esDueno = reserva.clienteId === user.id
      const esChofer = reserva.choferId === user.id
      const esAdmin = user.role === "ADMIN"
      if (!esDueno && !esChofer && !esAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Sin acceso a esta reserva." })
      }
      // El contacto del chofer solo se muestra al cliente tras la aceptación.
      const aceptada = ["ACEPTADA", "EN_CURSO", "FINALIZADA"].includes(reserva.estado)
      return {
        ...reserva,
        chofer: aceptada || esAdmin ? reserva.chofer : null,
      }
    }),

  /** Cancelación por el cliente dueño (solo pendiente o aceptada). */
  cancelar: protectedProcedure
    .input(cancelarReservaSchema)
    .mutation(async ({ ctx, input }) => {
      const reserva = await ctx.db.reserva.findUnique({
        where: { id: input.reservaId },
        select: { id: true, clienteId: true, estado: true, codigo: true, choferId: true },
      })
      if (!reserva || reserva.clienteId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reserva no encontrada." })
      }
      if (!["PENDIENTE", "ACEPTADA"].includes(reserva.estado)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Solo se pueden cancelar reservas pendientes o aceptadas.",
        })
      }
      const actualizada = await ctx.db.reserva.update({
        where: { id: reserva.id },
        data: {
          estado: "CANCELADA",
          motivoEstado: input.motivo ? sanitizeText(input.motivo) : "Cancelada por el cliente",
        },
      })
      if (reserva.choferId) {
        await notificar({
          userId: reserva.choferId,
          tipo: "reserva_cancelada",
          titulo: "Reserva cancelada",
          cuerpo: `El cliente canceló la reserva ${reserva.codigo}.`,
          url: "/chofer",
        })
      }
      return actualizada
    }),

  // ------------------------------------------------------------
  // Portal del chofer
  // ------------------------------------------------------------

  /** Reservas pendientes disponibles para tomar (requiere permiso). */
  pendientes: permissionProcedure(PERMISOS.ACEPTAR_RESERVAS).query(({ ctx }) =>
    ctx.db.reserva.findMany({
      where: { estado: "PENDIENTE" },
      include: reservaListadoInclude,
      orderBy: { createdAt: "asc" },
      take: 100,
    })
  ),

  /** Primero en aceptar se la queda: update condicional evita carreras. */
  aceptar: permissionProcedure(PERMISOS.ACEPTAR_RESERVAS)
    .input(z.object({ reservaId: z.cuid() }))
    .mutation(async ({ ctx, input }) => {
      const { count } = await ctx.db.reserva.updateMany({
        where: { id: input.reservaId, estado: "PENDIENTE" },
        data: {
          estado: "ACEPTADA",
          choferId: ctx.session.user.id,
          aceptadaEn: new Date(),
        },
      })
      if (count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Esta reserva ya fue tomada por otro chofer o cambió de estado.",
        })
      }
      const reserva = await ctx.db.reserva.findUniqueOrThrow({
        where: { id: input.reservaId },
        select: {
          id: true,
          codigo: true,
          clienteId: true,
          emailContacto: true,
          origenDireccion: true,
          destinoDireccion: true,
        },
      })
      const cuerpo = `Tu reserva ${reserva.codigo} fue aceptada por ${ctx.session.user.name}.`
      if (reserva.clienteId) {
        await notificarConEmail({
          userId: reserva.clienteId,
          tipo: "reserva_aceptada",
          titulo: "Reserva confirmada",
          cuerpo,
          url: `/cliente/reservas/${reserva.id}`,
          emailDestino: reserva.emailContacto,
        })
      } else if (reserva.emailContacto) {
        emailAInvitado({
          email: reserva.emailContacto,
          titulo: "Reserva confirmada",
          cuerpo,
          url: `/reserva/${reserva.codigo}`,
        })
      }
      return { ok: true }
    }),

  /** Rechazo de una reserva pendiente, con motivo. */
  rechazar: permissionProcedure(PERMISOS.ACEPTAR_RESERVAS)
    .input(rechazarReservaSchema)
    .mutation(async ({ ctx, input }) => {
      const { count } = await ctx.db.reserva.updateMany({
        where: { id: input.reservaId, estado: "PENDIENTE" },
        data: { estado: "RECHAZADA", motivoEstado: sanitizeText(input.motivo) },
      })
      if (count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "La reserva ya no está pendiente.",
        })
      }
      const reserva = await ctx.db.reserva.findUniqueOrThrow({
        where: { id: input.reservaId },
        select: { id: true, codigo: true, clienteId: true, emailContacto: true },
      })
      const cuerpo = `Tu reserva ${reserva.codigo} fue rechazada. Motivo: ${input.motivo}`
      if (reserva.clienteId) {
        await notificarConEmail({
          userId: reserva.clienteId,
          tipo: "reserva_rechazada",
          titulo: "Reserva rechazada",
          cuerpo,
          url: `/cliente/reservas/${reserva.id}`,
          emailDestino: reserva.emailContacto,
        })
      } else if (reserva.emailContacto) {
        emailAInvitado({
          email: reserva.emailContacto,
          titulo: "Reserva rechazada",
          cuerpo,
          url: `/reserva/${reserva.codigo}`,
        })
      }
      return { ok: true }
    }),

  /** Reservas asignadas al chofer autenticado. */
  misViajes: roleProcedure("CHOFER", "ADMIN")
    .input(
      z
        .object({ soloActivas: z.boolean().default(false) })
        .optional()
        .default({ soloActivas: false })
    )
    .query(async ({ ctx, input }) => {
      await cancelarEsperasVencidas(ctx.db)
      return ctx.db.reserva.findMany({
        where: {
          choferId: ctx.session.user.id,
          ...(input.soloActivas ? { estado: { in: ["ACEPTADA", "EN_CURSO"] } } : {}),
        },
        include: { cliente: { select: usuarioPublicoSelect } },
        orderBy: { updatedAt: "desc" },
        take: 100,
      })
    }),

  // ------------------------------------------------------------
  // Fase de recogida (chofer ⇄ cliente antes de iniciar el viaje)
  // ------------------------------------------------------------

  /** Chofer: "voy en camino al punto de recogida". */
  marcarEnCamino: roleProcedure("CHOFER", "ADMIN")
    .input(z.object({ reservaId: z.cuid() }))
    .mutation(async ({ ctx, input }) => {
      const { count } = await ctx.db.reserva.updateMany({
        where: {
          id: input.reservaId,
          choferId: ctx.session.user.id,
          estado: "ACEPTADA",
          choferEnCaminoEn: null,
        },
        data: { choferEnCaminoEn: new Date() },
      })
      if (count === 0) {
        throw new TRPCError({ code: "CONFLICT", message: "No se pudo actualizar." })
      }
      const reserva = await ctx.db.reserva.findUniqueOrThrow({
        where: { id: input.reservaId },
        select: { id: true, codigo: true, clienteId: true },
      })
      if (reserva.clienteId) {
        await notificar({
          userId: reserva.clienteId,
          tipo: "chofer_en_camino",
          titulo: "Tu chofer va en camino",
          cuerpo: `El chofer se dirige al punto de recogida de la reserva ${reserva.codigo}.`,
          url: `/cliente/reservas/${reserva.id}`,
        })
      }
      return { ok: true }
    }),

  /** Chofer: "ya llegué". Notifica al cliente e inicia la ventana de espera. */
  marcarLlegada: roleProcedure("CHOFER", "ADMIN")
    .input(z.object({ reservaId: z.cuid() }))
    .mutation(async ({ ctx, input }) => {
      const esperaHasta = new Date(Date.now() + ESPERA_MINUTOS * 60_000)
      const { count } = await ctx.db.reserva.updateMany({
        where: {
          id: input.reservaId,
          choferId: ctx.session.user.id,
          estado: "ACEPTADA",
        },
        data: { choferLlegoEn: new Date(), choferEnCaminoEn: new Date(), esperaHasta },
      })
      if (count === 0) {
        throw new TRPCError({ code: "CONFLICT", message: "No se pudo actualizar." })
      }
      const reserva = await ctx.db.reserva.findUniqueOrThrow({
        where: { id: input.reservaId },
        select: { id: true, codigo: true, clienteId: true, emailContacto: true },
      })
      if (reserva.clienteId) {
        await notificarConEmail({
          userId: reserva.clienteId,
          tipo: "chofer_llego",
          titulo: "¡Tu chofer llegó!",
          cuerpo: `El chofer te espera en el punto de recogida (${reserva.codigo}). Confirma tu salida; tienes ${ESPERA_MINUTOS} minutos.`,
          url: `/cliente/reservas/${reserva.id}`,
          emailDestino: reserva.emailContacto,
        })
      }
      return { ok: true, esperaHasta }
    }),

  /** Cliente: "ya voy saliendo". Detiene la ventana de auto-cancelación. */
  confirmarSalida: protectedProcedure
    .input(z.object({ reservaId: z.cuid() }))
    .mutation(async ({ ctx, input }) => {
      const { count } = await ctx.db.reserva.updateMany({
        where: {
          id: input.reservaId,
          clienteId: ctx.session.user.id,
          estado: "ACEPTADA",
          choferLlegoEn: { not: null },
        },
        data: { clienteSaleEn: new Date(), esperaHasta: null },
      })
      if (count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tu chofer aún no ha marcado su llegada.",
        })
      }
      const reserva = await ctx.db.reserva.findUniqueOrThrow({
        where: { id: input.reservaId },
        select: { codigo: true, choferId: true },
      })
      if (reserva.choferId) {
        await notificar({
          userId: reserva.choferId,
          tipo: "cliente_sale",
          titulo: "El cliente va saliendo",
          cuerpo: `El cliente de la reserva ${reserva.codigo} confirmó que va saliendo.`,
          url: "/chofer",
        })
      }
      return { ok: true }
    }),

  /** Cancela la reserva si venció la espera (lo llama el contador del cliente). */
  expirarEspera: protectedProcedure
    .input(z.object({ reservaId: z.cuid() }))
    .mutation(async ({ ctx, input }) => {
      const reserva = await ctx.db.reserva.findUnique({
        where: { id: input.reservaId },
        select: { clienteId: true, choferId: true },
      })
      if (
        !reserva ||
        (reserva.clienteId !== ctx.session.user.id &&
          reserva.choferId !== ctx.session.user.id &&
          ctx.session.user.role !== "ADMIN")
      ) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reserva no encontrada." })
      }
      const canceladas = await cancelarEsperasVencidas(ctx.db, {
        reservaId: input.reservaId,
      })
      return { cancelada: canceladas > 0 }
    }),

  /** Contacto del cliente para el chofer asignado (reserva ya aceptada). */
  contactoCliente: roleProcedure("CHOFER", "ADMIN")
    .input(z.object({ reservaId: z.cuid() }))
    .query(async ({ ctx, input }) => {
      const reserva = await ctx.db.reserva.findUnique({
        where: { id: input.reservaId },
        select: {
          choferId: true,
          estado: true,
          nombreContacto: true,
          telefonoContacto: true,
          emailContacto: true,
        },
      })
      if (
        !reserva ||
        (reserva.choferId !== ctx.session.user.id && ctx.session.user.role !== "ADMIN")
      ) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reserva no encontrada." })
      }
      return reserva
    }),

  /** Transiciones del chofer asignado: ACEPTADA→EN_CURSO→FINALIZADA. */
  cambiarEstado: roleProcedure("CHOFER", "ADMIN")
    .input(
      z.object({
        reservaId: z.cuid(),
        accion: z.enum(["iniciar", "finalizar"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const transicion =
        input.accion === "iniciar"
          ? { desde: "ACEPTADA" as const, hasta: "EN_CURSO" as const, campo: { iniciadaEn: new Date() } }
          : { desde: "EN_CURSO" as const, hasta: "FINALIZADA" as const, campo: { finalizadaEn: new Date() } }

      const { count } = await ctx.db.reserva.updateMany({
        where: {
          id: input.reservaId,
          choferId: ctx.session.user.id,
          estado: transicion.desde,
        },
        data: { estado: transicion.hasta, ...transicion.campo },
      })
      if (count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `La reserva no está en estado ${transicion.desde} o no te pertenece.`,
        })
      }
      const reserva = await ctx.db.reserva.findUniqueOrThrow({
        where: { id: input.reservaId },
        select: { id: true, codigo: true, clienteId: true, emailContacto: true },
      })
      if (reserva.clienteId) {
        const esFin = input.accion === "finalizar"
        await notificar({
          userId: reserva.clienteId,
          tipo: esFin ? "reserva_finalizada" : "reserva_en_curso",
          titulo: esFin ? "Viaje finalizado" : "Viaje en curso",
          cuerpo: esFin
            ? `Tu viaje ${reserva.codigo} finalizó. ¡Puedes dejar una reseña!`
            : `Tu viaje ${reserva.codigo} está en curso.`,
          url: `/cliente/reservas/${reserva.id}`,
        })
      }
      return { ok: true }
    }),

  // ------------------------------------------------------------
  // Portal de admin
  // ------------------------------------------------------------

  /** Listado completo con filtros (portal de admin). */
  listarAdmin: roleProcedure("ADMIN")
    .input(filtrosReservasAdminSchema)
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input.estado ? { estado: input.estado } : {}),
        ...(input.clienteId ? { clienteId: input.clienteId } : {}),
        ...(input.choferId ? { choferId: input.choferId } : {}),
        ...(input.desde || input.hasta
          ? {
              createdAt: {
                ...(input.desde ? { gte: input.desde } : {}),
                ...(input.hasta ? { lte: input.hasta } : {}),
              },
            }
          : {}),
        ...(input.busqueda
          ? {
              OR: [
                { codigo: { contains: input.busqueda, mode: "insensitive" as const } },
                { nombreContacto: { contains: input.busqueda, mode: "insensitive" as const } },
                { origenDireccion: { contains: input.busqueda, mode: "insensitive" as const } },
                { destinoDireccion: { contains: input.busqueda, mode: "insensitive" as const } },
              ],
            }
          : {}),
      }
      const reservas = await ctx.db.reserva.findMany({
        where,
        include: reservaListadoInclude,
        orderBy: { createdAt: "desc" },
        take: input.limite + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      })
      const nextCursor =
        reservas.length > input.limite ? reservas.pop()!.id : undefined
      return { reservas, nextCursor }
    }),

  /** Asignación manual de una reserva pendiente a un chofer concreto. */
  asignar: permissionProcedure(PERMISOS.ASIGNAR_RESERVAS)
    .input(asignarReservaSchema)
    .mutation(async ({ ctx, input }) => {
      const chofer = await ctx.db.user.findFirst({
        where: { id: input.choferId, role: "CHOFER", activo: true },
        select: { id: true, name: true },
      })
      if (!chofer) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El chofer seleccionado no existe o está inactivo.",
        })
      }
      const { count } = await ctx.db.reserva.updateMany({
        where: { id: input.reservaId, estado: "PENDIENTE" },
        data: { estado: "ACEPTADA", choferId: chofer.id, aceptadaEn: new Date() },
      })
      if (count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "La reserva ya no está pendiente.",
        })
      }
      const reserva = await ctx.db.reserva.findUniqueOrThrow({
        where: { id: input.reservaId },
        select: {
          id: true,
          codigo: true,
          clienteId: true,
          emailContacto: true,
          origenDireccion: true,
          destinoDireccion: true,
        },
      })
      // Email + in-app al chofer (asignación manual del admin).
      await notificarConEmail({
        userId: chofer.id,
        tipo: "reserva_asignada",
        titulo: "Reserva asignada",
        cuerpo: `Se te asignó la reserva ${reserva.codigo}: ${reserva.origenDireccion} → ${reserva.destinoDireccion}.`,
        url: "/chofer",
      })
      const cuerpoCliente = `Tu reserva ${reserva.codigo} fue confirmada con el chofer ${chofer.name}.`
      if (reserva.clienteId) {
        await notificarConEmail({
          userId: reserva.clienteId,
          tipo: "reserva_aceptada",
          titulo: "Reserva confirmada",
          cuerpo: cuerpoCliente,
          url: `/cliente/reservas/${reserva.id}`,
          emailDestino: reserva.emailContacto,
        })
      } else if (reserva.emailContacto) {
        emailAInvitado({
          email: reserva.emailContacto,
          titulo: "Reserva confirmada",
          cuerpo: cuerpoCliente,
          url: `/reserva/${reserva.codigo}`,
        })
      }
      return { ok: true }
    }),
})
