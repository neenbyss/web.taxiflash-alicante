"use client"

import Link from "next/link"

import { formatearFecha } from "@/lib/formato"
import { cn } from "@/lib/utils"

export type NotificacionData = {
  id: string
  titulo: string
  cuerpo: string
  url: string | null
  leida: boolean
  createdAt: Date | string
}

/** Fila de notificación reutilizable (popover y página). */
export function NotificacionItem({
  notif,
  onLeida,
}: {
  notif: NotificacionData
  onLeida: (id: string) => void
}) {
  const contenido = (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50",
        !notif.leida && "bg-primary/5"
      )}
      onClick={() => !notif.leida && onLeida(notif.id)}
    >
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          notif.leida ? "bg-transparent" : "bg-primary"
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-medium">{notif.titulo}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatearFecha(notif.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-muted-foreground">{notif.cuerpo}</p>
      </div>
    </div>
  )

  return notif.url ? (
    <Link href={notif.url} className="block">
      {contenido}
    </Link>
  ) : (
    <div className="cursor-default">{contenido}</div>
  )
}
