import { Suspense } from "react"

import { AuthCard } from "@/components/layout/auth-card"
import { RegistroForm } from "@/components/forms/registro-form"
import { isGoogleAuthEnabled } from "@/server/auth"

export const metadata = { title: "Crear cuenta" }

export default function RegisterPage() {
  return (
    <AuthCard
      titulo="Empieza con tu correo"
      descripcion="Primero comprobamos que te pertenece. Después podrás completar tu perfil."
    >
      <Suspense>
        <RegistroForm googleHabilitado={isGoogleAuthEnabled} />
      </Suspense>
    </AuthCard>
  )
}
