import { ReporteDialog } from "@/components/dialogs/reporte-dialog"
import { PerfilForm } from "@/components/forms/perfil-form"
import { PageHeader } from "@/components/layout/page-header"

export const metadata = { title: "Mi perfil" }

export default function ClientePerfilPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader titulo="Tu perfil" descripcion="Mantén tus datos y preferencias listos para reservar más rápido." />
      <PerfilForm esCliente />
      <div className="max-w-3xl rounded-2xl bg-secondary p-5 text-secondary-foreground shadow-sm">
        <p className="text-sm font-medium">¿Algún problema?</p>
        <p className="mb-3 text-sm text-secondary-foreground/65">
          Envíanos un reporte y nuestro equipo lo revisará.
        </p>
        <ReporteDialog />
      </div>
    </div>
  )
}
