import { ReservaForm } from "@/components/forms/reserva-form"
import { PageHeader } from "@/components/layout/page-header"
import { requireRole } from "@/server/session"

export const metadata = { title: "Reservar taxi" }

export default async function ClienteReservarPage() {
  const session = await requireRole("CLIENTE")
  return (
    <div className="h-[calc(100dvh-6rem)] w-full min-w-0 overflow-hidden lg:h-auto lg:space-y-5 lg:overflow-visible">
      <div className="hidden lg:block">
        <PageHeader
          titulo="¿A dónde vamos?"
          descripcion="Organiza el recorrido, revisa la estimación y solicita tu taxi."
        />
      </div>
      <ReservaForm nombreUsuario={session.user.name} />
    </div>
  )
}
