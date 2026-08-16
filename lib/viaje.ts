// Lógica compartida del ciclo de vida de un viaje (cliente y servidor).
// La fase de recogida (entre ACEPTADA y EN_CURSO) se deriva de los timestamps.

/** Minutos de espera tras la llegada del chofer antes de auto-cancelar. */
export const ESPERA_MINUTOS = 10

export type FaseRecogida =
  | "preparando"
  | "en_camino"
  | "llego"
  | "cliente_sale"

type RecogidaTimestamps = {
  choferEnCaminoEn: Date | string | null
  choferLlegoEn: Date | string | null
  clienteSaleEn: Date | string | null
}

export function faseRecogida(r: RecogidaTimestamps): FaseRecogida {
  if (r.clienteSaleEn) return "cliente_sale"
  if (r.choferLlegoEn) return "llego"
  if (r.choferEnCaminoEn) return "en_camino"
  return "preparando"
}

export const FASE_RECOGIDA_LABEL: Record<FaseRecogida, string> = {
  preparando: "Chofer asignado, preparando la salida",
  en_camino: "El chofer va en camino al punto de recogida",
  llego: "El chofer llegó y te está esperando",
  cliente_sale: "Confirmaste tu salida, el chofer te espera",
}

/**
 * Pasos de la línea de tiempo del viaje para la UI. Devuelve, para el estado
 * actual, qué pasos están completados/activos.
 */
export const PASOS_VIAJE = [
  { clave: "PENDIENTE", label: "Solicitada" },
  { clave: "ACEPTADA", label: "Aceptada" },
  { clave: "EN_CURSO", label: "En curso" },
  { clave: "FINALIZADA", label: "Finalizada" },
] as const

const ORDEN_ESTADO: Record<string, number> = {
  PENDIENTE: 0,
  ACEPTADA: 1,
  EN_CURSO: 2,
  FINALIZADA: 3,
}

export function indiceEstado(estado: string): number {
  return ORDEN_ESTADO[estado] ?? -1
}
