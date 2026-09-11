"use client"

import { RiShieldCheckLine } from "@/components/icons"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"

const KEY = "taxiflash-consent"
const EVENT = "taxiflash-consent-change"
const PENDIENTE = "__pendiente__"

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}

function guardar(valor: string) {
  localStorage.setItem(KEY, valor)
  window.dispatchEvent(new Event(EVENT))
}

/** Diálogo nativo de permiso de notificaciones. */
function pedirNotificaciones() {
  if (
    typeof Notification !== "undefined" &&
    Notification.permission === "default"
  ) {
    void Notification.requestPermission().catch(() => {})
  }
}

/** Diálogo nativo de permiso de ubicación. */
function pedirUbicacion() {
  navigator.geolocation?.getCurrentPosition(
    () => {},
    () => {},
    { timeout: 8000 }
  )
}

/**
 * Aviso de cookies inferior (no modal). Bloquea el scroll de la página hasta
 * que se acepte o rechace. Al aceptar, solicita los permisos del navegador
 * (ubicación y notificaciones).
 *
 * useSyncExternalStore: en SSR devuelve "pendiente" (no renderiza) y en cliente
 * lee la decisión de localStorage sin setState en efecto.
 */
export function ConsentBanner() {
  const pathname = usePathname()
  const decision = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY),
    () => PENDIENTE
  )
  const visible =
    pathname !== "/redirigir" && decision !== PENDIENTE && !decision

  // Bloquea el scroll del documento mientras el aviso esté visible.
  useEffect(() => {
    if (!visible) return
    const previo = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previo
    }
  }, [visible])

  if (!visible) return null

  const aceptar = () => {
    guardar(JSON.stringify({ cookies: true, permisos: true, ts: Date.now() }))
    pedirNotificaciones()
    pedirUbicacion()
  }

  const rechazar = () => {
    guardar(JSON.stringify({ cookies: false, permisos: false, ts: Date.now() }))
  }

  return (
    <div className="fixed inset-0 bottom-0 z-100">
      {/* Velo sutil que refuerza el bloqueo, sin oscurecer como un modal */}
      <div className="pointer-events-none absolute inset-0 bottom-0 -z-10 h-full bg-linear-to-t from-inner-background/60 to-inner-background/40" />

      <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-end justify-end p-4">
        <div className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-2xl ring-1 ring-foreground/5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <RiShieldCheckLine className="size-5" aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <p className="font-medium">Respetamos tu privacidad</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Usamos una cookie esencial para mantener tu sesión. Si aceptas, tu
              navegador te pedirá permiso para usar tu ubicación (autocompletar
              tu recogida) y enviarte notificaciones sobre tus viajes. Consulta
              nuestra{" "}
              <Link
                href="/contacto"
                className="font-medium text-foreground underline underline-offset-4"
              >
                política de privacidad
              </Link>
              .
            </p>
          </div>

          <div className="flex shrink-0 gap-2 sm:flex-col-reverse lg:flex-row">
            <Button
              variant="outline"
              className="flex-1 sm:w-full lg:w-auto"
              onClick={rechazar}
            >
              Rechazar
            </Button>
            <Button
              className="flex-1 sm:w-full lg:w-auto"
              onClick={aceptar}
              autoFocus
            >
              Aceptar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
