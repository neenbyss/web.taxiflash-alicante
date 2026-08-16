"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { GoogleButton } from "@/components/forms/google-button"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { authClient } from "@/lib/auth-client"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group"
import { RiEyeFill, RiEyeOffFill, RiLockFill, RiMailFill } from "@remixicon/react"
import { useState } from "react"

type LoginFormProps = {
  googleHabilitado: boolean
  /** Mostrar Google (solo tiene sentido para clientes). */
  mostrarGoogle?: boolean
  /** Pie: por defecto el enlace de registro (clientes). */
  pie?: React.ReactNode
}

/**
 * Formulario de acceso reutilizable por las tres puertas (cliente, chofer,
 * admin). Tras autenticar, redirige por rol vía /redirigir, así cada cuenta
 * llega a su portal aunque entre por otra puerta.
 */
export function LoginForm({
  googleHabilitado,
  mostrarGoogle = true,
  pie,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })
  const errores = form.formState.errors

  const onSubmit = form.handleSubmit(async (values) => {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    })
    if (error) {
      toast.error(error.message ?? "Credenciales incorrectas.")
      return
    }
    router.push(callbackUrl ?? "/redirigir")
    router.refresh()
  })

  return (
    <div className="flex w-full flex-col gap-6">
      {googleHabilitado && mostrarGoogle && (
        <>
          <GoogleButton texto="Continuar con Google" />
          <FieldSeparator>o con tu email</FieldSeparator>
        </>
      )}
      <form onSubmit={onSubmit} noValidate className="w-full">
        <FieldGroup>
          <Field data-invalid={Boolean(errores.email)}>
            <FieldLabel htmlFor="login-email">Dirección Email</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="Tu dirección E-mail"
                {...form.register("email")}
              />
              <InputGroupAddon>
                <RiMailFill />
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[errores.email]} />
          </Field>

          <Field data-invalid={Boolean(errores.password)}>
            <FieldLabel htmlFor="login-password">Contraseña</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="*********"
                {...form.register("password")}
              />
              <InputGroupAddon>
                <RiLockFill />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupButton onClick={() => setShowPassword(s => !s)} variant="ghost" size="icon-xs">
                  {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[errores.password]} />
          </Field>

          <span className="block text-end text-sm text-muted-foreground -my-2">
            ¿Olvidaste tu contraseña? <Link href="#" className="underline text-primary"> Restablecer contraseña </Link>
          </span>
          <Button

            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Entrando…" : "Iniciar sesión"}
          </Button>
        </FieldGroup>
      </form>
      {pie ?? (
        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="underline underline-offset-4">
            Regístrate
          </Link>
        </p>
      )}
    </div>
  )
}
