import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { CompletarRegistroForm } from "@/components/forms/completar-registro-form"
import { AuthCard } from "@/components/layout/auth-card"
import { ONBOARDING_COOKIE, verifyOnboardingProof } from "@/lib/auth-onboarding"

export const metadata = { title: "Completar perfil" }

export default async function CompleteProfilePage() {
  const proof = verifyOnboardingProof(
    (await cookies()).get(ONBOARDING_COOKIE)?.value
  )
  if (!proof) redirect("/register?error=enlace-invalido")

  return (
    <AuthCard
      titulo="Ahora sí, cuéntanos sobre ti"
      descripcion="Tu correo ya está verificado. Estos datos se usarán para tus reservas."
    >
      <CompletarRegistroForm email={proof.email} />
    </AuthCard>
  )
}
