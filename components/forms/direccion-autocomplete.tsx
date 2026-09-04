"use client"

import { RiCloseLine, RiMapPin2Fill } from "@/components/icons"
import { useEffect, useId, useRef, useState } from "react"

import { buscarDireccion, type ResultadoGeocoding } from "@/lib/geocoding"
import { cn } from "@/lib/utils"

type DireccionAutocompleteProps = {
  label: string
  value: ResultadoGeocoding | null
  onChange: (valor: ResultadoGeocoding | null) => void
  placeholder?: string
}

/**
 * Campo de dirección con autocompletado (patrón combobox accesible):
 * el usuario escribe y elige de una lista, con navegación por teclado
 * (flechas, Enter, Esc). Reemplaza la selección "a ciegas" en el mapa.
 */
export function DireccionAutocomplete({
  label,
  value,
  onChange,
  placeholder = "Escribe una dirección…",
}: DireccionAutocompleteProps) {
  const inputId = useId()
  const listboxId = useId()

  const [texto, setTexto] = useState(value?.direccion ?? "")
  const [resultados, setResultados] = useState<ResultadoGeocoding[]>([])
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(-1)
  const [cargando, setCargando] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Sincroniza el texto cuando llega una selección nueva desde fuera.
  // Se hace en render con guardián de valor previo (patrón recomendado por
  // React), no en un efecto: evita los renders en cascada del lint.
  // Al escribir, value pasa a null y el guardián `if (value)` conserva
  // intacto lo que el usuario está tecleando.
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    if (value) setTexto(value.direccion)
  }

  useEffect(() => {
    // Si el texto coincide con la selección actual, no busca de nuevo.
    if (value && texto === value.direccion) return
    const t = setTimeout(async () => {
      const q = texto.trim()
      if (q.length < 3) {
        setResultados([])
        setAbierto(false)
        return
      }
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setCargando(true)
      try {
        const encontrados = await buscarDireccion(q, controller.signal)
        setResultados(encontrados)
        setActivo(encontrados.length > 0 ? 0 : -1)
        setAbierto(true)
      } catch {
        /* búsqueda cancelada */
      } finally {
        setCargando(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [texto, value])

  const seleccionar = (r: ResultadoGeocoding) => {
    onChange(r)
    setTexto(r.direccion)
    setAbierto(false)
    setActivo(-1)
  }

  const limpiar = () => {
    onChange(null)
    setTexto("")
    setResultados([])
    setAbierto(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (!abierto && resultados.length) setAbierto(true)
      setActivo((i) => Math.min(i + 1, resultados.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActivo((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && abierto && activo >= 0) {
      e.preventDefault()
      seleccionar(resultados[activo])
    } else if (e.key === "Escape") {
      setAbierto(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="pl-2 text-sm font-medium text-secondary/70 dark:text-white/70"
      >
        {label}
      </label>
      <div className="relative">
        <div className="flex h-12 items-center overflow-hidden rounded-lg bg-input pr-1 pl-4 ring ring-ring/40 transition focus-within:ring-2 focus-within:ring-primary">
          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={abierto}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              abierto && activo >= 0 ? `${listboxId}-opt-${activo}` : undefined
            }
            autoComplete="off"
            value={texto}
            placeholder={placeholder}
            onChange={(e) => {
              setTexto(e.target.value)
              if (value) onChange(null)
            }}
            onKeyDown={onKeyDown}
            onFocus={() => resultados.length > 0 && setAbierto(true)}
            onBlur={() => setTimeout(() => setAbierto(false), 150)}
            className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {value ? (
            <button
              type="button"
              onClick={limpiar}
              aria-label={`Borrar ${label.toLowerCase()}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted"
            >
              <RiCloseLine aria-hidden />
            </button>
          ) : (
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-md text-foreground/60"
            >
              <RiMapPin2Fill />
            </span>
          )}
        </div>

        {/* Anuncio para lectores de pantalla */}
        <span className="sr-only" role="status" aria-live="polite">
          {abierto
            ? `${resultados.length} sugerencia${resultados.length === 1 ? "" : "s"}`
            : ""}
        </span>

        {abierto && (resultados.length > 0 || cargando) && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="absolute top-full right-0 left-0 z-1000 mt-1 max-h-60 overflow-y-auto rounded-xl border bg-popover text-sm shadow-lg"
          >
            {cargando && resultados.length === 0 && (
              <li className="px-3 py-2 text-muted-foreground">Buscando…</li>
            )}
            {resultados.map((r, i) => (
              <li
                key={`${r.lat}-${r.lng}-${i}`}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={i === activo}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActivo(i)}
                onClick={() => seleccionar(r)}
                className={cn(
                  "flex cursor-pointer items-start gap-2 px-3 py-2 transition-colors",
                  i === activo ? "bg-primary/15 text-foreground" : "hover:bg-muted"
                )}
              >
                <RiMapPin2Fill className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>{r.direccion}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
