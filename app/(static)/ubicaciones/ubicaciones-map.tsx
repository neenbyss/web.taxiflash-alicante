"use client"

import L from "leaflet"
import { useEffect } from "react"
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet"

import "leaflet/dist/leaflet.css"

import type { TaxiLocation } from "@/lib/locations"

function iconoTaxi(activo: boolean) {
  const size = activo ? 36 : 26
  const bg = activo ? "#eab308" : "#f43f5e"
  return L.divIcon({
    className: "",
    html: `<div style="background:${bg};color:#fff;border-radius:9999px;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.4);font-size:${activo ? 16 : 12}px">🚕</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function VolarA({ location }: { location: TaxiLocation | null }) {
  const map = useMap()
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], 15, { duration: 1.2 })
  }, [map, location])
  return null
}

type UbicacionesMapProps = {
  locations: TaxiLocation[]
  selectedId: string | null
  seleccionada: TaxiLocation | null
  onSelect: (id: string) => void
  center: [number, number]
}

export default function UbicacionesMap({
  locations,
  selectedId,
  seleccionada,
  onSelect,
  center,
}: UbicacionesMapProps) {
  return (
    <MapContainer center={[center[1], center[0]]} zoom={12} className="isolate z-0 size-full min-h-96">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <VolarA location={seleccionada} />
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={iconoTaxi(selectedId === loc.id)}
          eventHandlers={{ click: () => onSelect(loc.id) }}
        />
      ))}
    </MapContainer>
  )
}
