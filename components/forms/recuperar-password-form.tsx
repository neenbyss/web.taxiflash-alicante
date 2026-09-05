"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import Link from "next/link"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { FormInputControl } from "@/components/forms/form-control"
import { RiLockFill, RiMailLine } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { emailAuthClient } from "@/lib/auth-email-client"
import {
  recuperarEmailSchema,
  recuperarPasswordSchema,
  type RecuperarEmailInput,
  type RecuperarPasswordInput,
} from "@/lib/validations/auth"

export function RecuperarPasswordForm() {
  const [step, setStep] = useState<"email" | "reset" | "done">("email")
  const [email, setEmail] = useState("")
  const emailForm = useForm<RecuperarEmailInput>({
    resolver: zodResolver(recuperarEmailSchema),
    defaultValues: { email: "" },
  })
  const passwordForm = useForm<RecuperarPasswordInput>({
    resolver: zodResolver(recuperarPasswordSchema),
    defaultValues: { otp: "", password: "" },
  })

  const requestCode = emailForm.handleSubmit(async (values) => {
    const normalized = values.email.trim().toLowerCase()
    const { error } = await emailAuthClient.emailOtp.requestPasswordReset({
      email: normalized,
    })
    if (error) {
      toast.error("No pudimos procesar la solicitud. Inténtalo de nuevo.")
      return
    }
    setEmail(normalized)
    setStep("reset")
    toast.success("Si existe una cuenta, recibirás un código en unos minutos.")
  })

  const resetPassword = passwordForm.handleSubmit(async ({ otp, password }) => {
    const { error } = await emailAuthClient.emailOtp.resetPassword({
      email,
      otp,
      password,
    })
    if (error) {
      passwordForm.setValue("otp", "")
      passwordForm.setError("otp", {
        message: "El código no es válido o ha caducado.",
      })
      return
    }
    setStep("done")
  })

  if (step === "done") {
    return (
      <div className="space-y-5 text-center">
        <p className="text-base leading-relaxed text-muted-foreground">
          Tu contraseña se actualizó y ya puedes volver a entrar.
        </p>
        <Button render={<Link href="/login" />} className="w-full">
          Volver a iniciar sesión
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {step === "email" ? (
        <form onSubmit={requestCode} noValidate>
          <FieldGroup>
            <FormInputControl
              label="Correo de tu cuenta"
              icon={RiMailLine}
              error={emailForm.formState.errors.email}
              description="La respuesta será igual exista o no una cuenta, para proteger tu privacidad."
              id="recovery-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              {...emailForm.register("email")}
            />
            <Button
              type="submit"
              size="lg"
              disabled={emailForm.formState.isSubmitting}
            >
              {emailForm.formState.isSubmitting
                ? "Enviando…"
                : "Recibir código"}
            </Button>
          </FieldGroup>
        </form>
      ) : (
        <form onSubmit={resetPassword} noValidate>
          <FieldGroup>
            <Controller
              control={passwordForm.control}
              name="otp"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="recovery-code">
                    Código de recuperación
                  </FieldLabel>
                  <InputOTP
                    id="recovery-code"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={field.value}
                    onChange={field.onChange}
                    autoFocus
                    containerClassName="justify-center"
                    aria-label="Código de recuperación de 6 dígitos"
                    aria-invalid={fieldState.invalid}
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
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <FormInputControl
              label="Nueva contraseña"
              icon={RiLockFill}
              error={passwordForm.formState.errors.password}
              description="Mínimo 8 caracteres, con letras y al menos un número."
              id="recovery-password"
              type="password"
              revealPassword
              autoComplete="new-password"
              {...passwordForm.register("password")}
            />
            <Button
              type="submit"
              size="lg"
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting
                ? "Actualizando…"
                : "Guardar contraseña"}
            </Button>
          </FieldGroup>
        </form>
      )}
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Volver al acceso
        </Link>
      </p>
    </div>
  )
}
