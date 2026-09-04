import { AlquilerForm } from "@/components/forms/alquiler-form"
import { requireRole } from "@/server/session"

export const metadata = { title: "Nuevo alquiler" }

export default async function ClienteAlquilerNuevoPage() {
  await requireRole("CLIENTE")
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 font-heading text-xl font-semibold">
        Alquiler entre ciudades
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Viajes interurbanos o servicio por horas, con precio confirmado
        manualmente por nuestro equipo.
      </p>
      <AlquilerForm />
    </div>
  )
}
