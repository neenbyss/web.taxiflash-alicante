"use client"

// Mapa de selección de puntos (Leaflet + OpenStreetMap).
// Solo sirve para FIJAR origen/paradas/destino: no hay tracking en vivo.
// Este módulo debe cargarse con dynamic(..., { ssr: false }).

import L from "leaflet"
import { useEffect } from "react"
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet"

import "leaflet/dist/leaflet.css"

import { DireccionSearch } from "@/components/mapa/direccion-search"
import { direccionInversa } from "@/lib/geocoding"
import type { PuntoRuta } from "@/lib/validations/reserva"
import { useReservaBorrador, type PuntoActivo } from "@/stores/reserva-borrador"

const CENTRO_DEFAULT: [number, number] = [
  Number(process.env.NEXT_PUBLIC_MAP_CENTER_LAT ?? 40.4168),
  Number(process.env.NEXT_PUBLIC_MAP_CENTER_LNG ?? -3.7038),
]

// Iconos como divIcon (círculos con etiqueta): sin assets de imagen, que el
// bundler no resuelve bien con Leaflet.
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

function etiquetaPuntoActivo(punto: PuntoActivo): string {
  if (punto === "origen") return "el origen"
  if (punto === "destino") return "el destino"
  return `la parada ${punto.parada + 1}`
}

function ClickHandler() {
  const { puntoActivo, setPunto } = useReservaBorrador()
  useMapEvents({
    async click(evento) {
      const { lat, lng } = evento.latlng
      // Se fija el punto de inmediato con las coordenadas y se completa la
      // dirección legible en segundo plano.
      setPunto(puntoActivo, {
        direccion: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        lat,
        lng,
      })
      const direccion = await direccionInversa(lat, lng)
      setPunto(puntoActivo, { direccion, lat, lng })
    },
  })
  return null
}

/** Reencuadra el mapa cuando cambian los puntos fijados. */
function AjustarVista({ puntos }: { puntos: PuntoRuta[] }) {
  const map = useMap()
  useEffect(() => {
    if (puntos.length === 1) {
      map.setView([puntos[0].lat, puntos[0].lng], 15)
    } else if (puntos.length > 1) {
      map.fitBounds(
        L.latLngBounds(puntos.map((p) => [p.lat, p.lng])),
        { padding: [40, 40] }
      )
    }
  }, [map, puntos])
  return null
}

export default function RouteMap() {
  const { origen, destino, paradas, puntoActivo, setPunto } = useReservaBorrador()

  const fijados: PuntoRuta[] = [
    ...(origen ? [origen] : []),
    ...paradas.filter((p): p is PuntoRuta => p !== null),
    ...(destino ? [destino] : []),
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl border">
      <div className="absolute top-2 right-2 left-2 z-1000">
        <DireccionSearch
          placeholder={`Buscar dirección para ${etiquetaPuntoActivo(puntoActivo)}…`}
          onSelect={(resultado) => setPunto(puntoActivo, resultado)}
        />
      </div>
      <MapContainer
        center={CENTRO_DEFAULT}
        zoom={13}
        className="h-80 w-full sm:h-96"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler />
        <AjustarVista puntos={fijados} />
        {origen && <Marker position={[origen.lat, origen.lng]} icon={ICONO_ORIGEN} />}
        {paradas.map(
          (parada, i) =>
            parada && (
              <Marker
                key={`parada-${i}`}
                position={[parada.lat, parada.lng]}
                icon={crearIcono(String(i + 1), "#2563eb")}
              />
            )
        )}
        {destino && <Marker position={[destino.lat, destino.lng]} icon={ICONO_DESTINO} />}
        {fijados.length > 1 && (
          <Polyline
            positions={fijados.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: "#2563eb", dashArray: "6 8", weight: 3 }}
          />
        )}
      </MapContainer>
      <p className="bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
        Haz click en el mapa (o busca una dirección) para fijar{" "}
        <strong>{etiquetaPuntoActivo(puntoActivo)}</strong>.
      </p>
    </div>
  )
}
