"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"

// Leaflet toca `window`, así que el mapa se carga solo en el navegador.
export const MapaSelector = dynamic(
  () => import("@/components/mapa/route-map"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-0 w-full rounded-2xl lg:h-[min(72dvh,46rem)] lg:min-h-128" />,
  }
)
