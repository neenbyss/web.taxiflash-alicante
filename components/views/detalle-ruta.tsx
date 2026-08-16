import { MapaViaje } from "@/components/mapa/mapa-viaje"
import { Separator } from "@/components/ui/separator"
import { formatearKm, formatearMoneda } from "@/lib/formato"
import type { PuntoRuta } from "@/lib/validations/reserva"

type DetalleRutaProps = {
  reservaId: string
  origen: PuntoRuta
  destino: PuntoRuta
  paradas: PuntoRuta[]
  distanciaKm: number | null
  tarifaEstimada: number | null
}

/** Mapa con la ruta trazada + lista de direcciones + distancia/tarifa. */
export function DetalleRuta({
  reservaId,
  origen,
  destino,
  paradas,
  distanciaKm,
  tarifaEstimada,
}: DetalleRutaProps) {
  return (
    <div className="flex flex-col gap-3">
      <MapaViaje
        reservaId={reservaId}
        origen={origen}
        destino={destino}
        paradas={paradas}
      />
      <ol className="flex flex-col gap-2 text-sm">
        <li>
          <span className="text-xs text-muted-foreground uppercase">Origen</span>
          <p>{origen.direccion}</p>
        </li>
        {paradas.map((parada, i) => (
          <li key={i}>
            <span className="text-xs text-muted-foreground uppercase">
              Parada {i + 1}
            </span>
            <p>{parada.direccion}</p>
          </li>
        ))}
        <li>
          <span className="text-xs text-muted-foreground uppercase">Destino</span>
          <p>{destino.direccion}</p>
        </li>
      </ol>
      <Separator />
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span>
          Distancia: <strong>{formatearKm(distanciaKm)}</strong>
        </span>
        <span>
          Tarifa estimada: <strong>{formatearMoneda(tarifaEstimada)}</strong>
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        La ruta y la tarifa son estimadas; el cobro real es por taxímetro.
      </p>
    </div>
  )
}
