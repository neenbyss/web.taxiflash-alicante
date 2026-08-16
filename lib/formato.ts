// Formateadores y etiquetas compartidas por toda la UI.

export function formatearMoneda(valor: number | null | undefined): string {
  if (valor == null) return "—"
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(valor)
}

export function formatearFecha(fecha: Date | string | null | undefined): string {
  if (!fecha) return "—"
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(fecha))
}

export function formatearKm(km: number | null | undefined): string {
  if (km == null) return "—"
  return `${km.toFixed(1)} km`
}

export const ESTADO_RESERVA_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACEPTADA: "Aceptada",
  EN_CURSO: "En curso",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
  RECHAZADA: "Rechazada",
}

export const ESTADO_ALQUILER_LABEL: Record<string, string> = {
  A_CONFIRMAR: "A confirmar",
  CONFIRMADO: "Confirmado",
  RECHAZADO: "Rechazado",
  CANCELADO: "Cancelado",
  FINALIZADO: "Finalizado",
}

export const ROL_LABEL: Record<string, string> = {
  CLIENTE: "Cliente",
  CHOFER: "Chofer",
  ADMIN: "Administrador",
}
