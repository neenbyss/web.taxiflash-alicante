import { PageHeader } from "@/components/layout/page-header"
import { ListaReservasCliente } from "@/components/lists/lista-reservas-cliente"

export const metadata = { title: "Mis reservas" }

export default function MisReservasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Historial de reservas"
        descripcion="Todas tus reservas y su estado."
      />
      <ListaReservasCliente soloActivas={false} />
    </div>
  )
}
