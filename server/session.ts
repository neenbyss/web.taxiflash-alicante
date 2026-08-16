import { headers } from "next/headers"
import { redirect } from "next/navigation"

import type { Role } from "@/lib/generated/prisma/enums"
import { homeDeRol } from "@/lib/roles"
import { auth, type Session } from "@/server/auth"

export async function getServerSession(): Promise<Session | null> {
  return auth.api.getSession({ headers: await headers() })
}

/**
 * Guard de servidor para los layouts de portal: exige sesión activa y uno de
 * los roles indicados. El rol ADMIN es un SUPERCONJUNTO: puede entrar a
 * cualquier portal (para gestionar y también operar como chofer si hace
 * falta). Un rol que no corresponde se redirige a su propio portal.
 */
export async function requireRole(...roles: Role[]): Promise<Session> {
  const session = await getServerSession()
  if (!session) redirect("/login")
  if (!session.user.activo) redirect("/login?error=cuenta-desactivada")
  const rol = session.user.role as Role
  if (rol !== "ADMIN" && !roles.includes(rol)) {
    redirect(homeDeRol(rol))
  }
  return session
}
