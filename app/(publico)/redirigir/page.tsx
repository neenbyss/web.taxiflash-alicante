import { redirect } from "next/navigation"

import { homeDeRol } from "@/lib/roles"
import { getServerSession } from "@/server/session"

// Destino post-login (credenciales y OAuth): manda a cada rol a su portal.
export default async function RedirigirPage() {
  const session = await getServerSession()
  redirect(session ? homeDeRol(session.user.role) : "/login")
}
