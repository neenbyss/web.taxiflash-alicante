import { redirect } from "next/navigation"

import { homeDeRol } from "@/lib/roles"
import { getServerSession } from "@/server/session"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  if (session) redirect(homeDeRol(session.user.role))

  return <>{children}</>
}
