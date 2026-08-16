import { RiStarFill } from "@remixicon/react"
import Image from "next/image"
import { Suspense } from "react"

import { LoginForm } from "@/components/forms/login-form"
import { Logo } from "@/components/shared/logo"
import { isGoogleAuthEnabled } from "@/server/auth"

export const metadata = { title: "Iniciar sesión" }

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh p-2 lg:grid-cols-2">
      {/* Formulario */}
      <div className="flex flex-col justify-center px-6 py-10">
        <div className="mx-auto w-full max-w-md">
          <Logo href="/" size="lg" />

          <h1 className="mt-10 font-heading text-3xl leading-snug sm:text-4xl">
            Bienvenido de vuelta
          </h1>
          <p className="mt-2 text-muted-foreground">
            Inicia sesión para reservar y seguir tus viajes.
          </p>

          <div className="mt-8">
            <Suspense>
              <LoginForm googleHabilitado={isGoogleAuthEnabled} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Panel decorativo */}
      <div className="relative hidden overflow-hidden rounded-4xl lg:block">
        <Image
          alt=""
          src="/images/alicante.png"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-inner-background/95 via-inner-background/60 to-inner-background/30" />

        <div className="relative z-10 flex h-full flex-col justify-between p-8 text-inner-foreground">
          <div className="">
            <h2 className="font-heading text-6xl leading-snug">
              Tu taxi en Alicante, sin apps.
            </h2>
            <p className="mt-3 text-inner-foreground/80">
              Reserva por formulario, sigue cada viaje en tiempo real y paga por
              taxímetro. Todo desde la web.
            </p>
          </div>

          {/* Tarjeta flotante */}
          <div className="rounded-xl bg-card p-6 text-card-foreground shadow-2xl">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <RiStarFill key={i} className="size-4" aria-hidden />
              ))}
            </div>
            <p className="mt-2 text-lg">
              “Pido el taxi desde el móvil sin instalar nada y llega enseguida.
              Súper cómodo.”
            </p>
            <p className="mt-2 text-muted-foreground">
              María G. · Cliente de TaxiFlash
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
