import { PageHeader } from "@/components/layout/page-header"
import { ResenasDeChofer } from "@/components/lists/resenas-de-chofer"
import { requireRole } from "@/server/session"

export const metadata = { title: "Mis reseñas" }

export default async function ChoferResenasPage() {
  const session = await requireRole("CHOFER")
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Mi feedback"
        descripcion="Reseñas que los clientes dejaron sobre tus viajes."
      />
      <ResenasDeChofer choferId={session.user.id} />
    </div>
  )
}
