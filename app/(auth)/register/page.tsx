import { AuthCard } from "@/components/layout/auth-card"
import { RegistroForm } from "@/components/forms/registro-form"
import { isGoogleAuthEnabled } from "@/server/auth"

export const metadata = { title: "Crear cuenta" }

export default function RegisterPage() {
  return (
    <AuthCard
      titulo="Crea tu cuenta"
      descripcion="Regístrate para reservar y seguir tus viajes."
    >
      <RegistroForm googleHabilitado={isGoogleAuthEnabled} />
    </AuthCard>
  )
}
