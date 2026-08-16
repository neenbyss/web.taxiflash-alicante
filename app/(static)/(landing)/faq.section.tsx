import { RevealText } from "@/components/animated/reveal-text"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { RiMailFill, RiSendInsFill } from "@remixicon/react"

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
    <section className="container-screen-2xl grid grid-cols-[.8fr_1fr] gap-20 py-30 sm:py-48">
      <div>
        <RevealText
          as="h2"
          className="mb-12 font-heading leading-snug text-3xl sm:text-7xl"
          text={`Preguntas <primary>Frecuentes</primary>`}
          styles={{ primary: "text-primary" }}
        />
        <p className="mb-30 text-lg">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis dolorem alias temporibus, consequatur animi assumenda itaque excepturi quas ut ad. Error numquam possimus iste officia, nulla vero assumenda aspernatur repellendus?
        </p>

        <Field orientation="horizontal">
          <InputGroup className="bg-card border-primary">
            <InputGroupInput className="text-lg!" placeholder="tuemail@mail.com" />
            <InputGroupAddon>
              <RiMailFill className="size-6" />
            </InputGroupAddon>
          </InputGroup>
          <Button className="shrink-0">Enviar <RiSendInsFill /> </Button>
        </Field>
      </div>
      <div className="pt-20">
      <Accordion
        className="mx-auto flex flex-col gap-4 border-none!"
        defaultValue={[0]}
      >
        {FAQS.map((faq, i) => (
          <AccordionItem
            key={i}
            value={i}
            className="border-b-none rounded-xl bg-card px-3 shadow-none data-open:bg-card!"
          >
            <AccordionTrigger className="py-5 text-xl">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-lg">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      </div>
    </section>
  )
}
