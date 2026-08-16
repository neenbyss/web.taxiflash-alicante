import type { PrismaClient } from "@/lib/generated/prisma/client"
import { notificar } from "@/server/services/notificaciones.service"

/**
 * Auto-cancela reservas cuyo tiempo de espera venció: el chofer llegó, el
 * cliente no confirmó su salida y pasó `esperaHasta`. Se llama de forma
 * perezosa al leer los tableros (sin cron). Idempotente gracias al guard del
 * updateMany.
 */
export async function cancelarEsperasVencidas(
  db: PrismaClient,
  scope?: { reservaId?: string }
): Promise<number> {
  const candidatas = await db.reserva.findMany({
    where: {
      ...(scope?.reservaId ? { id: scope.reservaId } : {}),
      estado: "ACEPTADA",
      clienteSaleEn: null,
      choferLlegoEn: { not: null },
      esperaHasta: { lt: new Date() },
    },
    select: { id: true, codigo: true, clienteId: true, choferId: true },
  })

  let canceladas = 0
  for (const reserva of candidatas) {
    const { count } = await db.reserva.updateMany({
      where: { id: reserva.id, estado: "ACEPTADA", clienteSaleEn: null },
      data: {
        estado: "CANCELADA",
        motivoEstado: "Cancelada automáticamente: el cliente no se presentó.",
      },
    })
    if (count === 0) continue
    canceladas++
    if (reserva.clienteId) {
      await notificar({
        userId: reserva.clienteId,
        tipo: "reserva_cancelada_espera",
        titulo: "Reserva cancelada por espera",
        cuerpo: `Tu reserva ${reserva.codigo} se canceló porque no confirmaste tu salida a tiempo.`,
        url: `/cliente/reservas/${reserva.id}`,
      })
    }
    if (reserva.choferId) {
      await notificar({
        userId: reserva.choferId,
        tipo: "reserva_cancelada_espera",
        titulo: "Viaje cancelado por espera",
        cuerpo: `La reserva ${reserva.codigo} se canceló: el cliente no se presentó.`,
        url: "/chofer",
      })
    }
  }
  return canceladas
}
