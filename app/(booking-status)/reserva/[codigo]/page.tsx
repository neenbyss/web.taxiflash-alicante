import { EstadoReservaPublico } from "@/components/views/estado-reserva-publico"

export const metadata = { title: "Estado de reserva" }

export default async function EstadoReservaPage(
  props: PageProps<"/reserva/[codigo]">
) {
  const { codigo } = await props.params
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <EstadoReservaPublico codigo={decodeURIComponent(codigo)} />
    </main>
  )
}
