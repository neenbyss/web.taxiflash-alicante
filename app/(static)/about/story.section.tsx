import Image from "next/image"
import { Compass } from "lucide-react"
import { AnimatedContent } from "@/components/animated/animated-content"

export function AboutStory() {
  return (
    <section className="container-screen-2xl py-16 sm:py-24 lg:py-32">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div>
          <h2 className="mt-5 max-w-2xl font-heading text-4xl leading-tight text-balance sm:text-6xl">
            La ciudad se mueve.
            <br />
            <span className="text-primary">Nosotros, contigo.</span>
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-relaxed">
            Creemos que organizar un taxi debería ser la parte fácil de tu día.
          </p>
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            Por eso reunimos en un mismo lugar la solicitud, los detalles del
            recorrido y el estado de la reserva. Una experiencia pensada para
            quien viaja, quien conduce y quien coordina cada petición.
          </p>
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            La tecnología nos ayuda a ordenar el viaje; el trato cercano le da
            sentido. Queremos que tengas espacio para contar tus necesidades y
            claridad para saber cuál es el siguiente paso.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Vocación local", "Atención cercana", "Reserva desde la web"].map(
              (label) => (
                <span
                  key={label}
                  className="rounded-full bg-card px-4 py-2 text-sm"
                >
                  {label}
                </span>
              )
            )}
          </div>
        </div>
        <AnimatedContent distance={24} className="relative pb-8 sm:pr-8">
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl sm:rounded-4xl">
            <Image
              src="/images/alicante.png"
              alt="Vista de Alicante"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="relative -mt-24 ml-6 rounded-3xl bg-primary p-6 text-primary-foreground sm:ml-12 sm:p-8">
            <Compass className="size-7" aria-hidden />
            <p className="mt-4 font-heading text-2xl sm:text-3xl">
              Conectados con Alicante.
              <br />
              Centrados en las personas.
            </p>
          </div>
        </AnimatedContent>
      </div>
    </section>
  )
}
