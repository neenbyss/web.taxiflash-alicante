import { PageHeader } from "@/components/layout/page-header"
import { ResumenReportes } from "@/components/views/resumen-reportes"

export const metadata = { title: "Administración" }

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Resumen general"
        descripcion="Vista rápida del estado del servicio."
      />
      <ResumenReportes />
    </div>
  )
}
