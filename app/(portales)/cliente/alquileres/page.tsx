import Link from "next/link"

import { PageHeader } from "@/components/layout/page-header"
import { ListaAlquileresCliente } from "@/components/lists/lista-alquileres-cliente"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Mis alquileres" }

export default function ClienteAlquileresPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Alquiler entre ciudades"
        descripcion="Solicitudes por horas o interurbanas, con precio confirmado a mano."
      >
        <Button render={<Link href="/cliente/alquileres/nueva" />}>
          Nueva solicitud
        </Button>
      </PageHeader>
      <ListaAlquileresCliente />
    </div>
  )
}
