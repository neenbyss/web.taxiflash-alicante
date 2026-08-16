import { Hero } from "@/components/common/hero";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from "@/components/ui/input-group";
import { RiMailLine, RiMapPin2Line, RiMessage2Line, RiPhoneLine, RiUser3Line } from "@remixicon/react";

const contactData = [
  {
    "icon": <RiMapPin2Line />,
    "label": "Taxi Gol Alicante",
    "description": "Calle Navas 46, 03002 - Alicante, España"
  },
  {
    "icon": <RiPhoneLine />,
    "label": "Teléfono",
    "description": "613951973"
  },
  {
    "icon": <RiMailLine />,
    "label": "Email",
    "description": "taxigold114@gmail.com"
  }
]

export default function Contact() {
  return (
    <main className="relative space-y-5 lg:p-2">
      <h1 className="sr-only"> Contáctanos </h1>

      <Hero title="Contacto" description="Comunícate con nosotros" />
      <section className="relative z-10 container-screen-xl pt-12 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-25">
        <div>
          <h2 className="text-4xl font-medium capitalize text-balance mb-3">
            Envíanos un mensaje
          </h2>
          <p>
            ¿Quieres reservar un taxi en Alicante pero necesitas realizar antes
            una consulta? Rellena el siguiente formulario y nos pondremos en
            contacto contigo lo antes posible.
          </p>

          <form className="mt-12">
            <FieldGroup>
              <FieldSet className="gap-2">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Nombres Completos</FieldLabel>
                    <InputGroup>
                      <InputGroupInput placeholder="Nombres Completos" />
                      <InputGroupAddon>
                        <RiUser3Line />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel>Correo Electrónico</FieldLabel>
                    <InputGroup>
                      <InputGroupInput placeholder="Correo Electrónico" />
                      <InputGroupAddon>
                        <RiMailLine />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel>Número de Teléfono</FieldLabel>
                    <InputGroup>
                      <InputGroupInput placeholder="Número de Teléfono" />
                      <InputGroupAddon>
                        <RiPhoneLine />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                  <Field>
                    <FieldLabel>Mensaje</FieldLabel>
                    <InputGroup className="items-start">
                      <InputGroupTextarea className="min-h-28" placeholder="Mensaje" />
                      <InputGroupAddon className="pt-3.5">
                        <RiMessage2Line />
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                  <Button>
                    Enviar Mensaje
                  </Button>
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </form>
        </div>
        <div>
          <h2 className="text-4xl font-medium capitalize text-balance mb-4">
            Ponte en Contacto
          </h2>

          <ul className="flex flex-col gap-2">
            {contactData.map(({icon, description, label}, i) => {
              return (
                <li key={i} className="flex items-center gap-3">
                  <span className="size-16 flex flex-col justify-center items-center rounded-lg bg-linear-to-t to-primary from-purple-800 text-primary-foreground [&_svg]:size-6.5">
                    {icon}
                  </span>
                  <div>
                    <label className="text-2xl font-medium">
                      {label}
                    </label>
                    <p>
                      {description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}

