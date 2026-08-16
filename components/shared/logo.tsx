import { RiTaxiLine, type RemixiconComponentType } from "@remixicon/react"
import Link from "next/link"

import { cn } from "@/lib/utils"

// ⚙️ Marca centralizada. Cambia aquí el icono, el texto o los tamaños y se
// actualiza en toda la web (header, footer, sidebar, auth, etc.).
const ICONO: RemixiconComponentType = RiTaxiLine
const NOMBRE = "TaxiFlash"

const TAMANOS = {
  sm: { badge: "size-7 rounded-lg", icono: "size-4", nombre: "text-sm", sub: "text-[10px]" },
  md: { badge: "size-8 rounded-lg", icono: "size-4", nombre: "text-base", sub: "text-xs" },
  lg: { badge: "size-9 rounded-xl", icono: "size-5", nombre: "text-lg", sub: "text-xs" },
  xl: { badge: "size-11 rounded-2xl", icono: "size-6", nombre: "text-xl", sub: "text-sm" },
} as const

type LogoProps = {
  /** Destino del enlace; null para renderizar sin enlace (embebido). */
  href?: string | null
  size?: keyof typeof TAMANOS
  /** Mostrar el nombre junto al icono. */
  showText?: boolean
  /** Texto secundario (ej. nombre del portal). */
  subtitle?: string
  /** Subtítulo debajo del nombre (columna) en vez de en línea. */
  stack?: boolean
  /** Icono dentro de un recuadro con color de marca. */
  badge?: boolean
  className?: string
}

/** Logo de marca reutilizable. */
export function Logo({
  href = "/",
  size = "md",
  showText = true,
  subtitle,
  stack = false,
  badge = true,
  className,
}: LogoProps) {
  const t = TAMANOS[size]

  const marca = badge ? (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-primary text-primary-foreground",
        t.badge
      )}
    >
      <ICONO className={t.icono} aria-hidden />
    </span>
  ) : (
    <ICONO className={cn("shrink-0", t.icono)} aria-hidden />
  )

  const texto = showText && (
    <span
      className={cn(
        "font-heading font-semibold leading-tight",
        stack ? "flex flex-col" : "flex items-baseline gap-1.5"
      )}
    >
      <span className={t.nombre}>{NOMBRE}</span>
      {subtitle && (
        <span className={cn("font-normal text-muted-foreground", t.sub)}>
          {stack ? subtitle : `· ${subtitle}`}
        </span>
      )}
    </span>
  )

  const clase = cn("inline-flex items-center gap-2", className)

  if (href === null) {
    return (
      <span className={clase} aria-label={NOMBRE}>
        {marca}
        {texto}
      </span>
    )
  }
  return (
    <Link href={href} className={clase} aria-label={NOMBRE}>
      {marca}
      {texto}
    </Link>
  )
}
