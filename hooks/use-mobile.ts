import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

/**
 * true en viewport móvil. Usa useSyncExternalStore (el primitivo correcto
 * para suscribirse a media queries): sin setState en efectos.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    // El servidor no conoce el viewport. Partimos de la variante liviana para
    // que un móvil nunca monte primero la experiencia animada de escritorio.
    () => true
  )
}
