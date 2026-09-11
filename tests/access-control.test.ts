import "dotenv/config"
import assert from "node:assert/strict"
import { after, test } from "node:test"
import { db } from "../server/db"
import { appRouter } from "../server/routers/_app"
import type { TRPCContext } from "../server/trpc"

after(async () => {
  await db.$disconnect()
})

const forbidden = (error: unknown) =>
  error instanceof Error && "code" in error && error.code === "FORBIDDEN"

test("anonymous callers cannot read profiles or notifications", async () => {
  const caller = appRouter.createCaller({
    db,
    session: null,
    ip: "test-anonymous",
  })
  const unauthorized = (error: unknown) =>
    error instanceof Error && "code" in error && error.code === "UNAUTHORIZED"
  await assert.rejects(caller.usuarios.miPerfil(), unauthorized)
  await assert.rejects(caller.notificaciones.listar(), unauthorized)
})

test("customer cannot read another customer's trip, chat, or driver feedback", async () => {
  const user = await db.user.findFirst({
    where: { role: "CLIENTE", activo: true },
  })
  assert.ok(user, "Requires local seed data")
  const trip = await db.reserva.findFirst({
    where: { clienteId: { not: user.id }, choferId: { not: null } },
  })
  assert.ok(trip?.choferId, "Requires a seeded trip owned by someone else")
  const now = new Date()
  const session: NonNullable<TRPCContext["session"]> = {
    user,
    session: {
      id: "read-only-test",
      userId: user.id,
      token: "not-a-real-session",
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(now.getTime() + 60_000),
      ipAddress: null,
      userAgent: null,
    },
  }
  const caller = appRouter.createCaller({ db, session, ip: "test-customer" })
  await assert.rejects(
    caller.reservas.detalle({ reservaId: trip.id }),
    forbidden
  )
  await assert.rejects(caller.chat.mensajes({ reservaId: trip.id }), forbidden)
  await assert.rejects(
    caller.resenas.deChofer({ choferId: trip.choferId }),
    forbidden
  )
  await assert.rejects(
    caller.usuarios.listar({ incluirInactivos: false, limite: 20 }),
    forbidden
  )
})
