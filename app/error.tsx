"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

// Error boundary global (App Router). Debe ser Client Component.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-lg font-medium">Algo salió mal</h1>
      <p className="text-sm text-muted-foreground">
        Ocurrió un error inesperado. Puedes reintentar; si persiste, vuelve a
        cargar la página.
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </main>
  )
}
