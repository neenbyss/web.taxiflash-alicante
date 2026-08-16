import Link from "next/link"
import { Suspense } from "react"

import { AuthCard } from "@/components/layout/auth-card"
import { LoginForm } from "@/components/forms/login-form"
import { isGoogleAuthEnabled } from "@/server/auth"

export const metadata = { title: "Acceso administración" }

export default function AccesoAdminPage() {
  return (
    <AuthCard
      titulo="Administración"
      descripcion="Panel de gestión de TaxiFlash. Acceso solo para el equipo."
    >
      <Suspense>
        <LoginForm
          googleHabilitado={isGoogleAuthEnabled}
          mostrarGoogle={false}
          pie={
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/" className="underline underline-offset-4">
                Volver al inicio
              </Link>
            </p>
          }
        />
      </Suspense>
    </AuthCard>
  )
}
