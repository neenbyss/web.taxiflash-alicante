"use client"

import { create } from "zustand"

import type { PuntoRuta } from "@/lib/validations/reserva"

// Punto de la ruta que el usuario está fijando ahora mismo con el mapa:
// origen, destino o índice de parada intermedia.
export type PuntoActivo = "origen" | "destino" | { parada: number }

type ReservaBorradorState = {
  origen: PuntoRuta | null
  destino: PuntoRuta | null
  paradas: (PuntoRuta | null)[]
  puntoActivo: PuntoActivo
  setPunto: (destino: PuntoActivo, punto: PuntoRuta) => void
  actualizarPunto: (destino: PuntoActivo, punto: PuntoRuta) => void
  setPuntoActivo: (punto: PuntoActivo) => void
  agregarParada: () => void
  quitarParada: (indice: number) => void
  reiniciar: () => void
}

/**
 * Borrador de la reserva en curso, compartido entre el mapa (clicks) y el
 * formulario (react-hook-form se sincroniza con estos valores). Zustand evita
 * prop-drilling entre componentes hermanos.
 */
export const useReservaBorrador = create<ReservaBorradorState>((set) => ({
  origen: null,
  destino: null,
  paradas: [],
  puntoActivo: "origen",
  setPunto: (destino, punto) =>
    set((state) => {
      if (destino === "origen") {
        // Tras fijar origen, el siguiente click apunta al destino.
        return { origen: punto, puntoActivo: "destino" as const }
      }
      if (destino === "destino") return { destino: punto }
      const paradas = [...state.paradas]
      paradas[destino.parada] = punto
      return { paradas }
    }),
  actualizarPunto: (destino, punto) =>
    set((state) => {
      if (destino === "origen") return { origen: punto }
      if (destino === "destino") return { destino: punto }
      const paradas = [...state.paradas]
      paradas[destino.parada] = punto
      return { paradas }
    }),
  setPuntoActivo: (puntoActivo) => set({ puntoActivo }),
  agregarParada: () =>
    set((state) =>
      state.paradas.length >= 3
        ? state
        : {
            paradas: [...state.paradas, null],
            puntoActivo: { parada: state.paradas.length },
          }
    ),
  quitarParada: (indice) =>
    set((state) => ({
      paradas: state.paradas.filter((_, i) => i !== indice),
      puntoActivo: "destino",
    })),
  reiniciar: () =>
    set({ origen: null, destino: null, paradas: [], puntoActivo: "origen" }),
}))
