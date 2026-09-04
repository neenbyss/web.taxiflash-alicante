import { DetalleReservaCliente } from "@/components/views/detalle-reserva-cliente"
import { requireRole } from "@/server/session"

export const metadata = { title: "Detalle de reserva" }

export default async function DetalleReservaPage(
  props: PageProps<"/customer/bookings/[id]">
) {
  const session = await requireRole("CLIENTE")
  const { id } = await props.params
  return <DetalleReservaCliente reservaId={id} miUserId={session.user.id} />
}
