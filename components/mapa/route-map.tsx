"use client"

// Mapa de selección de puntos (Leaflet + OpenStreetMap).
// Solo sirve para FIJAR origen/paradas/destino: no hay tracking en vivo.
// Este módulo debe cargarse con dynamic(..., { ssr: false }).

import L from "leaflet"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import {
  MapContainer,
  Marker,
  Pane,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet"
import { toast } from "sonner"

import "leaflet/dist/leaflet.css"

import { DireccionSearch } from "@/components/mapa/direccion-search"
import { PuntosRuta } from "@/components/forms/puntos-ruta"
import { TarifaEstimada } from "@/components/forms/tarifa-estimada"
import { Button } from "@/components/ui/button"
import { RiHandLine, RiMapPin2Fill, RiMapPin2Line } from "@/components/icons"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { direccionInversa } from "@/lib/geocoding"
import { trpc } from "@/lib/trpc"
import type { PuntoRuta } from "@/lib/validations/reserva"
import { useReservaBorrador, type PuntoActivo } from "@/stores/reserva-borrador"

const CENTRO_DEFAULT: [number, number] = [
  Number(process.env.NEXT_PUBLIC_MAP_CENTER_LAT ?? 40.4168),
  Number(process.env.NEXT_PUBLIC_MAP_CENTER_LNG ?? -3.7038),
]
const SPAIN_BOUNDS = L.latLngBounds([35.5, -9.5], [43.9, 4.5])

const WIDE_MAP_QUERY = "(min-width: 1024px)"
const subscribeWideMap = (callback: () => void) => {
  const query = window.matchMedia(WIDE_MAP_QUERY)
  query.addEventListener("change", callback)
  return () => query.removeEventListener("change", callback)
}
const getWideMapSnapshot = () => window.matchMedia(WIDE_MAP_QUERY).matches
const getWideMapServerSnapshot = () => false

// Iconos como divIcon (círculos con etiqueta): sin assets de imagen, que el
// bundler no resuelve bien con Leaflet.
function crearIcono(
  etiqueta: string,
  color: string,
  kind: "start" | "stop" | "end"
) {
  return L.divIcon({
    className: "",
    html: `<div class="taxiflash-map-marker" data-kind="${kind}" style="--marker-color:${color}"><span>${etiqueta}</span></div>`,
    iconSize: [38, 44],
    iconAnchor: [19, 42],
  })
}

const ICONO_ORIGEN = crearIcono("O", "#17805c", "start")
const ICONO_DESTINO = crearIcono("D", "#242422", "end")

function etiquetaPuntoActivo(punto: PuntoActivo): string {
  if (punto === "origen") return "el origen"
  if (punto === "destino") return "el destino"
  return `la parada ${punto.parada + 1}`
}

function nombrePunto(punto: PuntoActivo): string {
  if (punto === "origen") return "Origen"
  if (punto === "destino") return "Destino"
  return `Parada ${punto.parada + 1}`
}

function obtenerPunto(
  objetivo: PuntoActivo,
  origen: PuntoRuta | null,
  destino: PuntoRuta | null,
  paradas: (PuntoRuta | null)[]
) {
  if (objetivo === "origen") return origen
  if (objetivo === "destino") return destino
  return paradas[objetivo.parada] ?? null
}

type RouteMarkerProps = {
  objetivo: PuntoActivo
  punto: PuntoRuta
  icon: L.DivIcon
  onOpen: (objetivo: PuntoActivo) => void
  onMoved: (message: string) => void
}

function RouteMarker({
  objetivo,
  punto,
  icon,
  onOpen,
  onMoved,
}: RouteMarkerProps) {
  const { actualizarPunto, setPuntoActivo } = useReservaBorrador()
  const markerRef = useRef<L.Marker>(null)
  const geocodingSequence = useRef(0)

  useEffect(() => {
    const element = markerRef.current?.getElement()
    if (!element) return

    const label = `${nombrePunto(objetivo)}. Pulsa para ver sus detalles; mantén y arrastra para moverlo.`
    element.setAttribute("role", "button")
    element.setAttribute("aria-label", label)

    const openFromKeyboard = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return
      event.preventDefault()
      event.stopPropagation()
      setPuntoActivo(objetivo)
      onOpen(objetivo)
    }
    element.addEventListener("keydown", openFromKeyboard)
    return () => element.removeEventListener("keydown", openFromKeyboard)
  }, [objetivo, onOpen, setPuntoActivo])

  const actualizarDesdeMarcador = async (marker: L.Marker) => {
    const sequence = ++geocodingSequence.current
    const { lat, lng } = marker.getLatLng()
    const coordenadas = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    actualizarPunto(objetivo, { direccion: coordenadas, lat, lng })
    const direccion = await direccionInversa(lat, lng)
    if (sequence !== geocodingSequence.current) return
    actualizarPunto(objetivo, { direccion, lat, lng })
    onMoved(`${nombrePunto(objetivo)} actualizado: ${direccion}`)
  }

  return (
    <Marker
      ref={markerRef}
      position={[punto.lat, punto.lng]}
      icon={icon}
      draggable
      autoPan
      keyboard
      bubblingMouseEvents={false}
      riseOnHover
      title={`${nombrePunto(objetivo)}. Pulsa para ver los detalles o mantén y arrastra para moverlo.`}
      alt={`Pin de ${nombrePunto(objetivo)}`}
      eventHandlers={{
        click: () => {
          setPuntoActivo(objetivo)
          onOpen(objetivo)
        },
        dragstart: () => setPuntoActivo(objetivo),
        dragend: (event) =>
          void actualizarDesdeMarcador(event.target as L.Marker),
      }}
    />
  )
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
      map.fitBounds(L.latLngBounds(puntos.map((p) => [p.lat, p.lng])), {
        padding: [40, 40],
      })
    }
  }, [map, puntos])
  return null
}

function CurrentLocationControl() {
  const map = useMap()
  const { setPunto, setPuntoActivo } = useReservaBorrador()
  const [loading, setLoading] = useState(false)
  const controlRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!controlRef.current) return
    L.DomEvent.disableClickPropagation(controlRef.current)
    L.DomEvent.disableScrollPropagation(controlRef.current)
  }, [])

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no permite obtener la ubicación.")
      return
    }
    if (loading) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude
        const lng = coords.longitude
        setPuntoActivo("origen")
        setPunto("origen", {
          direccion: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          lat,
          lng,
        })
        map.flyTo([lat, lng], 16, { duration: 0.8 })
        const direccion = await direccionInversa(lat, lng)
        setPunto("origen", { direccion, lat, lng })
        setLoading(false)
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    )
  }

  return (
    <div
      ref={controlRef}
      className="absolute top-3 right-3 z-1000 lg:top-auto lg:right-87 lg:bottom-14"
    >
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="size-11 shadow-lg"
        onClick={locate}
        disabled={loading}
        aria-label={
          loading ? "Obteniendo tu ubicación" : "Usar mi ubicación como origen"
        }
        title="Usar mi ubicación"
      >
        <RiMapPin2Line
          className="size-5 fill-primary/20 text-primary"
          aria-hidden
        />
      </Button>
    </div>
  )
}

function InvalidateMapSize() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    let frame = requestAnimationFrame(() => map.invalidateSize())
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => map.invalidateSize({ pan: false }))
    })
    observer.observe(container)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [map])

  return null
}

export default function RouteMap() {
  const isWideMap = useSyncExternalStore(
    subscribeWideMap,
    getWideMapSnapshot,
    getWideMapServerSnapshot
  )
  const {
    origen,
    destino,
    paradas,
    puntoActivo,
    setPunto,
    actualizarPunto,
    setPuntoActivo,
    quitarParada,
  } = useReservaBorrador()
  const [puntoEnDetalle, setPuntoEnDetalle] = useState<PuntoActivo | null>(null)
  const [mapStatus, setMapStatus] = useState("")
  const puntoSeleccionado = puntoEnDetalle
    ? obtenerPunto(puntoEnDetalle, origen, destino, paradas)
    : null

  const fijados = useMemo<PuntoRuta[]>(
    () => [
      ...(origen ? [origen] : []),
      ...paradas.filter((p): p is PuntoRuta => p !== null),
      ...(destino ? [destino] : []),
    ],
    [destino, origen, paradas]
  )
  const ruta = trpc.reservas.previsualizarRuta.useQuery(
    { puntos: fijados.map(({ lat, lng }) => ({ lat, lng })) },
    { enabled: fijados.length > 1, staleTime: 60_000, retry: 1 }
  )
  const linea: [number, number][] = ruta.data?.coordinates.length
    ? ruta.data.coordinates.map(({ lat, lng }) => [lat, lng])
    : fijados.map(({ lat, lng }) => [lat, lng])
  const ordenParadas = new Map(
    (ruta.data?.ordenPuntos ?? fijados.map((_, index) => index))
      .slice(1, -1)
      .map((inputIndex, order) => [inputIndex - 1, order + 1])
  )

  return (
    <div className="relative isolate z-0 h-full w-full max-w-full min-w-0 overflow-hidden rounded-2xl bg-card shadow-sm lg:h-auto">
      <div className="absolute top-3 right-84 left-16 z-20 hidden lg:block">
        <DireccionSearch
          placeholder={`Buscar dirección para ${etiquetaPuntoActivo(puntoActivo)}…`}
          onSelect={(resultado) => setPunto(puntoActivo, resultado)}
        />
      </div>
      <MapContainer
        center={CENTRO_DEFAULT}
        zoom={13}
        maxBounds={SPAIN_BOUNDS}
        maxBoundsViscosity={1}
        minZoom={6}
        className="z-0 h-full min-h-0 w-full lg:h-[min(72dvh,46rem)] lg:min-h-128"
        scrollWheelZoom={false}
        zoomControl
        dragging
        touchZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <InvalidateMapSize />
        <CurrentLocationControl />
        <ClickHandler />
        <AjustarVista puntos={fijados} />
        {origen && (
          <RouteMarker
            objetivo="origen"
            punto={origen}
            icon={ICONO_ORIGEN}
            onOpen={setPuntoEnDetalle}
            onMoved={setMapStatus}
          />
        )}
        {paradas.map(
          (parada, i) =>
            parada && (
              <RouteMarker
                key={`parada-${i}`}
                objetivo={{ parada: i }}
                punto={parada}
                icon={crearIcono(
                  String(ordenParadas.get(i) ?? i + 1),
                  "#f5b51b",
                  "stop"
                )}
                onOpen={setPuntoEnDetalle}
                onMoved={setMapStatus}
              />
            )
        )}
        {destino && (
          <RouteMarker
            objetivo="destino"
            punto={destino}
            icon={ICONO_DESTINO}
            onOpen={setPuntoEnDetalle}
            onMoved={setMapStatus}
          />
        )}
        {linea.length > 1 && (
          <Pane name="taxiflash-route" style={{ zIndex: 450 }}>
            <Polyline
              positions={linea}
              pathOptions={{ color: "#242422", opacity: 0.35, weight: 9 }}
            />
            <Polyline
              positions={linea}
              pathOptions={{
                color: "#f5b51b",
                dashArray: ruta.data?.coordinates.length ? undefined : "8 10",
                lineCap: "round",
                lineJoin: "round",
                opacity: 1,
                weight: 5,
              }}
            />
          </Pane>
        )}
      </MapContainer>
      <p className="sr-only" role="status" aria-live="polite">
        {mapStatus}
      </p>
      {isWideMap && (
        <aside className="absolute top-3 right-3 bottom-3 z-20 w-80 overflow-y-auto rounded-2xl bg-background/96 p-3 shadow-[0_12px_40px_rgb(30_29_26/18%)]">
          <div className="mb-3 px-1">
            <p className="font-heading text-lg font-medium">Tu recorrido</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Selecciona una etapa y busca o toca el mapa.
            </p>
          </div>
          <PuntosRuta />
          <div className="mt-3">
            <TarifaEstimada />
          </div>
        </aside>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 hidden flex-wrap items-center justify-between gap-2 bg-background/92 px-3 py-2 text-xs text-muted-foreground lg:right-83 lg:flex">
        <p>
          Haz click o busca una dirección para fijar{" "}
          <strong>{etiquetaPuntoActivo(puntoActivo)}</strong>.
        </p>
        {ruta.isFetching ? (
          <span>Calculando mejor recorrido…</span>
        ) : ruta.data?.distanciaKm != null ? (
          <span className="font-medium text-foreground">
            {ruta.data.distanciaKm} km · {ruta.data.duracionMin} min
            {paradas.filter(Boolean).length > 1 ? " · paradas optimizadas" : ""}
          </span>
        ) : fijados.length > 1 ? (
          <span>Recorrido aproximado</span>
        ) : null}
      </div>

      <Sheet
        open={puntoEnDetalle !== null && puntoSeleccionado !== null}
        onOpenChange={(open) => {
          if (!open) setPuntoEnDetalle(null)
        }}
      >
        <SheetContent
          side={isWideMap ? "right" : "bottom"}
          className="max-h-[82dvh] overflow-y-auto rounded-t-2xl border-0 lg:max-w-md lg:rounded-none"
        >
          {puntoEnDetalle && puntoSeleccionado && (
            <>
              <SheetHeader className="gap-3 pb-4">
                <div className="flex items-start gap-3 pr-10">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                    <RiMapPin2Fill className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <SheetTitle className="text-xl">
                      {nombrePunto(puntoEnDetalle)}
                    </SheetTitle>
                    <SheetDescription className="mt-1 leading-relaxed">
                      Consulta el lugar, busca otra dirección o mantén pulsado
                      el pin para moverlo.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-5 px-6 pb-6">
                <div className="rounded-2xl bg-muted/65 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Dirección seleccionada
                  </p>
                  <p className="mt-1.5 text-base leading-relaxed font-medium [overflow-wrap:anywhere] text-foreground">
                    {puntoSeleccionado.direccion}
                  </p>
                  <p className="mt-3 font-mono text-xs text-muted-foreground tabular-nums">
                    {puntoSeleccionado.lat.toFixed(5)},{" "}
                    {puntoSeleccionado.lng.toFixed(5)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="route-marker-search"
                  >
                    Cambiar este lugar
                  </label>
                  <div>
                    <DireccionSearch
                      id="route-marker-search"
                      placeholder={`Buscar otro ${nombrePunto(puntoEnDetalle).toLocaleLowerCase("es")}…`}
                      onSelect={(resultado) => {
                        actualizarPunto(puntoEnDetalle, resultado)
                        setPuntoActivo(puntoEnDetalle)
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-secondary p-4 text-secondary-foreground">
                  <RiHandLine
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <p className="text-sm leading-relaxed">
                    En el mapa, mantén el dedo sobre este pin y arrástralo. La
                    dirección se actualizará al soltarlo.
                  </p>
                </div>

                {typeof puntoEnDetalle === "object" && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      quitarParada(puntoEnDetalle.parada)
                      setPuntoEnDetalle(null)
                    }}
                  >
                    Eliminar esta parada
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
