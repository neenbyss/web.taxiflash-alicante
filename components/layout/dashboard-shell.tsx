"use client"

import {
  RiArrowLeftRightLine,
  RiExpandUpDownLine,
  RiLogoutBoxRLine,
  RiUser3Line,
} from "@remixicon/react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Fragment } from "react"

import { NotificationBell } from "@/components/layout/notification-bell"
import { Logo } from "@/components/shared/logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"
import { ROL_LABEL } from "@/lib/formato"
import type { Role } from "@/lib/generated/prisma/enums"
import {
  PORTALES,
  migasDeRuta,
  portalesAccesibles,
  type PortalId,
} from "@/lib/navegacion"

type DashboardShellProps = {
  portalId: PortalId
  rol: Role
  usuario: { name: string; email: string }
  children: React.ReactNode
}

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

/**
 * Shell del dashboard: sidebar flotante (shadcn) con tarjeta de usuario al pie
 * y header estático con breadcrumb funcional. Sin animaciones añadidas.
 */
export function DashboardShell({
  portalId,
  rol,
  usuario,
  children,
}: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const portal = PORTALES[portalId]
  const otrosPortales = portalesAccesibles(rol).filter((p) => p.id !== portalId)
  const migas = migasDeRuta(portalId, pathname)

  const esActivo = (href: string) =>
    pathname === href ||
    (href.split("/").length > 2 && pathname.startsWith(`${href}/`))

  const cerrarSesion = async () => {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <SidebarProvider>
      <Sidebar
        variant="inset"
        collapsible="icon"
        className="border-none **:data-[slot=sidebar-inner]:rounded-3xl **:data-[slot=sidebar-inner]:shadow-none **:data-[slot=sidebar-inner]:ring-0"
      >
        <SidebarHeader className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href={portal.home} />}>
                <Logo href={null} size="lg" subtitle={portal.titulo} stack />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menú</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {portal.nav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={esActivo(item.href)}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                      className="relative group"
                    >
                      <div className="w-1 h-6 bg-primary group-data-active:opacity-100 opacity-0 absolute left-0 rounded-sm group-data-[collapsible=icon]:hidden" />
                      <item.icono aria-hidden />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {otrosPortales.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Cambiar de portal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {otrosPortales.map((destino) => (
                    <SidebarMenuItem key={destino.id}>
                      <SidebarMenuButton
                        tooltip={destino.titulo}
                        render={<Link href={destino.home} />}
                      >
                        <RiArrowLeftRightLine aria-hidden />
                        <span>{destino.titulo}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* Tarjeta de usuario al pie, con menú de cuenta */}
        <SidebarFooter className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<SidebarMenuButton size="lg" tooltip={usuario.name} />}
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/15 text-xs font-medium text-primary">
                      {iniciales(usuario.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex flex-col leading-tight">
                    <span className="truncate font-medium">{usuario.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {ROL_LABEL[rol] ?? rol}
                    </span>
                  </span>
                  <RiExpandUpDownLine className="ml-auto size-4" aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="min-w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <p className="truncate font-medium">{usuario.name}</p>
                      <p className="truncate text-xs font-normal text-muted-foreground">
                        {usuario.email}
                      </p>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => router.push(`/${portalId}/perfil`)}
                    >
                      <RiUser3Line aria-hidden />
                      Mi cuenta
                    </DropdownMenuItem>
                    {otrosPortales.map((destino) => (
                      <DropdownMenuItem
                        key={destino.id}
                        onClick={() => router.push(destino.home)}
                      >
                        <RiArrowLeftRightLine aria-hidden />
                        {destino.titulo}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={cerrarSesion}>
                    <RiLogoutBoxRLine aria-hidden />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="rounded-4xl overflow-hidden">
        <header className=" z-10 flex h-16 shrink-0 items-center gap-2 bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger aria-label="Alternar menú lateral" />
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {migas.map((miga, i) => {
                const ultima = i === migas.length - 1
                return (
                  <Fragment key={miga.href}>
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {ultima ? (
                        <BreadcrumbPage>{miga.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink render={<Link href={miga.href} />}>
                          {miga.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {ROL_LABEL[rol] ?? rol}
            </Badge>
            <NotificationBell />
          </div>
        </header>

        <main
          id="contenido"
          className="flex-1 px-4 pb-6 **:data-[slot=card]:rounded-3xl **:data-[slot=card]:shadow-none **:data-[slot=card]:ring-0 overflow-y-auto"
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
