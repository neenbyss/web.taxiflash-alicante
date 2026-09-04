import { PageHeader } from "@/components/layout/page-header"
import { TablaReservasAdmin } from "@/components/tables/tabla-reservas-admin"

export const metadata = { title: "Reservas" }

export default function AdminReservasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Reservas"
        descripcion="Todas las reservas del sistema. Las pendientes pueden asignarse manualmente a un chofer."
      />
      <TablaReservasAdmin />
    </div>
  )
}
