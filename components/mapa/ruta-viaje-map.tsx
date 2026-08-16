"use client"

// Mapa de un viaje: dibuja la ruta (origen → paradas → destino) trazada por
// calles (geometría OSRM vía tRPC; si falla, línea recta) y permite mostrar
// tu ubicación con el GPS del navegador. No hay seguimiento en vivo.

import { RiMapPin2Line } from "@remixicon/react"
import L from "leaflet"
import { useEffect, useState } from "react"
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet"
import { toast } from "sonner"

import "leaflet/dist/leaflet.css"

import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc"
import type { PuntoRuta } from "@/lib/validations/reserva"

function crearIcono(etiqueta: string, color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};color:#fff;border-radius:9999px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">${etiqueta}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}
const ICONO_ORIGEN = crearIcono("O", "#059669")
const ICONO_DESTINO = crearIcono("D", "#dc2626")
const ICONO_YO = crearIcono("📍", "#2563eb")

type LatLng = { lat: number; lng: number }

function AjustarVista({ puntos }: { puntos: LatLng[] }) {
  const map = useMap()
  useEffect(() => {
    if (puntos.length === 1) map.setView([puntos[0].lat, puntos[0].lng], 15)
    else if (puntos.length > 1) {
      map.fitBounds(L.latLngBounds(puntos.map((p) => [p.lat, p.lng])), {
        padding: [40, 40],
      })
    }
  }, [map, puntos])
  return null
}

type RutaViajeMapProps = {
  reservaId: string
  origen: PuntoRuta
  destino: PuntoRuta
  paradas: PuntoRuta[]
}

export default function RutaViajeMap({
  reservaId,
  origen,
  destino,
  paradas,
}: RutaViajeMapProps) {
  const [yo, setYo] = useState<LatLng | null>(null)
  const [buscandoGps, setBuscandoGps] = useState(false)

  const puntos: PuntoRuta[] = [origen, ...paradas, destino]
  const ruta = trpc.reservas.ruta.useQuery({ reservaId }, { staleTime: 60_000 })

  // Línea trazada por calles si hay geometría; si no, línea recta entre puntos.
  const linea: [number, number][] =
    ruta.data && ruta.data.coordinates.length > 1
      ? ruta.data.coordinates.map((c) => [c.lat, c.lng])
      : puntos.map((p) => [p.lat, p.lng])

  const ubicarme = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no permite geolocalización.")
      return
    }
    setBuscandoGps(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setYo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setBuscandoGps(false)
      },
      () => {
        toast.error("No pudimos obtener tu ubicación.")
        setBuscandoGps(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-2xl border">
        <MapContainer
          center={[origen.lat, origen.lng]}
          zoom={13}
          className="h-72 w-full sm:h-80"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AjustarVista puntos={yo ? [...puntos, yo] : puntos} />
          <Marker position={[origen.lat, origen.lng]} icon={ICONO_ORIGEN} />
          {paradas.map((parada, i) => (
            <Marker
              key={i}
              position={[parada.lat, parada.lng]}
              icon={crearIcono(String(i + 1), "#2563eb")}
            />
          ))}
          <Marker position={[destino.lat, destino.lng]} icon={ICONO_DESTINO} />
          {yo && <Marker position={[yo.lat, yo.lng]} icon={ICONO_YO} />}
          {linea.length > 1 && (
            <Polyline
              positions={linea}
              pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.85 }}
            />
          )}
        </MapContainer>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {ruta.data?.distanciaKm != null
            ? `Ruta: ${ruta.data.distanciaKm} km · aprox. ${ruta.data.duracionMin} min`
            : "Ruta estimada"}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={ubicarme}
          disabled={buscandoGps}
        >
          <RiMapPin2Line data-icon="inline-start" aria-hidden />
          {buscandoGps ? "Ubicando…" : "Mi ubicación"}
        </Button>
      </div>
    </div>
  )
}
