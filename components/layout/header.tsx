"use client"

import { RiArrowRightUpLine, RiCloseLine, RiMailLine, RiMenu3Line, RiPhoneLine } from "@/components/icons"
import { AnimatePresence, m, useReducedMotion } from "motion/react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const NAV = [
  { href: "/", label: "Inicio", index: "01" },
  { href: "/services", label: "Servicios", index: "02" },
  { href: "/ubicaciones", label: "Ubicaciones", index: "03" },
]

export function Header() {
  const path = usePathname()
  const isMobile = useIsMobile()
  const reduceMotion = useReducedMotion()
  const animateMenu = !isMobile && !reduceMotion
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const updateHeader = () => {
      const value = window.scrollY
      setScrolled((current) => (current ? value > 20 : value > 76))
    }

    updateHeader()
    window.addEventListener("scroll", updateHeader, { passive: true })
    return () => window.removeEventListener("scroll", updateHeader)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const root = document.documentElement
    const previousRootOverflow = root.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    const previousBodyPadding = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - root.clientWidth

    root.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`

    const closeOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && setMenuOpen(false)
    window.addEventListener("keydown", closeOnEscape)

    return () => {
      root.style.overflow = previousRootOverflow
      document.body.style.overflow = previousBodyOverflow
      document.body.style.paddingRight = previousBodyPadding
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [menuOpen])

  return (
    <>
      <header
        className={cn(
          "absolute inset-x-0 top-0 z-50 text-white transition-[opacity,transform] duration-300 ease-out will-change-[transform,opacity] motion-reduce:transition-none",
          scrolled && "-translate-y-4 opacity-0",
        )}
        aria-hidden={scrolled}
        inert={scrolled ? true : undefined}
      >
        <div className="flex h-20 w-full items-center px-4 pr-20 sm:h-27 sm:px-8 md:pr-48">
          <Logo
            href="/"
            size="xl"
            className="relative z-10 text-white [&_.text-muted-foreground]:text-white/55 [&>.font-heading]:hidden sm:[&>.font-heading]:flex"
          />

          <nav aria-label="Navegación principal" className="ml-auto hidden pr-8 md:block">
            <ul className="flex items-center gap-2 text-xs sm:gap-7 sm:text-sm lg:gap-10">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={item.href === path ? "page" : undefined}
                    className="group/link relative py-3 text-lg text-white/50 uppercase transition hover:text-white hover:after:scale-x-100 aria-[current=page]:text-primary font-medium"
                  >
                    {item.label}

                    <div className="absolute -bottom-1 left-1/2 h-1.5 w-3 -translate-x-1/2 rounded group-aria-[current=page]/link:bg-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <div
        className={cn(
          "fixed top-6 z-50 hidden transition-[right] duration-500 ease-out md:block",
          scrolled ? "right-22" : "right-6",
        )}
      >
        <Button
          className="h-11 rounded-lg px-2.5 text-base shadow-lg sm:h-14 sm:px-5 sm:text-lg"
          render={<Link href="/login" />}
        >
          Reserva ahora
        </Button>
      </div>

      <Button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
        className={cn(
          "fixed top-4 right-4 z-50 grid size-13 place-items-center rounded-lg bg-secondary p-0 text-secondary-foreground shadow-lg transition-[color,background-color,opacity,transform] duration-300 hover:bg-primary hover:text-primary-foreground sm:top-6 sm:right-6",
          scrolled
            ? "md:translate-x-0 md:opacity-100"
            : "md:pointer-events-none md:translate-x-4 md:opacity-0",
        )}
      >
        <RiMenu3Line className="size-5" aria-hidden />
      </Button>

      <AnimatePresence>
        {menuOpen && (
          <m.div
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) setMenuOpen(false)
            }}
            initial={animateMenu ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={animateMenu ? { opacity: 0 } : undefined}
            transition={{ duration: animateMenu ? 0.3 : 0 }}
            className="fixed inset-0 z-60 overflow-y-auto overscroll-contain bg-secondary text-secondary-foreground"
          >
            <m.div
              initial={
                animateMenu
                  ? { clipPath: "circle(0% at calc(100% - 40px) 38px)" }
                  : false
              }
              animate={{ clipPath: "circle(150% at calc(100% - 40px) 38px)" }}
              exit={
                animateMenu
                  ? { clipPath: "circle(0% at calc(100% - 40px) 38px)" }
                  : undefined
              }
              transition={{
                duration: animateMenu ? 0.7 : 0,
                ease: [0.76, 0, 0.24, 1],
              }}
              className="flex min-h-dvh flex-col bg-secondary"
            >
              <div className="flex h-20 w-full items-center justify-between px-5 sm:h-24 sm:px-8 lg:px-12">
                <Logo href="/" size="lg" className="text-white" />
                <button
                  type="button"
                  autoFocus
                  onClick={() => setMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="grid size-12 place-items-center rounded-full bg-white/10 transition duration-300 hover:rotate-90 hover:bg-primary hover:text-primary-foreground"
                >
                  <RiCloseLine className="size-6" aria-hidden />
                </button>
              </div>

              <div className="grid w-full flex-1 items-center gap-10 px-5 py-6 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.46fr)] lg:px-12">
                <nav aria-label="Menú de pantalla completa">
                  <ul className="flex flex-col gap-1">
                    {NAV.map((item, index) => (
                      <m.li
                        key={item.href}
                        initial={animateMenu ? { opacity: 0, y: 32 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: animateMenu ? 0.16 + index * 0.06 : 0,
                          duration: animateMenu ? 0.45 : 0,
                        }}
                      >
                        <Link
                          href={item.href}
                          aria-current={item.href === path ? "page" : undefined}
                          className="group flex items-center gap-4 rounded-3xl px-3 py-4 hover:text-primary sm:py-5"
                        >
                          <span className="self-start pt-2 font-mono text-sm text-white/35 sm:pt-4">
                            {item.index}
                          </span>
                          <span className="font-heading group-hover:ps-6 transition-all text-[clamp(2.25rem,8vw,4.5rem)] leading-none tracking-tight text-white/75 group-aria-[current=page]:text-primary!">
                            {item.label}
                          </span>
                          <RiArrowRightUpLine className="ml-auto size-7 -translate-x-3 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 sm:size-10" />
                        </Link>
                      </m.li>
                    ))}
                  </ul>
                </nav>

                <m.aside
                  initial={animateMenu ? { opacity: 0, y: 24 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: animateMenu ? 0.28 : 0, duration: animateMenu ? 0.5 : 0 }}
                  className="relative min-h-72 overflow-hidden rounded-[2rem] sm:min-h-96 lg:min-h-128"
                >
                  <Image
                    src="/images/service-taxi.png"
                    alt="Taxis preparados para recoger pasajeros"
                    fill
                    sizes="(max-width: 1024px) 100vw, 38vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-secondary via-secondary/55 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 space-y-5 p-6 sm:p-8">
                    <p className="max-w-sm font-heading text-2xl leading-tight text-white sm:text-3xl">
                      ¿Necesitas un taxi ahora?
                    </p>

                    <div className="flex flex-col gap-3 text-sm text-white/70">
                      <a href="tel:+34631288429" className="group flex items-center gap-3 transition hover:text-primary">
                        <RiPhoneLine className="size-5" aria-hidden />
                        <span>+34 631 28 84 29</span>
                      </a>
                      <a href="mailto:support@taxiflash.com" className="group flex items-center gap-3 break-all transition hover:text-primary">
                        <RiMailLine className="size-5 shrink-0" aria-hidden />
                        <span>support@taxiflash.com</span>
                      </a>
                    </div>

                    <Link href="/login" className="group inline-flex items-center gap-3 font-heading text-xl text-primary transition hover:text-white sm:text-2xl">
                      Reserva ahora
                      <RiArrowRightUpLine className="size-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden />
                    </Link>
                  </div>
                </m.aside>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
