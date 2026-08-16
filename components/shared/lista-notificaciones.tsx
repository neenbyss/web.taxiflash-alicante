"use client"

import {
  NotificacionItem,
  type NotificacionData,
} from "@/components/shared/notificacion-item"
import { cn } from "@/lib/utils"

function Encabezado({ children, destacado }: { children: string; destacado?: boolean }) {
  return (
    <p
      className={cn(
        "px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide",
        destacado ? "text-primary" : "text-muted-foreground"
      )}
    >
      {children}
    </p>
  )
}

/**
 * Lista de notificaciones agrupada: primero "Nuevos" (sin leer) y luego
 * "Anteriores" (leídas, con su fecha). Compartida por el popover y la página.
 */
export function ListaNotificaciones({
  notificaciones,
  filtro,
  onLeida,
}: {
  notificaciones: NotificacionData[]
  filtro: "todas" | "sin_leer"
  onLeida: (id: string) => void
}) {
  const nuevas = notificaciones.filter((n) => !n.leida)
  const anteriores = notificaciones.filter((n) => n.leida)

  if (filtro === "sin_leer") {
    if (nuevas.length === 0) {
      return (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          No tienes notificaciones sin leer.
        </p>
      )
    }
    return (
      <div className="divide-y">
        {nuevas.map((n) => (
          <NotificacionItem key={n.id} notif={n} onLeida={onLeida} />
        ))}
      </div>
    )
  }

  if (notificaciones.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        No tienes notificaciones.
      </p>
    )
  }

  return (
    <div>
      {nuevas.length > 0 && (
        <section>
          <Encabezado destacado>Nuevos</Encabezado>
          <div className="divide-y">
            {nuevas.map((n) => (
              <NotificacionItem key={n.id} notif={n} onLeida={onLeida} />
            ))}
          </div>
        </section>
      )}
      {anteriores.length > 0 && (
        <section>
          <Encabezado>Anteriores</Encabezado>
          <div className="divide-y">
            {anteriores.map((n) => (
              <NotificacionItem key={n.id} notif={n} onLeida={onLeida} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
