// Estimación de tarifa en el servidor (autoritativa: el cliente nunca envía
// la tarifa, solo los puntos). La distancia se pide a OSRM (OpenStreetMap);
// si no responde, se usa haversine con factor de corrección urbana.

export type Punto = { lat: number; lng: number }

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving"
const FACTOR_HAVERSINE = 1.3

function haversineKm(a: Punto, b: Punto): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function distanciaHaversineRuta(puntos: Punto[]): number {
  let total = 0
  for (let i = 0; i < puntos.length - 1; i++) {
    total += haversineKm(puntos[i], puntos[i + 1])
  }
  return total * FACTOR_HAVERSINE
}

async function distanciaOsrmKm(puntos: Punto[]): Promise<number | null> {
  const coords = puntos.map((p) => `${p.lng},${p.lat}`).join(";")
  try {
    const res = await fetch(
      `${OSRM_BASE}/${coords}?overview=false&alternatives=false`,
      { signal: AbortSignal.timeout(4000) }
    )
    if (!res.ok) return null
    const data = (await res.json()) as {
      code?: string
      routes?: { distance: number }[]
    }
    if (data.code !== "Ok" || !data.routes?.length) return null
    return data.routes[0].distance / 1000
  } catch {
    return null
  }
}

/** Distancia de la ruta origen → paradas → destino, en km. */
export async function calcularDistanciaKm(puntos: Punto[]): Promise<{
  distanciaKm: number
  metodo: "osrm" | "haversine"
}> {
  if (puntos.length < 2) return { distanciaKm: 0, metodo: "haversine" }
  const osrm = await distanciaOsrmKm(puntos)
  if (osrm !== null) return { distanciaKm: osrm, metodo: "osrm" }
  return { distanciaKm: distanciaHaversineRuta(puntos), metodo: "haversine" }
}

function num(envVar: string | undefined, fallback: number): number {
  const n = Number(envVar)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

/** Tarifa ESTIMADA (el cobro real es por taxímetro). */
export function calcularTarifa(distanciaKm: number): number {
  const base = num(process.env.TARIFA_BASE, 2.5)
  const porKm = num(process.env.TARIFA_POR_KM, 1.2)
  const minima = num(process.env.TARIFA_MINIMA, 4)
  const tarifa = base + distanciaKm * porKm
  return Math.round(Math.max(tarifa, minima) * 100) / 100
}

export async function estimarTarifa(puntos: Punto[]) {
  const { distanciaKm, metodo } = await calcularDistanciaKm(puntos)
  return {
    distanciaKm: Math.round(distanciaKm * 100) / 100,
    tarifaEstimada: calcularTarifa(distanciaKm),
    metodo,
  }
}
