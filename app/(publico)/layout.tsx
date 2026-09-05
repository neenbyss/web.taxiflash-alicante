import type { Metadata } from "next"
import Link from "next/link"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { homeDeRol } from "@/lib/roles"
import { getServerSession } from "@/server/session"

const NAV_PUBLICA = [{ href: "/reserva", label: "Consultar reserva" }]

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

// Layout de las páginas públicas (sin cuenta): cabecera ligera con acceso
// a los flujos y al login; si hay sesión, acceso directo al portal.
export default async function PublicoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <Logo href="/" />
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_PUBLICA.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-4xl px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto">
            {session ? (
              <Button
                variant="outline"
                size="sm"
                render={<Link href={homeDeRol(session.user.role)} />}
              >
                Ir a mi portal
              </Button>
            ) : (
              <Button size="sm" render={<Link href="/login" />}>
                Iniciar sesión
              </Button>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
