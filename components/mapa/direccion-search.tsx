"use client"

import { RiSearchLine } from "@remixicon/react"
import { useEffect, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { buscarDireccion, type ResultadoGeocoding } from "@/lib/geocoding"

type DireccionSearchProps = {
  placeholder?: string
  onSelect: (resultado: ResultadoGeocoding) => void
}

/** Autocomplete de direcciones (Nominatim) con debounce. */
export function DireccionSearch({ placeholder, onSelect }: DireccionSearchProps) {
  const [consulta, setConsulta] = useState("")
  const [resultados, setResultados] = useState<ResultadoGeocoding[]>([])
  const [abierto, setAbierto] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const texto = consulta.trim()
      if (texto.length < 3) {
        setResultados([])
        setAbierto(false)
        return
      }
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const encontrados = await buscarDireccion(texto, controller.signal)
        setResultados(encontrados)
        setAbierto(true)
      } catch {
        // búsqueda cancelada o sin conexión: se ignora
      }
    }, 450)
    return () => clearTimeout(timeout)
  }, [consulta])

  return (
    <div className="relative">
      <RiSearchLine className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={consulta}
        onChange={(e) => setConsulta(e.target.value)}
        onFocus={() => resultados.length > 0 && setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        placeholder={placeholder ?? "Buscar dirección…"}
        className="bg-background pl-9"
        aria-label="Buscar dirección"
      />
      {abierto && resultados.length > 0 && (
        <ul className="absolute top-full right-0 left-0 z-1000 mt-1 max-h-56 overflow-y-auto rounded-xl border bg-popover text-sm shadow-lg">
          {resultados.map((resultado, i) => (
            <li key={`${resultado.lat}-${resultado.lng}-${i}`}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left transition-colors hover:bg-muted"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(resultado)
                  setConsulta("")
                  setAbierto(false)
                }}
              >
                {resultado.direccion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
