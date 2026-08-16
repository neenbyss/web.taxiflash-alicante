// Paradas de taxi de ejemplo (Alicante). Sustituir por datos reales.

export type TaxiLocation = {
  id: string
  name: string
  address: string
  district: string
  lat: number
  lng: number
  hours?: string
}

/** Centro aproximado de Alicante [lng, lat]. */
export const ALICANTE_CENTER: [number, number] = [-0.4907, 38.3452]

export const taxiLocations: TaxiLocation[] = [
  {
    id: "estacion",
    name: "Estación de Alicante",
    address: "Av. de Salamanca, 03005 Alicante",
    district: "Centro",
    lat: 38.3446,
    lng: -0.4926,
    hours: "24 h",
  },
  {
    id: "explanada",
    name: "Explanada de España",
    address: "Explanada de España, 03002 Alicante",
    district: "Puerto",
    lat: 38.3406,
    lng: -0.4818,
    hours: "06:00 – 02:00",
  },
  {
    id: "mercado",
    name: "Mercado Central",
    address: "Av. de Alfonso X El Sabio, 03004 Alicante",
    district: "Centro",
    lat: 38.3486,
    lng: -0.4855,
    hours: "07:00 – 22:00",
  },
  {
    id: "san-juan",
    name: "Playa de San Juan",
    address: "Av. de Niza, 03540 Alicante",
    district: "Playa de San Juan",
    lat: 38.3792,
    lng: -0.4173,
    hours: "24 h",
  },
  {
    id: "hospital",
    name: "Hospital General",
    address: "C. Pintor Baeza, 03010 Alicante",
    district: "Norte",
    lat: 38.3699,
    lng: -0.5099,
    hours: "24 h",
  },
]
