import { ReservaForm } from "@/components/forms/reserva-form"
import { requireRole } from "@/server/session"

export const metadata = { title: "Reservar taxi" }

export default async function ClienteReservarPage() {
  const session = await requireRole("CLIENTE")
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-heading text-xl font-semibold">Nueva reserva</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Fija origen y destino en el mapa; te mostramos una tarifa estimada antes
        de confirmar.
      </p>
      <ReservaForm nombreUsuario={session.user.name} />
    </div>
  )
}
