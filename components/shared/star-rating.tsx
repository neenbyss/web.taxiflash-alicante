"use client"

import { RiStarFill, RiStarLine } from "@remixicon/react"
import { useState } from "react"

import { cn } from "@/lib/utils"

type StarRatingProps = {
  valor: number
  /** Si se pasa, las estrellas son interactivas. */
  onChange?: (valor: number) => void
  tamano?: "sm" | "md" | "lg"
}

const TAMANOS = { sm: "size-4", md: "size-6", lg: "size-8" }

/** Puntuación de 1 a 5 estrellas, en modo lectura o selección. */
export function StarRating({ valor, onChange, tamano = "md" }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const interactivo = Boolean(onChange)
  const mostrado = hover || valor

  return (
    <div
      className="flex items-center gap-0.5"
      role={interactivo ? "radiogroup" : undefined}
      aria-label={`Puntuación: ${valor} de 5`}
    >
      {[1, 2, 3, 4, 5].map((estrella) => {
        const activa = estrella <= mostrado
        const Icono = activa ? RiStarFill : RiStarLine
        if (!interactivo) {
          return (
            <Icono
              key={estrella}
              className={cn(TAMANOS[tamano], activa ? "text-amber-500" : "text-muted-foreground/40")}
            />
          )
        }
        return (
          <button
            key={estrella}
            type="button"
            role="radio"
            aria-checked={valor === estrella}
            aria-label={`${estrella} estrella${estrella > 1 ? "s" : ""}`}
            className="rounded transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onMouseEnter={() => setHover(estrella)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange?.(estrella)}
          >
            <Icono
              className={cn(TAMANOS[tamano], activa ? "text-amber-500" : "text-muted-foreground/40")}
            />
          </button>
        )
      })}
    </div>
  )
}
