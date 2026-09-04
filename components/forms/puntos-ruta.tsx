"use client"

import { RiAddLine, RiCloseLine, RiMapPin2Fill } from "@/components/icons"

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
        "group flex min-h-14 items-center gap-3 rounded-2xl bg-card px-3 py-2.5 text-sm shadow-sm transition-[background-color,box-shadow]",
        activo && "bg-primary/15 shadow-[0_0_0_2px_var(--color-primary)]"
      )}
    >
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl bg-muted", color)}>
        <RiMapPin2Fill className="size-4" />
      </span>
      <button
        type="button"
        className="min-w-0 flex-1 text-left leading-snug"
        onClick={() => setPuntoActivo(objetivo)}
        title="Fijar este punto con el mapa"
      >
        <span className="block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {etiqueta}
        </span>
        <span className={cn("mt-0.5 block line-clamp-2 break-words", !direccion && "text-muted-foreground")}>
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
    <div className="flex flex-col gap-2.5">
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
          className="mt-1 w-full bg-card"
          onClick={agregarParada}
        >
          <RiAddLine data-icon="inline-start" />
          Añadir parada intermedia
        </Button>
      )}
    </div>
  )
}
