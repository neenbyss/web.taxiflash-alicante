"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"

// Leaflet usa `window`; se carga solo en el navegador.
export const MapaViaje = dynamic(
  () => import("@/components/mapa/ruta-viaje-map"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-2xl sm:h-80" />,
  }
)
