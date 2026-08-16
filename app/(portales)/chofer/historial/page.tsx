import { PageHeader } from "@/components/layout/page-header"
import { MisViajes } from "@/components/lists/mis-viajes"
import { requireRole } from "@/server/session"

export const metadata = { title: "Historial de viajes" }

export default async function ChoferHistorialPage() {
  await requireRole("CHOFER")
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Historial de viajes"
        descripcion="Todos los viajes que has atendido."
      />
      <MisViajes soloActivas={false} />
    </div>
  )
}
