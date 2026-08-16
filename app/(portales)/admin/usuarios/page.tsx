import { PageHeader } from "@/components/layout/page-header"
import { TablaUsuarios } from "@/components/tables/tabla-usuarios"

export const metadata = { title: "Usuarios" }

export default function AdminUsuariosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Usuarios"
        descripcion="Alta, baja y permisos de clientes, choferes y administradores."
      />
      <TablaUsuarios />
    </div>
  )
}
