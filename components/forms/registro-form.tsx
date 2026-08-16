"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { GoogleButton } from "@/components/forms/google-button"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { registroSchema, type RegistroInput } from "@/lib/validations/auth"

export function RegistroForm({ googleHabilitado }: { googleHabilitado: boolean }) {
  const router = useRouter()
  const form = useForm<RegistroInput>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      telefono: "",
      website: "",
    },
  })
  const errores = form.formState.errors

  const onSubmit = form.handleSubmit(async (values) => {
    // Honeypot: si el campo oculto viene relleno, no se envía nada.
    if (values.website) return

    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      telefono: values.telefono || undefined,
    })
    if (error) {
      toast.error(error.message ?? "No se pudo crear la cuenta.")
      return
    }
    toast.success("Cuenta creada. ¡Bienvenido!")
    router.push("/cliente")
    router.refresh()
  })

  return (
    <div className="flex flex-col gap-6">
      {googleHabilitado && (
        <>
          <GoogleButton texto="Registrarme con Google" />
          <FieldSeparator>o con tu email</FieldSeparator>
        </>
      )}
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
            {...form.register("website")}
          />
          <Field data-invalid={Boolean(errores.name)}>
            <FieldLabel htmlFor="reg-name">Nombre</FieldLabel>
            <Input id="reg-name" autoComplete="name" {...form.register("name")} />
            <FieldError errors={[errores.name]} />
          </Field>
          <Field data-invalid={Boolean(errores.email)}>
            <FieldLabel htmlFor="reg-email">Email</FieldLabel>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
            <FieldError errors={[errores.email]} />
          </Field>
          <Field data-invalid={Boolean(errores.telefono)}>
            <FieldLabel htmlFor="reg-telefono">Teléfono (opcional)</FieldLabel>
            <Input
              id="reg-telefono"
              type="tel"
              autoComplete="tel"
              {...form.register("telefono")}
            />
            <FieldError errors={[errores.telefono]} />
          </Field>
          <Field data-invalid={Boolean(errores.password)}>
            <FieldLabel htmlFor="reg-password">Contraseña</FieldLabel>
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
            <FieldDescription>
              Mínimo 8 caracteres, con letras y al menos un número.
            </FieldDescription>
            <FieldError errors={[errores.password]} />
          </Field>
          <Field data-invalid={Boolean(errores.confirmPassword)}>
            <FieldLabel htmlFor="reg-confirm">Repite la contraseña</FieldLabel>
            <Input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              {...form.register("confirmPassword")}
            />
            <FieldError errors={[errores.confirmPassword]} />
          </Field>
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </FieldGroup>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
