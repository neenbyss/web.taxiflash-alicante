import { RecuperarPasswordForm } from "@/components/forms/recuperar-password-form"
import { AuthCard } from "@/components/layout/auth-card"

export const metadata = { title: "Recuperar contraseña" }

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      titulo="Recupera tu acceso"
      descripcion="Te enviaremos un código temporal para crear una contraseña nueva."
    >
      <RecuperarPasswordForm />
    </AuthCard>
  )
}
