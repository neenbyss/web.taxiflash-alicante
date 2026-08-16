"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// Buscador de reserva por código para invitados sin cuenta.
export default function ConsultarReservaPage() {
  const router = useRouter()
  const [codigo, setCodigo] = useState("")

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 font-heading text-2xl font-semibold">
        Consultar reserva
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (codigo.trim()) router.push(`/reserva/${codigo.trim().toUpperCase()}`)
        }}
        className="flex flex-col gap-4"
      >
        <Field>
          <FieldLabel htmlFor="codigo">Código de reserva</FieldLabel>
          <Input
            id="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="R-XXXXXXXX"
            autoFocus
          />
          <FieldDescription>
            Te lo mostramos al enviar la reserva (y por email si dejaste uno).
          </FieldDescription>
        </Field>
        <Button type="submit" disabled={!codigo.trim()}>
          Consultar estado
        </Button>
      </form>
    </main>
  )
}
