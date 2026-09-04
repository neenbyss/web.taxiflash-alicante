// Geocodificación con Nominatim (OpenStreetMap). Servicio público con límite
// de uso ~1 req/s: suficiente para el prototipo; en producción convendría un
// proveedor con SLA (o Google Places si hay API key).

export type ResultadoGeocoding = {
  direccion: string
  lat: number
  lng: number
}

const NOMINATIM = "https://nominatim.openstreetmap.org"

export async function buscarDireccion(
  consulta: string,
  signal?: AbortSignal
): Promise<ResultadoGeocoding[]> {
  const url = `${NOMINATIM}/search?format=jsonv2&limit=5&countrycodes=es&q=${encodeURIComponent(consulta)}`
  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  })
  if (!res.ok) return []
  const data = (await res.json()) as {
    display_name: string
    lat: string
    lon: string
  }[]
  return data.map((r) => ({
    direccion: r.display_name,
    lat: Number(r.lat),
    lng: Number(r.lon),
  }))
}

export async function direccionInversa(
  lat: number,
  lng: number
): Promise<string> {
  try {
    const url = `${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    const res = await fetch(url, { headers: { Accept: "application/json" } })
    if (!res.ok) throw new Error()
    const data = (await res.json()) as { display_name?: string }
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}
