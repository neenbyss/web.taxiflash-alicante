import { RevealText } from "@/components/animated/reveal-text"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
  {
    q: "¿Necesito una cuenta para reservar?",
    a: "Sí. Crear una cuenta te toma segundos y te permite guardar tu historial, seguir el estado de tus viajes en tiempo real y dejar reseñas al finalizar.",
  },
  {
    q: "¿Cómo se calcula la tarifa?",
    a: "Al fijar origen y destino en el mapa te mostramos una tarifa estimada según la distancia de la ruta. Es orientativa: el cobro real se hace por taxímetro al finalizar el viaje.",
  },
  {
    q: "¿Puedo programar un viaje para más tarde?",
    a: "Claro. En el formulario de reserva elige “Programar” e indica la fecha y hora; el viaje quedará pendiente hasta que un chofer lo acepte.",
  },
  {
    q: "¿Qué pasa después de reservar?",
    a: "Tu reserva queda pendiente y un chofer la acepta desde su portal. Verás su nombre y teléfono, podrás chatear con él y seguir cada estado: en camino, llegó, en curso y finalizado.",
  },
  {
    q: "¿Hacen viajes al aeropuerto y entre ciudades?",
    a: "Sí. Ofrecemos traslados al aeropuerto de Alicante (ALC) y alquiler entre ciudades o por horas, con precio confirmado manualmente por nuestro equipo.",
  },
  {
    q: "¿Cómo reporto un problema con un viaje?",
    a: "Desde el detalle del viaje o tu perfil puedes enviar un reporte. Nuestro equipo lo revisa y le da seguimiento hasta resolverlo.",
  },
]

export function Faq() {
  return (
    <section className="container-screen-2xl grid grid-cols-1 gap-10 py-20 sm:py-32 lg:grid-cols-[.8fr_1fr] lg:gap-20 lg:py-48">
      <div>
        <RevealText
          as="h2"
          className="mb-12 font-heading leading-snug text-3xl sm:text-7xl"
          text={`Preguntas <primary>Frecuentes</primary>`}
          styles={{ primary: "text-primary" }}
        />
        <p className="mb-10 text-base sm:mb-16 sm:text-lg lg:mb-30">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis dolorem alias temporibus, consequatur animi assumenda itaque excepturi quas ut ad. Error numquam possimus iste officia, nulla vero assumenda aspernatur repellendus?
        </p>
      </div>
      <div className="pt-2 lg:pt-20">
      <Accordion
        className="mx-auto flex flex-col gap-4 border-none!"
        defaultValue={[0]}
      >
        {FAQS.map((faq, i) => (
          <AccordionItem
            key={i}
            value={i}
            className="border-b-none md:rounded-xl md:bg-card px-0 md:px-3 shadow-none sm:data-open:bg-card!"
          >
            <AccordionTrigger className="p-0 md:p-4 py-5 text-base sm:text-xl">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm sm:text-lg">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      </div>
    </section>
  )
}
