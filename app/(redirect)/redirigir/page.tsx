import type { Metadata } from "next"

import { Redirecting } from "@/components/auth/redirecting"
import { homeDeRol } from "@/lib/roles"
import { getServerSession } from "@/server/session"

export const metadata: Metadata = {
  title: "Redirigiendo",
  robots: { index: false, follow: false },
}

export default async function RedirigirPage() {
  const session = await getServerSession()
  const destination = session?.user.activo
    ? homeDeRol(session.user.role)
    : "/login"
  return <Redirecting destination={destination} />
}
