import { Compass, Target } from "lucide-react"

export function AboutPurpose() {
  return (
    <section className="rounded-3xl bg-inner-background text-inner-foreground sm:rounded-4xl">
      <div className="container-screen-2xl py-16 sm:py-24 lg:py-32">
        <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-20">
          <h2 className="max-w-xl font-heading text-4xl leading-tight sm:text-6xl">
            Una idea sencilla.
            <br />
            Una dirección clara.
          </h2>
          <p className="max-w-lg self-end text-lg leading-relaxed opacity-75">
            No se trata solo de llegar. También importa cómo organizas el viaje,
            cómo te informan y cómo te sientes durante el proceso.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-2">
          {[
            {
              icon: Target,
              label: "01 / Nuestra misión",
              title: "Quitar complicaciones al camino.",
              text: "Facilitar la movilidad en Alicante con una gestión de reservas comprensible y un trato atento. Ayudar a que pasajeros y conductores compartan los detalles necesarios para organizar cada trayecto.",
            },
            {
              icon: Compass,
              label: "02 / Nuestra visión",
              title: "Ser parte de tu día a día.",
              text: "Construir una alternativa local en la que puedas confiar para organizar tus desplazamientos. Crecer escuchando a quienes viajan y a quienes conducen, con tecnología que aporte utilidad real.",
            },
          ].map(({ icon: Icon, label, title, text }) => (
            <article key={label} className="rounded-3xl bg-white/5 p-7 sm:p-10">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs tracking-wider text-primary uppercase">
                  {label}
                </p>
                <Icon className="size-7 text-primary" aria-hidden />
              </div>
              <h3 className="mt-10 max-w-md font-heading text-3xl sm:text-4xl">
                {title}
              </h3>
              <p className="mt-5 max-w-xl leading-relaxed opacity-75">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
