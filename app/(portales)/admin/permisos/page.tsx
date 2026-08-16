import { PageHeader } from "@/components/layout/page-header"
import { MatrizRolPermisos } from "@/components/tables/matriz-rol-permisos"

export const metadata = { title: "Permisos" }

export default function AdminPermisosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Permisos por rol"
        descripcion="Define qué puede hacer cada rol. Para excepciones puntuales usa los overrides por usuario desde la pestaña Usuarios."
      />
      <MatrizRolPermisos />
    </div>
  )
}
