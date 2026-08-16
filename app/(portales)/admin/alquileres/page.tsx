import { PageHeader } from "@/components/layout/page-header"
import { TablaAlquileres } from "@/components/tables/tabla-alquileres"

export const metadata = { title: "Alquileres" }

export default function AdminAlquileresPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Alquileres entre ciudades"
        descripcion="Solicitudes con precio a confirmar manualmente."
      />
      <TablaAlquileres />
    </div>
  )
}
