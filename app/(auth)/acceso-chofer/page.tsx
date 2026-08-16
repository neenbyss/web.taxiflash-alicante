import Link from "next/link"
import { Suspense } from "react"

import { AuthCard } from "@/components/layout/auth-card"
import { LoginForm } from "@/components/forms/login-form"
import { isGoogleAuthEnabled } from "@/server/auth"

export const metadata = { title: "Acceso choferes" }

export default function AccesoChoferPage() {
  return (
    <AuthCard
      titulo="Portal de choferes"
      descripcion="Accede con la cuenta que te dio el equipo de TaxiFlash."
    >
      <Suspense>
        <LoginForm
          googleHabilitado={isGoogleAuthEnabled}
          mostrarGoogle={false}
          pie={
            <p className="text-center text-sm text-muted-foreground">
              ¿Eres cliente?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Entra por aquí
              </Link>
            </p>
          }
        />
      </Suspense>
    </AuthCard>
  )
}
