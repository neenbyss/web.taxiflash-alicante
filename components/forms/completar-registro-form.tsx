"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { registroSchema, type RegistroInput } from "@/lib/validations/auth"

export function CompletarRegistroForm({ email }: { email: string }) {
  const router = useRouter()
  const form = useForm<RegistroInput>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      name: "",
      email,
      password: "",
      confirmPassword: "",
      telefono: "",
      website: "",
    },
  })
  const errors = form.formState.errors

  const submit = form.handleSubmit(async (values) => {
    if (values.website) return
    const { error } = await authClient.signUp.email({
      name: values.name,
      email,
      password: values.password,
      telefono: values.telefono || undefined,
    })
    if (error) {
      toast.error(error.message ?? "No pudimos terminar de crear tu cuenta.")
      return
    }
    toast.success("Tu cuenta ya está lista.")
    router.replace("/redirigir")
    router.refresh()
  })

  return (
    <form onSubmit={submit} noValidate>
      <FieldGroup>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] size-0 opacity-0"
          {...form.register("website")}
        />
        <Field>
          <FieldLabel>Correo verificado</FieldLabel>
          <div className="rounded-xl bg-primary/12 px-4 py-3 text-sm font-medium break-all">
            {email}
          </div>
        </Field>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="complete-name">¿Cómo te llamas?</FieldLabel>
          <Input
            id="complete-name"
            autoComplete="name"
            className="text-base"
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={Boolean(errors.telefono)}>
          <FieldLabel htmlFor="complete-phone">Teléfono (opcional)</FieldLabel>
          <Input
            id="complete-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className="text-base"
            {...form.register("telefono")}
          />
          <FieldError errors={[errors.telefono]} />
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="complete-password">
            Crea una contraseña
          </FieldLabel>
          <Input
            id="complete-password"
            type="password"
            autoComplete="new-password"
            className="text-base"
            {...form.register("password")}
          />
          <FieldDescription>
            Mínimo 8 caracteres, con letras y al menos un número.
          </FieldDescription>
          <FieldError errors={[errors.password]} />
        </Field>
        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="complete-confirm">
            Repite la contraseña
          </FieldLabel>
          <Input
            id="complete-confirm"
            type="password"
            autoComplete="new-password"
            className="text-base"
            {...form.register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Creando tu cuenta…"
            : "Terminar y entrar"}
        </Button>
      </FieldGroup>
    </form>
  )
}
