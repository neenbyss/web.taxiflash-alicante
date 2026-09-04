import { Redirecting } from "@/components/auth/redirecting"
import { homeDeRol } from "@/lib/roles"
import { getServerSession } from "@/server/session"

export default async function RedirigirPage() {
  const session = await getServerSession()
  const destination = session ? homeDeRol(session.user.role) : "/login"
  return <Redirecting destination={destination} />
}
