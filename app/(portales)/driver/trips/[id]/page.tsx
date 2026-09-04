import { DetalleViajeChofer } from "@/components/views/detalle-viaje-chofer"
import { requireRole } from "@/server/session"

export const metadata = { title: "Viaje" }

export default async function ChoferViajePage(
  props: PageProps<"/driver/trips/[id]">
) {
  const session = await requireRole("CHOFER")
  const { id } = await props.params
  return <DetalleViajeChofer reservaId={id} miUserId={session.user.id} />
}
