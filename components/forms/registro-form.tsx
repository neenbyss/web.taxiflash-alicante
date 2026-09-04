"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { GoogleButton } from "@/components/forms/google-button"
import {
  RiArrowLeftSLine,
  RiMailLine,
  RiShieldCheckLine,
} from "@/components/icons"
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  registroCodigoSchema,
  registroEmailSchema,
} from "@/lib/validations/auth"

type Step = "email" | "code"

async function requestRegistration(
  url: string,
  method: "POST" | "PUT",
  body: object
) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = (await response.json().catch(() => ({}))) as {
    message?: string
    existing?: boolean
  }
  if (!response.ok)
    throw new Error(data.message ?? "No se pudo completar la solicitud.")
  return data
}

export function RegistroForm({
  googleHabilitado,
}: {
  googleHabilitado: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(registroEmailSchema),
    defaultValues: { email: "" },
  })
  const invalidLink = searchParams.get("error") === "enlace-invalido"

  const sendCode = emailForm.handleSubmit(async ({ email: rawEmail }) => {
    setLoading(true)
    try {
      const normalized = rawEmail.trim().toLowerCase()
      const data = await requestRegistration(
        "/api/onboarding/register",
        "POST",
        { email: normalized }
      )
      setEmail(normalized)
      setStep("code")
      toast.success(data.message ?? "Revisa tu correo.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No pudimos enviar el código."
      )
    } finally {
      setLoading(false)
    }
  })

  const verifyCode = async (submittedCode = code) => {
    const parsed = registroCodigoSchema.safeParse({ code: submittedCode })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Código incompleto.")
      return
    }
    setLoading(true)
    try {
      const data = await requestRegistration(
        "/api/onboarding/register",
        "PUT",
        { email, code: submittedCode }
      )
      if (data.existing) {
        router.replace("/login?notice=cuenta-existente")
        return
      }
      router.replace("/complete-profile")
    } catch (error) {
      setCode("")
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos verificar el código."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {invalidLink && (
        <div
          role="alert"
          className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Ese enlace ya caducó o fue utilizado. Solicita uno nuevo.
        </div>
      )}

      {step === "email" ? (
        <>
          {googleHabilitado && (
            <>
              <GoogleButton texto="Continuar con Google" />
              <FieldSeparator>o verifica tu correo</FieldSeparator>
            </>
          )}
          <form onSubmit={sendCode} noValidate>
            <FieldGroup>
              <Field data-invalid={Boolean(emailForm.formState.errors.email)}>
                <FieldLabel htmlFor="register-email">
                  Correo electrónico
                </FieldLabel>
                <div className="relative">
                  <RiMailLine
                    className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="register-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="tu@correo.com"
                    className="h-13 pl-12 text-base"
                    {...emailForm.register("email")}
                  />
                </div>
                <FieldDescription>
                  No crearemos ninguna cuenta hasta que confirmes que el correo
                  es tuyo.
                </FieldDescription>
                <FieldError errors={[emailForm.formState.errors.email]} />
              </Field>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? "Enviando…" : "Recibir código seguro"}
              </Button>
            </FieldGroup>
          </form>
        </>
      ) : (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => {
              setStep("email")
              setCode("")
            }}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <RiArrowLeftSLine className="size-4" aria-hidden /> Cambiar correo
          </button>
          <div className="flex gap-3 rounded-2xl bg-primary/12 p-4">
            <RiShieldCheckLine
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <p className="min-w-0 text-sm leading-relaxed">
              Enviamos un código y un enlace de un solo uso a{" "}
              <strong className="break-all">{email}</strong>.
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="register-code">Código de 6 dígitos</FieldLabel>
            <InputOTP
              id="register-code"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={code}
              onChange={setCode}
              onComplete={(value) => void verifyCode(value)}
              disabled={loading}
              autoFocus
              containerClassName="justify-center"
              aria-label="Código de verificación de 6 dígitos"
            >
              <InputOTPGroup className="gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="size-11 rounded-xl border-0 bg-muted text-lg shadow-inner first:rounded-xl last:rounded-xl"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </Field>
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => void verifyCode()}
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verificando…" : "Verificar y continuar"}
          </Button>
          <button
            type="button"
            className="w-full text-center text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
            disabled={loading}
            onClick={() => void sendCode()}
          >
            Enviar un código nuevo
          </button>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
