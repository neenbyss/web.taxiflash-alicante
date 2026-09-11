import Link from "next/link"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  HeartPulse,
  Hotel,
  Ticket,
  TrainFront,
} from "lucide-react"

const everydayServices = [
  {
    icon: TrainFront,
    title: "Estaciones y conexiones",
    label: "Para seguir tu viaje",
    text: "Traslados a estaciones de tren y autobús. Indica la hora de salida y el punto de encuentro para preparar la recogida con margen.",
    detail: "Añade el tren o autobús de referencia en las notas.",
  },
  {
    icon: Hotel,
    title: "Hoteles y alojamientos",
    label: "De la maleta al descanso",
    text: "Solicita la recogida en tu hotel, apartamento o alojamiento y organiza tu llegada, salida o desplazamiento durante la estancia.",
    detail: "Confirma la dirección y el acceso de recogida.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Viajes de trabajo",
    label: "Tu agenda, organizada",
    text: "Desplazamientos a reuniones, oficinas o congresos. Programa el trayecto y comunica los horarios que necesitas respetar.",
    detail: "Para varias gestiones, consulta la opción por horas.",
  },
  {
    icon: Ticket,
    title: "Eventos y celebraciones",
    label: "Disfruta de tu plan",
    text: "Prepara el traslado a una cena, concierto o celebración. Indica el lugar y solicita con antelación la recogida que necesitas.",
    detail: "Cada trayecto queda sujeto a confirmación y disponibilidad.",
  },
  {
    icon: HeartPulse,
    title: "Citas y gestiones personales",
    label: "Para lo importante",
    text: "Viajes en taxi a consultas, centros de atención o trámites. Comparte cualquier necesidad de acceso antes de confirmar.",
    detail: "No es transporte sanitario ni un servicio de emergencias.",
  },
  {
    icon: CalendarClock,
    title: "Recogidas programadas",
    label: "Un paso por delante",
    text: "Organiza un desplazamiento para otro momento. Selecciona la fecha y la hora y consulta el estado de tu solicitud en el panel.",
    detail: "La programación no supone una reserva recurrente automática.",
  },
]

export function ServicesCatalogue() {
  return (
    <section id="everyday" className="container-screen-2xl scroll-mt-8 py-12">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <h2 className="mt-4 font-heading text-4xl leading-tight sm:text-6xl">
          No todos los viajes
          <br />
          empiezan en un aeropuerto.
        </h2>
        <p className="max-w-md leading-relaxed text-muted-foreground lg:text-right">
          Hay muchas razones para moverse. Estas son otras formas de solicitar
          tu taxi, con información práctica para preparar cada recogida.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:mt-24 md:grid-cols-2 xl:grid-cols-3">
        {everydayServices.map(({ icon: Icon, title, label, text, detail }) => (
          <article
            key={title}
            className="flex flex-col rounded-3xl bg-card p-6 sm:p-8"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="max-w-36 text-right text-xs text-muted-foreground">
                {label}
              </span>
            </div>
            <h3 className="mt-7 font-heading text-2xl">{title}</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">{text}</p>
            <p className="mt-5 rounded-2xl bg-background p-4 text-sm leading-relaxed">
              {detail}
            </p>
            <Link
              href="/customer/book"
              className="mt-auto flex min-h-12 items-center justify-between gap-3 rounded-lg pt-6 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary"
            >
              Preparar este viaje
              <ArrowUpRight className="size-5" aria-hidden />
              <span className="sr-only">: {title}</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
