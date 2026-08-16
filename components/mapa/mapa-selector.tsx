"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"

// Leaflet toca `window`, así que el mapa se carga solo en el navegador.
export const MapaSelector = dynamic(
  () => import("@/components/mapa/route-map"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full rounded-2xl sm:h-96" />,
  }
)
