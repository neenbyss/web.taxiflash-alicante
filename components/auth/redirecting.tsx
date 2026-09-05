"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { RiLoaderLine } from "@/components/icons"
import { Logo } from "@/components/shared/logo"

export function Redirecting({ destination }: { destination: string }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(destination)
  }, [destination, router])

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-background px-6 text-center">
      <meta httpEquiv="refresh" content={`3;url=${destination}`} />
      <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
      <div className="flex max-w-sm flex-col items-center">
        <Logo href="/" size="lg" />
        <RiLoaderLine
          className="mt-10 size-7 animate-spin text-primary motion-reduce:animate-none"
          aria-hidden
        />
        <h1 className="mt-5 font-heading text-2xl font-medium">Redirigiendo</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Estamos comprobando tu acceso y abriendo el panel correcto.
        </p>
        <Link
          href={destination}
          className="mt-8 text-sm font-medium underline underline-offset-4"
        >
          Continuar ahora
        </Link>
      </div>
    </main>
  )
}
