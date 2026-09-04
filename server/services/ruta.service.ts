// Geometría de la ruta (OSRM/OpenStreetMap) para dibujarla en el mapa.
// Devuelve la polilínea real por calles; si OSRM no responde, el cliente
// dibuja una línea recta entre puntos como fallback.

import type { Punto } from "@/server/services/tarifa.service"

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving"
const OSRM_TRIP_BASE = "https://router.project-osrm.org/trip/v1/driving"

export type RutaGeometria = {
  coordinates: { lat: number; lng: number }[]
  distanciaKm: number | null
  duracionMin: number | null
  /** Índices de los puntos de entrada en el orden óptimo del recorrido. */
  ordenPuntos: number[]
}

type OsrmRoute = {
  distance: number
  duration: number
  geometry: { coordinates: [number, number][] }
}

function normalizarRuta(ruta: OsrmRoute, ordenPuntos: number[]): RutaGeometria {
  return {
    coordinates: ruta.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
    distanciaKm: Math.round((ruta.distance / 1000) * 100) / 100,
    duracionMin: Math.round(ruta.duration / 60),
    ordenPuntos,
  }
}

export async function obtenerRutaGeometria(
  puntos: Punto[]
): Promise<RutaGeometria> {
  if (puntos.length < 2) return { coordinates: [], distanciaKm: null, duracionMin: null, ordenPuntos: puntos.map((_, i) => i) }
  const coords = puntos.map((p) => `${p.lng},${p.lat}`).join(";")
  try {
    const res = await fetch(
      `${OSRM_BASE}/${coords}?overview=full&geometries=geojson`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) throw new Error("osrm")
    const data = (await res.json()) as {
      code?: string
      routes?: {
        distance: number
        duration: number
        geometry: { coordinates: [number, number][] }
      }[]
    }
    if (data.code !== "Ok" || !data.routes?.length) throw new Error("sin ruta")
    const ruta = data.routes[0]
    return normalizarRuta(ruta, puntos.map((_, i) => i))
  } catch {
    return { coordinates: [], distanciaKm: null, duracionMin: null, ordenPuntos: puntos.map((_, i) => i) }
  }
}

/**
 * Optimiza únicamente las paradas intermedias. El origen y el destino siempre
 * permanecen fijos, y OSRM decide el orden de visita de menor coste por calle.
 */
export async function obtenerRutaOptimizada(puntos: Punto[]): Promise<RutaGeometria> {
  if (puntos.length <= 2) return obtenerRutaGeometria(puntos)
  const coords = puntos.map((p) => `${p.lng},${p.lat}`).join(";")
  try {
    const res = await fetch(
      `${OSRM_TRIP_BASE}/${coords}?source=first&destination=last&roundtrip=false&overview=full&geometries=geojson`,
      { signal: AbortSignal.timeout(6000) }
    )
    if (!res.ok) throw new Error("osrm")
    const data = (await res.json()) as {
      code?: string
      trips?: OsrmRoute[]
      waypoints?: { waypoint_index: number }[]
    }
    if (data.code !== "Ok" || !data.trips?.length || data.waypoints?.length !== puntos.length) {
      throw new Error("sin ruta optimizada")
    }
    const ordenPuntos = data.waypoints
      .map((waypoint, inputIndex) => ({ inputIndex, order: waypoint.waypoint_index }))
      .sort((a, b) => a.order - b.order)
      .map(({ inputIndex }) => inputIndex)
    return normalizarRuta(data.trips[0], ordenPuntos)
  } catch {
    return obtenerRutaGeometria(puntos)
  }
}
