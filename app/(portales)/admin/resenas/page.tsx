import { PageHeader } from "@/components/layout/page-header"
import { TablaResenas } from "@/components/tables/tabla-resenas"

export const metadata = { title: "Reseñas" }

export default function AdminResenasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Reseñas"
        descripcion="Todas las reseñas de clientes. Las ocultas dejan de mostrarse fuera de este panel."
      />
      <TablaResenas />
    </div>
  )
}
