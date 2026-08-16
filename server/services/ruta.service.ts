// Geometría de la ruta (OSRM/OpenStreetMap) para dibujarla en el mapa.
// Devuelve la polilínea real por calles; si OSRM no responde, el cliente
// dibuja una línea recta entre puntos como fallback.

import type { Punto } from "@/server/services/tarifa.service"

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving"

export type RutaGeometria = {
  coordinates: { lat: number; lng: number }[]
  distanciaKm: number | null
  duracionMin: number | null
}

export async function obtenerRutaGeometria(
  puntos: Punto[]
): Promise<RutaGeometria> {
  if (puntos.length < 2) return { coordinates: [], distanciaKm: null, duracionMin: null }
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
    return {
      coordinates: ruta.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
      distanciaKm: Math.round((ruta.distance / 1000) * 100) / 100,
      duracionMin: Math.round(ruta.duration / 60),
    }
  } catch {
    return { coordinates: [], distanciaKm: null, duracionMin: null }
  }
}
