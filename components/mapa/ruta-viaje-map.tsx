"use client"

// Mapa de un viaje: dibuja la ruta (origen → paradas → destino) trazada por
// calles (geometría OSRM vía tRPC; si falla, línea recta) y permite mostrar
// tu ubicación con el GPS del navegador. No hay seguimiento en vivo.

import { RiMapPin2Line } from "@/components/icons"
import L from "leaflet"
import { useEffect, useState } from "react"
import {
  MapContainer,
  Marker,
  Pane,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet"
import { toast } from "sonner"

import "leaflet/dist/leaflet.css"

import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc"
import type { PuntoRuta } from "@/lib/validations/reserva"

function crearIcono(etiqueta: string, color: string, kind: "start" | "stop" | "end") {
  return L.divIcon({
    className: "",
    html: `<div class="taxiflash-map-marker" data-kind="${kind}" style="--marker-color:${color}"><span>${etiqueta}</span></div>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
  })
}
const ICONO_ORIGEN = crearIcono("O", "#17805c", "start")
const ICONO_DESTINO = crearIcono("D", "#242422", "end")
const ICONO_YO = crearIcono("Tú", "#2563eb", "stop")

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
      <div className="relative isolate z-0 overflow-hidden rounded-2xl border">
        <MapContainer
          center={[origen.lat, origen.lng]}
          zoom={13}
          className="z-0 h-72 w-full sm:h-80"
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
              icon={crearIcono(String(i + 1), "#f5b51b", "stop")}
            />
          ))}
          <Marker position={[destino.lat, destino.lng]} icon={ICONO_DESTINO} />
          {yo && <Marker position={[yo.lat, yo.lng]} icon={ICONO_YO} />}
          {linea.length > 1 && (
            <Pane name="trip-route" style={{ zIndex: 450 }}>
              <Polyline positions={linea} pathOptions={{ color: "#242422", weight: 9, opacity: 0.35 }} />
              <Polyline positions={linea} pathOptions={{ color: "#f5b51b", weight: 5, opacity: 1, lineCap: "round", lineJoin: "round" }} />
            </Pane>
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
