"use client"

import { RiAddLine, RiCloseLine, RiMapPin2Fill } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useReservaBorrador, type PuntoActivo } from "@/stores/reserva-borrador"

function mismoObjetivo(a: PuntoActivo, b: PuntoActivo): boolean {
  if (typeof a === "string" || typeof b === "string") return a === b
  return a.parada === b.parada
}

type FilaProps = {
  etiqueta: string
  color: string
  direccion: string | null
  objetivo: PuntoActivo
  onQuitar?: () => void
}

function FilaPunto({ etiqueta, color, direccion, objetivo, onQuitar }: FilaProps) {
  const { puntoActivo, setPuntoActivo } = useReservaBorrador()
  const activo = mismoObjetivo(puntoActivo, objetivo)
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
        activo && "border-primary ring-2 ring-primary/30"
      )}
    >
      <RiMapPin2Fill className={cn("size-4 shrink-0", color)} />
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => setPuntoActivo(objetivo)}
        title="Fijar este punto con el mapa"
      >
        <span className="mr-2 text-xs font-medium text-muted-foreground uppercase">
          {etiqueta}
        </span>
        <span className={cn("break-words", !direccion && "text-muted-foreground italic")}>
          {direccion ?? "Sin fijar — haz click en el mapa"}
        </span>
      </button>
      {onQuitar && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Quitar parada"
          onClick={onQuitar}
        >
          <RiCloseLine />
        </Button>
      )}
    </div>
  )
}

/** Origen, paradas intermedias y destino del borrador de reserva. */
export function PuntosRuta() {
  const { origen, destino, paradas, agregarParada, quitarParada } =
    useReservaBorrador()

  return (
    <div className="flex flex-col gap-2">
      <FilaPunto
        etiqueta="Origen"
        color="text-emerald-600"
        direccion={origen?.direccion ?? null}
        objetivo="origen"
      />
      {paradas.map((parada, i) => (
        <FilaPunto
          key={i}
          etiqueta={`Parada ${i + 1}`}
          color="text-blue-600"
          direccion={parada?.direccion ?? null}
          objetivo={{ parada: i }}
          onQuitar={() => quitarParada(i)}
        />
      ))}
      <FilaPunto
        etiqueta="Destino"
        color="text-red-600"
        direccion={destino?.direccion ?? null}
        objetivo="destino"
      />
      {paradas.length < 3 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={agregarParada}
        >
          <RiAddLine data-icon="inline-start" />
          Añadir parada intermedia
        </Button>
      )}
    </div>
  )
}
