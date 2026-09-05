"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { FormInputControl } from "@/components/forms/form-control"
import { RiHashtag } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import {
  consultarReservaSchema,
  type ConsultarReservaInput,
} from "@/lib/validations/reserva"

export default function ConsultarReservaPage() {
  const router = useRouter()
  const form = useForm<ConsultarReservaInput>({
    resolver: zodResolver(consultarReservaSchema),
    defaultValues: { codigo: "" },
  })

  return (
    <main id="contenido" className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 font-heading text-2xl font-semibold">
        Consultar reserva
      </h1>
      <form
        onSubmit={form.handleSubmit(({ codigo }) =>
          router.push(`/reserva/${encodeURIComponent(codigo)}`)
        )}
        noValidate
      >
        <FieldGroup>
          <FormInputControl
            id="codigo"
            label="Código de reserva"
            icon={RiHashtag}
            error={form.formState.errors.codigo}
            description="Te lo mostramos al enviar la reserva y por email si dejaste uno."
            placeholder="R-XXXXXXXX"
            autoCapitalize="characters"
            autoComplete="off"
            autoFocus
            {...form.register("codigo")}
          />
          <Button type="submit">Consultar estado</Button>
        </FieldGroup>
      </form>
    </main>
  )
}
