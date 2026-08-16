"use client"

import { RiTimeLine } from "@remixicon/react"
import { useEffect, useState } from "react"

type EsperaCountdownProps = {
  /** Momento límite; al llegar a 0 se llama a onExpire una sola vez. */
  esperaHasta: Date | string
  onExpire: () => void
}

/** Cuenta atrás de la ventana de espera tras la llegada del chofer. */
export function EsperaCountdown({ esperaHasta, onExpire }: EsperaCountdownProps) {
  const objetivo = new Date(esperaHasta).getTime()
  const [restante, setRestante] = useState(() => objetivo - Date.now())

  useEffect(() => {
    const id = setInterval(() => setRestante(objetivo - Date.now()), 1000)
    return () => clearInterval(id)
  }, [objetivo])

  useEffect(() => {
    if (restante <= 0) onExpire()
  }, [restante, onExpire])

  const seguros = Math.max(0, restante)
  const min = Math.floor(seguros / 60000)
  const seg = Math.floor((seguros % 60000) / 1000)

  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-sm font-medium tabular-nums"
      role="timer"
      aria-live="polite"
    >
      <RiTimeLine className="size-4" aria-hidden />
      {min}:{seg.toString().padStart(2, "0")}
    </span>
  )
}
