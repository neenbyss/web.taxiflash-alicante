// Seed idempotente: catálogo de permisos, permisos por rol y cuentas demo.
// Se ejecuta con `pnpm db:seed` (tsx). Usa imports relativos para no depender
// de la resolución de alias de TypeScript fuera de Next.

import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { hashPassword } from "better-auth/crypto"

import { PrismaClient } from "../lib/generated/prisma/client"
import type { Role } from "../lib/generated/prisma/enums"
import { CATALOGO_PERMISOS, PERMISOS_POR_ROL_DEFAULT } from "../lib/permisos"

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function seedPermisos() {
  for (const permiso of CATALOGO_PERMISOS) {
    await db.permiso.upsert({
      where: { codigo: permiso.codigo },
      create: permiso,
      update: { nombre: permiso.nombre, descripcion: permiso.descripcion },
    })
  }

  // Los defaults por rol solo se insertan si la tabla está vacía, para no
  // pisar cambios hechos por el admin en ejecuciones posteriores.
  const existentes = await db.rolPermiso.count()
  if (existentes > 0) return

  const permisos = await db.permiso.findMany()
  const porCodigo = new Map(permisos.map((p) => [p.codigo, p.id]))
  for (const [role, codigos] of Object.entries(PERMISOS_POR_ROL_DEFAULT)) {
    for (const codigo of codigos) {
      const permisoId = porCodigo.get(codigo)
      if (!permisoId) continue
      await db.rolPermiso.create({
        data: { role: role as Role, permisoId },
      })
    }
  }
  console.log("Permisos por rol inicializados.")
}

async function crearUsuario(opts: {
  name: string
  email: string
  password: string
  role: Role
  telefono?: string
}) {
  const existente = await db.user.findUnique({ where: { email: opts.email } })
  if (existente) return existente

  const usuario = await db.user.create({
    data: {
      name: opts.name,
      email: opts.email,
      emailVerified: true,
      role: opts.role,
      telefono: opts.telefono,
    },
  })
  // Cuenta de credenciales compatible con better-auth (mismo hash scrypt).
  await db.account.create({
    data: {
      userId: usuario.id,
      accountId: usuario.id,
      providerId: "credential",
      password: await hashPassword(opts.password),
    },
  })
  console.log(`Usuario creado: ${opts.email} (${opts.role})`)
  return usuario
}

async function main() {
  await seedPermisos()

  await crearUsuario({
    name: "Administrador",
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@taxiflash.local",
    password: process.env.SEED_ADMIN_PASSWORD ?? "Admin123!",
    role: "ADMIN",
  })
  await crearUsuario({
    name: "Chofer Demo",
    email: "chofer@taxiflash.local",
    password: "Chofer123!",
    role: "CHOFER",
    telefono: "+34600111222",
  })
  await crearUsuario({
    name: "Cliente Demo",
    email: "cliente@taxiflash.local",
    password: "Cliente123!",
    role: "CLIENTE",
    telefono: "+34600333444",
  })

  console.log("Seed completado.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
