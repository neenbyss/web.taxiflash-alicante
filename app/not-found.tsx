import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-heading text-5xl font-semibold">404</p>
      <h1 className="text-lg font-medium">Página no encontrada</h1>
      <p className="text-sm text-muted-foreground">
        La ruta que buscas no existe o cambió de sitio.
      </p>
      <Button render={<Link href="/" />}>Volver al inicio</Button>
    </main>
  )
}
