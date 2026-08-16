"use client"

import { RiGoogleFill } from "@remixicon/react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

/**
 * Inicio de sesión con Google en un click (better-auth). Si el email coincide
 * con una cuenta de credenciales existente, better-auth las vincula.
 */
export function GoogleButton({ texto }: { texto: string }) {
  const [cargando, setCargando] = useState(false)

  const entrar = async () => {
    setCargando(true)
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/redirigir",
    })
    if (error) {
      toast.error(error.message ?? "No se pudo iniciar sesión con Google.")
      setCargando(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      onClick={entrar}
      disabled={cargando}
    >
      <RiGoogleFill data-icon="inline-start" />
      {cargando ? "Conectando…" : texto}
    </Button>
  )
}
