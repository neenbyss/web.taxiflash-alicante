"use client"

import { RiFocus3Line, RiMapPin2Line, RiSearchLine, RiTimeLine } from "@remixicon/react"
import dynamic from "next/dynamic"
import { useMemo, useState } from "react"

import { TaxiIcon } from "@/components/icons/taxi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { ALICANTE_CENTER, taxiLocations } from "@/lib/locations"
import { cn } from "@/lib/utils"

// Leaflet toca `window`: el mapa se carga solo en el navegador.
const UbicacionesMap = dynamic(() => import("./ubicaciones-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full min-h-96 rounded-2xl" />,
})

export function UbicacionesExplorer() {
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return taxiLocations
    return taxiLocations.filter((l) =>
      [l.name, l.address, l.district].some((f) => f.toLowerCase().includes(q))
    )
  }, [query])

  const selected = taxiLocations.find((l) => l.id === selectedId) ?? null

  return (
    <section className="container-screen-2xl grid grid-cols-1 gap-6 pt-8 pb-16 lg:grid-cols-[.6fr_1fr] lg:gap-10">
      <div className="flex flex-col">
        <InputGroup className="max-w-full">
          <InputGroupInput
            placeholder="Buscar parada, calle o zona en Alicante..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar parada"
          />
          <InputGroupAddon>
            <RiSearchLine />
          </InputGroupAddon>
        </InputGroup>

        <div className="mt-8 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-2xl font-medium">
              {filtered.length}{" "}
              <span className="text-base font-normal opacity-60">
                {filtered.length === 1 ? "parada encontrada" : "paradas encontradas"}
              </span>
            </span>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-sm opacity-60 transition hover:opacity-100"
                type="button"
              >
                Limpiar
              </button>
            )}
          </div>

          <ul className="flex max-h-128 flex-col gap-3 overflow-y-auto pr-1 lg:max-h-160">
            {filtered.length === 0 && (
              <li className="py-12 text-center opacity-60">
                No hay paradas que coincidan con &ldquo;{query}&rdquo;.
              </li>
            )}
            {filtered.map((loc) => (
              <li key={loc.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(loc.id)}
                  aria-pressed={selectedId === loc.id}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border bg-card p-3 text-left shadow-sm transition hover:border-primary",
                    selectedId === loc.id && "border-primary ring-2 ring-primary/30"
                  )}
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <TaxiIcon className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-base font-medium">{loc.name}</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <RiMapPin2Line className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{loc.address}</span>
                    </span>
                    <span className="mt-1 flex items-center gap-3 text-xs opacity-70">
                      <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">
                        {loc.district}
                      </span>
                      {loc.hours && (
                        <span className="flex items-center gap-1">
                          <RiTimeLine className="size-3" aria-hidden />
                          {loc.hours}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="size-full min-h-96 lg:min-h-160">
        <Card className="size-full overflow-clip p-0">
          <UbicacionesMap
            locations={taxiLocations}
            selectedId={selectedId}
            seleccionada={selected}
            onSelect={setSelectedId}
            center={ALICANTE_CENTER}
          />
        </Card>
        {selected && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border p-3">
            <div className="mr-auto">
              <p className="text-xs text-muted-foreground uppercase">
                {selected.district}
              </p>
              <p className="font-medium">{selected.name}</p>
              <p className="text-xs text-muted-foreground">{selected.address}</p>
            </div>
            <Button
              size="sm"
              render={
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <RiFocus3Line className="size-4" aria-hidden />
              Cómo llegar
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
