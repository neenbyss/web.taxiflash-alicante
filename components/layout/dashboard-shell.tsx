"use client"

import {
  RiArrowDownSLine,
  RiArrowLeftRightLine,
  RiLogoutBoxRLine,
  RiMenuLine,
  RiNotification3Line,
  RiShieldUserLine,
  RiSideBarLine,
  RiUser3Line,
} from "@/components/icons"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { Logo } from "@/components/shared/logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { ROL_LABEL } from "@/lib/formato"
import type { Role } from "@/lib/generated/prisma/enums"
import { PORTALS, accessiblePortals, type PortalId } from "@/lib/navegacion"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

type DashboardShellProps = {
  portalId: PortalId
  role: Role
  user: { name: string; email: string }
  children: React.ReactNode
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("")
}

function DashboardNavigationControls({
  items,
  hrefFor,
  active,
}: {
  items: typeof PORTALS.admin.nav
  hrefFor: (href: string) => string
  active: (href: string) => boolean
}) {
  const { toggleSidebar } = useSidebar()
  const mobileItems = items
    .filter((item) => !item.href.endsWith("/notifications") && !item.href.endsWith("/profile"))
    .slice(0, 4)
  const itemCount = mobileItems.length

  return (
    <>
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Alternar navegación lateral"
        className="fixed top-8 left-[calc(var(--sidebar-width)-0.55rem)] z-30 hidden size-10 place-items-center rounded-md bg-card text-foreground shadow-lg shadow-black/10 transition-[left,top,opacity,transform,background-color] duration-300 hover:scale-105 hover:bg-primary focus-visible:bg-primary focus-visible:opacity-100 focus-visible:outline-none md:grid peer-data-[state=collapsed]:top-7 peer-data-[state=collapsed]:left-2.5"
      >
        <RiSideBarLine className="size-5" aria-hidden />
      </button>

      <nav
        aria-label="Navegación móvil del panel"
        className={cn(
          "fixed bottom-1.5 z-40 grid max-w-[calc(100%-0.375rem)] w-full left-1/2 -translate-x-1/2 overflow-hidden rounded-3xl bg-secondary/95 p-2 text-secondary-foreground shadow-2xl shadow-black/25 backdrop-blur-xl md:hidden",
          itemCount === 4 ? "grid-cols-4" : "grid-cols-3"
        )}
      >
        {mobileItems.map((item) => (
          <Link
            key={item.href}
            href={hrefFor(item.href)}
            aria-current={active(item.href) ? "page" : undefined}
            className="flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] text-secondary-foreground/55 transition-colors active:scale-95 aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
          >
            <item.icon className="size-5" aria-hidden />
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}

function MobileSidebarButton() {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="flex text-xs min-h-8 items-center gap-2 rounded-xl bg-secondary px-2 font-medium text-secondary-foreground shadow-sm active:scale-95 md:hidden"
      aria-label="Abrir menú del panel"
    >
      <RiMenuLine className="size-3" aria-hidden />
      Más
    </button>
  )
}

export function DashboardShell({ portalId, role, user, children }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const portal = PORTALS[portalId]
  const availablePortals = accessiblePortals(role)
  const profileHref = portal.nav.find((item) => item.href.endsWith("/profile"))?.href
  const notificationsHref = portal.nav.find((item) => item.href.endsWith("/notifications"))?.href
  const unreadNotifications = trpc.notificaciones.contarNoLeidas.useQuery(undefined, {
    refetchInterval: 20_000,
  })
  const unreadCount = unreadNotifications.data ?? 0
  const hrefFor = (href: string) => href
  const normalizedPath = pathname
  const active = (href: string) => normalizedPath === href || (href !== portal.home && normalizedPath.startsWith(`${href}/`))

  async function signOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <SidebarProvider className="min-h-dvh min-w-0 overflow-x-hidden bg-secondary p-0 sm:p-2 md:p-3">
      <Sidebar collapsible="icon" className="group-data-[collapsible='icon']:pl-1 border-0 bg-secondary text-secondary-foreground group-data-[state=expanded]:w-[calc(var(--sidebar-width)+1px)] border-none!">
        <SidebarHeader className="px-3 py-5">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href={hrefFor(portal.home)} />}>
                <Logo href={null} size="lg" subtitle={portal.title} stack />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <Collapsible className="group/account mt-2 md:hidden">
            <CollapsibleTrigger className="flex min-h-16 w-full items-center gap-3 rounded-2xl bg-white/6 p-3 text-left outline-none transition-colors active:bg-white/10 focus-visible:bg-white/10">
              <Avatar className="size-11 rounded-xl">
                <AvatarFallback className="rounded-xl bg-primary font-semibold text-primary-foreground">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-sm font-medium">{user.name}</span>
                <span className="mt-1 block truncate text-xs text-sidebar-foreground/55">
                  {ROL_LABEL[role] ?? role} · {portal.title}
                </span>
              </span>
              <RiArrowDownSLine className="size-4 shrink-0 text-sidebar-foreground/55 transition-transform group-data-open/account:rotate-180" aria-hidden />
            </CollapsibleTrigger>
            <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 data-closed:h-0">
              <div className="space-y-3 px-2 pt-3">
                <div className="rounded-xl bg-white/4 px-3 py-2.5">
                  <p className="text-[11px] text-sidebar-foreground/45">Correo de acceso</p>
                  <p className="mt-1 truncate text-sm text-sidebar-foreground/80">{user.email}</p>
                </div>
                <SidebarMenu className="gap-1">
                  {profileHref && (
                    <SidebarMenuItem>
                      <SidebarMenuButton render={<Link href={hrefFor(profileHref)} />}>
                        <RiUser3Line aria-hidden />
                        <span>Ver y editar perfil</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {availablePortals.length > 1 && availablePortals.map((destination) => (
                    <SidebarMenuItem key={destination.id}>
                      <SidebarMenuButton
                        disabled={destination.id === portalId}
                        onClick={() => router.push(hrefFor(destination.home))}
                      >
                        {destination.id === "admin" ? <RiShieldUserLine aria-hidden /> : <RiArrowLeftRightLine aria-hidden />}
                        <span>{destination.id === portalId ? `${destination.title} · Panel actual` : `Cambiar a ${destination.title}`}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={signOut} className="text-red-300 hover:text-red-200">
                      <RiLogoutBoxRLine aria-hidden />
                      <span>Cerrar sesión</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/55">Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {portal.nav.map((item) => (
                  <SidebarMenuItem
                    key={item.href}
                    className={cn(
                      (item.href.endsWith("/notifications") || item.href.endsWith("/profile")) && "max-md:hidden"
                    )}
                  >
                    <SidebarMenuButton
                      isActive={active(item.href)}
                      tooltip={item.label}
                      render={<Link href={hrefFor(item.href)} />}
                      className="group/menubtn h-12 transition-all data-active:ps-4! hover:ps-6 text-sidebar-foreground/75 data-active:bg-primary/20 data-active:text-primary hover:text-primary"
                    >
                      <div className="group-data-[collapsible='icon']:hidden! group-data-active/menubtn:block hidden h-4 w-1 bg-primary absolute left-0 rounded-full" />
                      <item.icon aria-hidden />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <DashboardNavigationControls items={portal.nav} hrefFor={hrefFor} active={active} />

      <SidebarInset className="min-h-[calc(100dvh-1rem)] overflow-hidden bg-background shadow-2xl shadow-black/15 sm:rounded-3xl md:min-h-[calc(100dvh-1.5rem)]">
        <header className="sticky top-0 z-20 flex h-15 sm:h-18 items-center gap-3 bg-background/90 px-1.5 sm:px-4 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-xl md:px-6 md:ps-10!">
          <MobileSidebarButton />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-xs font-medium uppercase tracking-widest text-muted-foreground">Panel</p>
            <p className="truncate font-heading text-lg leading-tight">{portal.title}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {notificationsHref && (
              <Link
                href={hrefFor(notificationsHref)}
                aria-label={unreadCount > 0 ? `Ver notificaciones, ${unreadCount} sin leer` : "Ver notificaciones"}
                aria-current={active(notificationsHref) ? "page" : undefined}
                className="relative flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground max-sm:size-10 max-sm:justify-center max-sm:px-0"
              >
                <RiNotification3Line className="size-5" aria-hidden />
                <span className="hidden sm:inline">Notificaciones</span>
                {unreadCount > 0 && (
                  <span
                    aria-hidden
                    className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground sm:static sm:h-5"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden items-center gap-2 rounded-2xl bg-card p-1.5 pr-2 text-left shadow-sm transition hover:bg-accent md:flex">
                <Avatar className="size-9 rounded-xl">
                  <AvatarFallback className="rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-36 flex-col leading-tight md:flex">
                  <span className="truncate text-sm font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{ROL_LABEL[role] ?? role}</span>
                </span>
                <RiArrowDownSLine className="size-4 text-muted-foreground" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2 py-2">
                    <p className="truncate font-medium">{user.name}</p>
                    <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  {profileHref && (
                    <DropdownMenuItem onClick={() => router.push(hrefFor(profileHref))}>
                      <RiUser3Line aria-hidden /> Mi perfil
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Cambiar de panel</DropdownMenuLabel>
                  {availablePortals.map((destination) => (
                    <DropdownMenuItem
                      key={destination.id}
                      disabled={destination.id === portalId}
                      onClick={() => router.push(hrefFor(destination.home))}
                    >
                      {destination.id === "admin" ? <RiShieldUserLine aria-hidden /> : <RiArrowLeftRightLine aria-hidden />}
                      {destination.title}
                      {destination.id === portalId && <span className="ml-auto text-xs">Actual</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <RiLogoutBoxRLine aria-hidden /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main id="contenido" className="flex-1 overflow-y-auto p-1.5 pb-28 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
