import { HeartHandshake, MessageCircle, Route } from "lucide-react"

const principles = [
  {
    icon: MessageCircle,
    title: "Hablar claro",
    text: "Saber qué has solicitado, en qué estado está tu reserva y qué falta por confirmar. La información útil, en el momento adecuado.",
  },
  {
    icon: HeartHandshake,
    title: "Estar cerca",
    text: "Detrás de cada trayecto hay una persona y un plan. Nos importa que puedas explicar lo que necesitas y encontrar una vía de contacto.",
  },
  {
    icon: Route,
    title: "Hacerlo sencillo",
    text: "Menos pasos entre pensar en un viaje y organizarlo. Una web para preparar el recorrido y consultar sus novedades desde el móvil.",
  },
]

export function AboutPrinciples() {
  return (
    <section className="container-screen-2xl py-16 sm:py-24 lg:py-32">
      <div className="max-w-2xl">
        <h2 className="mt-5 font-heading text-4xl leading-tight sm:text-6xl">
          Los detalles también{" "}
          <span className="text-primary">te acompañan.</span>
        </h2>
      </div>
      <div className="mt-12 grid gap-9 md:grid-cols-3 md:gap-12">
        {principles.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Icon aria-hidden className="size-6" />
            </div>
            <h3 className="mt-6 font-heading text-2xl">{title}</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
