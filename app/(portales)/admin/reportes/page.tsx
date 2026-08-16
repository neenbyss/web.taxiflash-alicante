import { PageHeader } from "@/components/layout/page-header"
import { TablaReportes } from "@/components/tables/tabla-reportes"

export const metadata = { title: "Reportes" }

export default function AdminReportesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Reportes"
        descripcion="Incidencias enviadas por clientes y choferes. Cambia el estado a medida que las revisas."
      />
      <TablaReportes />
    </div>
  )
}
