// Seed local idempotente con datos suficientes para probar todos los portales.
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { hashPassword } from "better-auth/crypto"

import { PrismaClient } from "../lib/generated/prisma/client"
import type { Role } from "../lib/generated/prisma/enums"
import { CATALOGO_PERMISOS, PERMISOS_POR_ROL_DEFAULT } from "../lib/permisos"

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const now = Date.now()
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000)
const hoursFromNow = (hours: number) => new Date(now + hours * 3_600_000)

async function seedPermissions() {
  for (const permission of CATALOGO_PERMISOS) {
    await db.permiso.upsert({
      where: { codigo: permission.codigo },
      create: permission,
      update: { nombre: permission.nombre, descripcion: permission.descripcion },
    })
  }

  const permissions = await db.permiso.findMany()
  const byCode = new Map(permissions.map((permission) => [permission.codigo, permission.id]))
  for (const [role, codes] of Object.entries(PERMISOS_POR_ROL_DEFAULT)) {
    for (const code of codes) {
      const permisoId = byCode.get(code)
      if (!permisoId) continue
      await db.rolPermiso.upsert({
        where: { role_permisoId: { role: role as Role, permisoId } },
        create: { role: role as Role, permisoId },
        update: {},
      })
    }
  }
}

async function seedUser(input: {
  name: string
  email: string
  password: string
  role: Role
  telefono: string
}) {
  const user = await db.user.upsert({
    where: { email: input.email },
    create: {
      name: input.name,
      email: input.email,
      emailVerified: true,
      role: input.role,
      telefono: input.telefono,
      activo: true,
    },
    update: { name: input.name, role: input.role, telefono: input.telefono, activo: true },
  })
  const credential = await db.account.findFirst({
    where: {
      userId: user.id,
      providerId: "credential",
      issuer: "local:credential",
      accountId: user.id,
    },
    select: { id: true },
  })
  const password = await hashPassword(input.password)
  if (credential) {
    await db.account.update({ where: { id: credential.id }, data: { password } })
  } else {
    await db.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        issuer: "local:credential",
        password,
      },
    })
  }
  return user
}

async function main() {
  await seedPermissions()

  const admin = await seedUser({
    name: "Alex Moreno",
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@taxiflash.local",
    password: process.env.SEED_ADMIN_PASSWORD ?? "Admin123!",
    role: "ADMIN",
    telefono: "+34631000001",
  })
  const driver = await seedUser({ name: "Carlos Ruiz", email: "chofer@taxiflash.local", password: "Chofer123!", role: "CHOFER", telefono: "+34631000101" })
  const driver2 = await seedUser({ name: "Elena Martín", email: "elena.chofer@taxiflash.local", password: "Chofer123!", role: "CHOFER", telefono: "+34631000102" })
  const driver3 = await seedUser({ name: "David López", email: "david.chofer@taxiflash.local", password: "Chofer123!", role: "CHOFER", telefono: "+34631000103" })
  const customer = await seedUser({ name: "María García", email: "cliente@taxiflash.local", password: "Cliente123!", role: "CLIENTE", telefono: "+34631000201" })
  const customer2 = await seedUser({ name: "Javier Torres", email: "javier@taxiflash.local", password: "Cliente123!", role: "CLIENTE", telefono: "+34631000202" })
  const customer3 = await seedUser({ name: "Laura Sánchez", email: "laura@taxiflash.local", password: "Cliente123!", role: "CLIENTE", telefono: "+34631000203" })
  const customer4 = await seedUser({ name: "Pablo Costa", email: "pablo@taxiflash.local", password: "Cliente123!", role: "CLIENTE", telefono: "+34631000204" })

  const bookingSeeds = [
    { code: "TF-1842", state: "EN_CURSO" as const, client: customer, assigned: driver, origin: "Plaza de los Luceros, Alicante", destination: "Aeropuerto de Alicante-Elche", distance: 12.7, fare: 24.8, created: 35 },
    { code: "TF-1841", state: "PENDIENTE" as const, client: customer2, assigned: null, origin: "Mercado Central de Alicante", destination: "Playa de San Juan", distance: 8.9, fare: 18.2, created: 12 },
    { code: "TF-1840", state: "ACEPTADA" as const, client: customer3, assigned: driver2, origin: "Estación Alicante-Terminal", destination: "Hotel Meliá Alicante", distance: 3.8, fare: 12.4, created: 55 },
    { code: "TF-1839", state: "FINALIZADA" as const, client: customer4, assigned: driver, origin: "Avenida de Dénia", destination: "Castillo de Santa Bárbara", distance: 6.4, fare: 15.6, created: 180 },
    { code: "TF-1838", state: "CANCELADA" as const, client: customer, assigned: null, origin: "Benalúa", destination: "Hospital General Universitario", distance: 5.1, fare: 11.9, created: 260 },
    { code: "TF-1837", state: "FINALIZADA" as const, client: customer2, assigned: driver2, origin: "Cabo de las Huertas", destination: "Centro de Alicante", distance: 9.6, fare: 19.3, created: 380 },
    { code: "TF-1836", state: "PENDIENTE" as const, client: customer3, assigned: null, origin: "San Vicente del Raspeig", destination: "Aeropuerto de Alicante-Elche", distance: 18.2, fare: 31.7, created: 25 },
    { code: "TF-1835", state: "FINALIZADA" as const, client: customer4, assigned: driver3, origin: "Centro Comercial Plaza Mar 2", destination: "Estación Alicante-Terminal", distance: 4.3, fare: 10.5, created: 520 },
    { code: "TF-1834", state: "RECHAZADA" as const, client: customer, assigned: null, origin: "El Campello", destination: "Alicante Centro", distance: 13.1, fare: 27.1, created: 650 },
    { code: "TF-1833", state: "FINALIZADA" as const, client: customer2, assigned: driver, origin: "Puerto de Alicante", destination: "Gran Vía", distance: 5.8, fare: 13.8, created: 780 },
    { code: "TF-1832", state: "ACEPTADA" as const, client: customer3, assigned: driver3, origin: "Carolinas Altas", destination: "Universidad de Alicante", distance: 8.1, fare: 16.4, created: 90, scheduled: 20 },
    { code: "TF-1831", state: "PENDIENTE" as const, client: customer4, assigned: null, origin: "Alicante Centro", destination: "Elche", distance: 25.4, fare: 38.9, created: 8, scheduled: 28 },
  ]

  const bookings = []
  for (const item of bookingSeeds) {
    const booking = await db.reserva.upsert({
      where: { codigo: item.code },
      create: {
        codigo: item.code,
        estado: item.state,
        tipo: item.scheduled ? "PROGRAMADA" : "INMEDIATA",
        fechaProgramada: item.scheduled ? hoursFromNow(item.scheduled) : null,
        clienteId: item.client.id,
        nombreContacto: item.client.name,
        telefonoContacto: item.client.telefono,
        emailContacto: item.client.email,
        choferId: item.assigned?.id ?? null,
        origenDireccion: item.origin,
        origenLat: 38.3452,
        origenLng: -0.481,
        destinoDireccion: item.destination,
        destinoLat: 38.2822,
        destinoLng: -0.5582,
        distanciaKm: item.distance,
        tarifaEstimada: item.fare,
        createdAt: minutesAgo(item.created),
        aceptadaEn: item.assigned ? minutesAgo(Math.max(item.created - 10, 1)) : null,
        iniciadaEn: item.state === "EN_CURSO" ? minutesAgo(15) : null,
        finalizadaEn: item.state === "FINALIZADA" ? minutesAgo(Math.max(item.created - 35, 1)) : null,
      },
      update: {
        estado: item.state,
        clienteId: item.client.id,
        choferId: item.assigned?.id ?? null,
        fechaProgramada: item.scheduled ? hoursFromNow(item.scheduled) : null,
      },
    })
    bookings.push(booking)
  }

  const finished = bookings.filter((booking) => booking.estado === "FINALIZADA")
  for (const [index, booking] of finished.entries()) {
    await db.resena.upsert({
      where: { reservaId: booking.id },
      create: {
        reservaId: booking.id,
        clienteId: booking.clienteId!,
        choferId: booking.choferId,
        puntuacion: index === 1 ? 4 : 5,
        titulo: index === 1 ? "Muy buen servicio" : "Excelente trayecto",
        descripcion: "Conductor puntual, amable y recorrido muy cómodo.",
      },
      update: {},
    })
  }

  const rentals = [
    ["A-4101", "A_CONFIRMAR" as const, customer.id, "Alicante", "Valencia", null, null],
    ["A-4100", "CONFIRMADO" as const, customer2.id, "Alicante", "Murcia", 145, driver2.id],
    ["A-4099", "FINALIZADO" as const, customer3.id, "Alicante", "Benidorm", 92, driver3.id],
  ] as const
  for (const [code, state, clientId, from, to, price, driverId] of rentals) {
    const client = await db.user.findUniqueOrThrow({ where: { id: clientId } })
    await db.alquilerEntreCiudades.upsert({
      where: { codigo: code },
      create: {
        codigo: code, estado: state, clienteId: clientId, nombreContacto: client.name,
        telefonoContacto: client.telefono, emailContacto: client.email,
        choferId: driverId, ciudadOrigen: from, ciudadDestino: to,
        fecha: hoursFromNow(48), modalidad: "interurbano", precioConfirmado: price,
      },
      update: { estado: state, choferId: driverId, precioConfirmado: price },
    })
  }

  await db.notificacion.deleteMany({ where: { tipo: { startsWith: "seed_" } } })
  await db.notificacion.createMany({ data: [
    { userId: admin.id, tipo: "seed_reserva", titulo: "Nueva reserva pendiente", cuerpo: "TF-1841 necesita un chofer para Playa San Juan.", url: "/admin/bookings" },
    { userId: admin.id, tipo: "seed_alquiler", titulo: "Alquiler por confirmar", cuerpo: "Solicitud Alicante → Valencia pendiente de precio.", url: "/admin/rentals" },
    { userId: driver.id, tipo: "seed_viaje", titulo: "Nuevo viaje disponible", cuerpo: "Recogida en Mercado Central de Alicante.", url: "/driver" },
    { userId: driver.id, tipo: "seed_resena", titulo: "Nueva reseña recibida", cuerpo: "Un cliente dejó una valoración de 5 estrellas.", url: "/driver/reviews", leida: true },
    { userId: customer.id, tipo: "seed_aceptada", titulo: "Reserva aceptada", cuerpo: "Carlos Ruiz aceptó tu reserva TF-1842.", url: `/customer/bookings/${bookings[0].id}` },
    { userId: customer.id, tipo: "seed_camino", titulo: "Tu chofer va en camino", cuerpo: "Carlos se dirige al punto de recogida.", url: `/customer/bookings/${bookings[0].id}` },
    { userId: customer2.id, tipo: "seed_resumen", titulo: "Historial actualizado", cuerpo: "Tu último trayecto ya está disponible.", url: "/customer/bookings", leida: true },
  ] })

  await db.reporte.deleteMany({ where: { categoria: { in: ["seed_demo", "seed_test"] } } })
  await db.reporte.createMany({ data: [
    { autorId: customer.id, reservaId: bookings[0].id, categoria: "seed_test", descripcion: "Consulta de prueba sobre el punto de recogida.", estado: "ABIERTO" },
    { autorId: customer2.id, reservaId: bookings[5].id, categoria: "seed_test", descripcion: "Incidencia resuelta para validar el historial.", estado: "RESUELTO", notaAdmin: "Revisado por administración." },
  ] })

  console.log("Seed completo: 8 usuarios, 12 reservas, 3 alquileres, reseñas, reportes y notificaciones.")
  console.log("Accesos: admin@taxiflash.local / Admin123! · chofer@taxiflash.local / Chofer123! · cliente@taxiflash.local / Cliente123!")
}

main()
  .catch((error) => { console.error(error); process.exit(1) })
  .finally(() => db.$disconnect())
