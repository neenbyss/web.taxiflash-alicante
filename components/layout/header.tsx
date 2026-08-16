"use client";
import Link from "next/link"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/services", label: "Servicios" },
  { href: "/ubicaciones", label: "Ubicaciones" },
  { href: "/noticias", label: "Noticias" },
  { href: "/contacto", label: "Contacto" },
]

/** Cabecera del sitio público (landing). */
export function Header() {

  const path = usePathname();
  
  return (
    <header className="absolute top-0 z-40 flex h-31 w-full items-center px-8">
      <div className="flex w-full items-center gap-4 py-3">
        <Logo href="/" size="lg" className="text-white" />

        <div className="ml-auto flex items-center gap-12">
          <nav
            aria-label="Navegación principal"
            className="ml-6 hidden items-center gap-8 md:flex"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-ishref={item.href === path}
                className="text-lg font-medium text-white/70 hover:text-white transition duration-500 ease-in-out data-[ishref=true]:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Button className="h-14 px-6 text-lg font-medium" render={<Link href="/login" />}>Reserva Ahora</Button>
        </div>
      </div>
    </header>
  )
}
