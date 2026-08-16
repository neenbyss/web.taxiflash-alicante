// Configuración de navegación de los portales, en un solo lugar.
// La consumen el sidebar del dashboard y el breadcrumb; así los layouts no
// duplican listas de enlaces.

import {
  RiAlarmWarningLine,
  RiCarLine,
  RiDashboardLine,
  RiHistoryLine,
  RiMapPin2Line,
  RiRoadMapLine,
  RiShieldUserLine,
  RiStarLine,
  RiTaxiLine,
  RiTeamLine,
  RiUser3Line,
  type RemixiconComponentType,
} from "@remixicon/react"

import type { Role } from "@/lib/generated/prisma/enums"

export type NavItem = {
  href: string
  label: string
  icono: RemixiconComponentType
}

export type PortalId = "cliente" | "chofer" | "admin"

type PortalConfig = {
  id: PortalId
  rol: Role
  titulo: string
  home: string
  nav: NavItem[]
}

export const PORTALES: Record<PortalId, PortalConfig> = {
  cliente: {
    id: "cliente",
    rol: "CLIENTE",
    titulo: "Clientes",
    home: "/cliente",
    nav: [
      { href: "/cliente", label: "Inicio", icono: RiDashboardLine },
      { href: "/cliente/reservar", label: "Reservar", icono: RiTaxiLine },
      { href: "/cliente/reservas", label: "Mis reservas", icono: RiRoadMapLine },
      { href: "/cliente/alquileres", label: "Alquileres", icono: RiCarLine },
      { href: "/cliente/perfil", label: "Perfil", icono: RiUser3Line },
    ],
  },
  chofer: {
    id: "chofer",
    rol: "CHOFER",
    titulo: "Choferes",
    home: "/chofer",
    nav: [
      { href: "/chofer", label: "Tablero", icono: RiDashboardLine },
      { href: "/chofer/historial", label: "Historial", icono: RiHistoryLine },
      { href: "/chofer/resenas", label: "Mis reseñas", icono: RiStarLine },
      { href: "/chofer/perfil", label: "Perfil", icono: RiUser3Line },
    ],
  },
  admin: {
    id: "admin",
    rol: "ADMIN",
    titulo: "Administración",
    home: "/admin",
    nav: [
      { href: "/admin", label: "Resumen", icono: RiDashboardLine },
      { href: "/admin/reservas", label: "Reservas", icono: RiRoadMapLine },
      { href: "/admin/alquileres", label: "Alquileres", icono: RiCarLine },
      { href: "/admin/usuarios", label: "Usuarios", icono: RiTeamLine },
      { href: "/admin/permisos", label: "Permisos", icono: RiShieldUserLine },
      { href: "/admin/resenas", label: "Reseñas", icono: RiStarLine },
      { href: "/admin/reportes", label: "Reportes", icono: RiAlarmWarningLine },
    ],
  },
}

/** Portales a los que un rol puede cambiar (el admin puede a todos). */
export function portalesAccesibles(rol: Role): PortalConfig[] {
  if (rol === "ADMIN") return [PORTALES.admin, PORTALES.chofer, PORTALES.cliente]
  return [PORTALES[rol.toLowerCase() as PortalId]]
}

// Etiquetas extra para segmentos que no están en el nav (breadcrumb).
const ETIQUETAS_EXTRA: Record<string, string> = {
  viajes: "Viaje",
  nueva: "Nueva solicitud",
}

/**
 * Migas de pan funcionales derivadas del pathname: cada segmento acumula su
 * href y resuelve la etiqueta desde el nav del portal (o extras). Los ids
 * dinámicos (cuid) se muestran como "Detalle".
 */
export function migasDeRuta(
  portalId: PortalId,
  pathname: string
): { href: string; label: string }[] {
  const portal = PORTALES[portalId]
  const porHref = new Map(portal.nav.map((item) => [item.href, item.label]))

  const segmentos = pathname.split("/").filter(Boolean)
  const migas: { href: string; label: string }[] = []
  let acumulado = ""
  for (const segmento of segmentos) {
    acumulado += `/${segmento}`
    const label =
      porHref.get(acumulado) ??
      ETIQUETAS_EXTRA[segmento] ??
      // cuid u otro id dinámico
      (/^[a-z0-9]{20,}$/i.test(segmento)
        ? "Detalle"
        : segmento.charAt(0).toUpperCase() + segmento.slice(1))
    migas.push({ href: acumulado, label })
  }
  // El primer segmento es el portal: usa su título.
  if (migas.length > 0) migas[0] = { href: portal.home, label: portal.titulo }
  return migas
}

/** Icono del portal para el logo del sidebar. */
export const ICONO_PORTAL: Record<PortalId, RemixiconComponentType> = {
  cliente: RiMapPin2Line,
  chofer: RiTaxiLine,
  admin: RiShieldUserLine,
}
