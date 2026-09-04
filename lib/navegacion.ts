import {
  RiAlarmWarningLine,
  RiCarLine,
  RiDashboardLine,
  RiHistoryLine,
  RiNotification3Line,
  RiRoadMapLine,
  RiShieldUserLine,
  RiStarLine,
  RiTaxiLine,
  RiTeamLine,
  RiUser3Line,
  type RemixiconComponentType,
} from "@/components/icons"

import type { Role } from "@/lib/generated/prisma/enums"

export type NavItem = { href: string; label: string; icon: RemixiconComponentType }
export type PortalId = "customer" | "driver" | "admin"
export type PortalConfig = {
  id: PortalId
  role: Role
  title: string
  home: string
  nav: NavItem[]
}

export const PORTALS: Record<PortalId, PortalConfig> = {
  customer: {
    id: "customer",
    role: "CLIENTE",
    title: "Clientes",
    home: "/customer",
    nav: [
      { href: "/customer", label: "Inicio", icon: RiDashboardLine },
      { href: "/customer/book", label: "Reservar", icon: RiTaxiLine },
      { href: "/customer/bookings", label: "Mis reservas", icon: RiRoadMapLine },
      { href: "/customer/rentals", label: "Alquileres", icon: RiCarLine },
      { href: "/customer/notifications", label: "Notificaciones", icon: RiNotification3Line },
      { href: "/customer/profile", label: "Perfil", icon: RiUser3Line },
    ],
  },
  driver: {
    id: "driver",
    role: "CHOFER",
    title: "Choferes",
    home: "/driver",
    nav: [
      { href: "/driver", label: "Tablero", icon: RiDashboardLine },
      { href: "/driver/history", label: "Historial", icon: RiHistoryLine },
      { href: "/driver/reviews", label: "Mis reseñas", icon: RiStarLine },
      { href: "/driver/notifications", label: "Notificaciones", icon: RiNotification3Line },
      { href: "/driver/profile", label: "Perfil", icon: RiUser3Line },
    ],
  },
  admin: {
    id: "admin",
    role: "ADMIN",
    title: "Administración",
    home: "/admin",
    nav: [
      { href: "/admin", label: "Resumen", icon: RiDashboardLine },
      { href: "/admin/bookings", label: "Reservas", icon: RiRoadMapLine },
      { href: "/admin/rentals", label: "Alquileres", icon: RiCarLine },
      { href: "/admin/users", label: "Usuarios", icon: RiTeamLine },
      { href: "/admin/permissions", label: "Permisos", icon: RiShieldUserLine },
      { href: "/admin/reviews", label: "Reseñas", icon: RiStarLine },
      { href: "/admin/reports", label: "Reportes", icon: RiAlarmWarningLine },
      { href: "/admin/notifications", label: "Notificaciones", icon: RiNotification3Line },
    ],
  },
}

export function accessiblePortals(role: Role): PortalConfig[] {
  if (role === "ADMIN") return Object.values(PORTALS)
  return [role === "CHOFER" ? PORTALS.driver : PORTALS.customer]
}

const EXTRA_LABELS: Record<string, string> = {
  trips: "Viaje",
  new: "Nueva solicitud",
  notifications: "Notificaciones",
}

export function breadcrumbsFor(portalId: PortalId, pathname: string) {
  const portal = PORTALS[portalId]
  const byHref = new Map(portal.nav.map((item) => [item.href, item.label]))
  const crumbs: { href: string; label: string }[] = []
  let href = ""
  for (const segment of pathname.split("/").filter(Boolean)) {
    href += `/${segment}`
    const label = byHref.get(href) ?? EXTRA_LABELS[segment] ??
      (/^[a-z0-9]{20,}$/i.test(segment) ? "Detalle" : segment[0].toUpperCase() + segment.slice(1))
    crumbs.push({ href, label })
  }
  if (crumbs.length) crumbs[0] = { href: portal.home, label: portal.title }
  return crumbs
}
