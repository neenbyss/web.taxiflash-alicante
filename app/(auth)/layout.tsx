import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { homeDeRol } from "@/lib/roles"
import { getServerSession } from "@/server/session"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  if (session?.user.activo) redirect(homeDeRol(session.user.role))

  return <>{children}</>
}
