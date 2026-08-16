import { ReporteDialog } from "@/components/dialogs/reporte-dialog"
import { PerfilForm } from "@/components/forms/perfil-form"

export const metadata = { title: "Mi perfil" }

export default function ChoferPerfilPage() {
  return (
    <div className="flex flex-col gap-6">
      <PerfilForm esCliente={false} />
      <div className="max-w-xl rounded-2xl border p-4">
        <p className="text-sm font-medium">¿Algún problema?</p>
        <p className="mb-3 text-sm text-muted-foreground">
          Envíanos un reporte y nuestro equipo lo revisará.
        </p>
        <ReporteDialog />
      </div>
    </div>
  )
}
