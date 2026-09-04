"use client"

import { REGEXP_ONLY_DIGITS } from "input-otp"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { emailAuthClient } from "@/lib/auth-email-client"

export function RecuperarPasswordForm() {
  const [step, setStep] = useState<"email" | "reset" | "done">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const requestCode = async () => {
    if (!email.includes("@")) return toast.error("Introduce un correo válido.")
    setLoading(true)
    const { error } = await emailAuthClient.emailOtp.requestPasswordReset({
      email: email.trim().toLowerCase(),
    })
    setLoading(false)
    if (error)
      return toast.error(
        "No pudimos procesar la solicitud. Inténtalo de nuevo."
      )
    setStep("reset")
    toast.success("Si existe una cuenta, recibirás un código en unos minutos.")
  }

  const resetPassword = async () => {
    if (otp.length !== 6) return toast.error("Introduce los 6 dígitos.")
    if (
      password.length < 8 ||
      !/[a-zA-Z]/.test(password) ||
      !/\d/.test(password)
    ) {
      return toast.error(
        "La contraseña debe tener 8 caracteres, letras y al menos un número."
      )
    }
    setLoading(true)
    const { error } = await emailAuthClient.emailOtp.resetPassword({
      email: email.trim().toLowerCase(),
      otp,
      password,
    })
    setLoading(false)
    if (error) {
      setOtp("")
      return toast.error("El código no es válido o ha caducado.")
    }
    setStep("done")
  }

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
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void requestCode()
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="recovery-email">
                Correo de tu cuenta
              </FieldLabel>
              <Input
                id="recovery-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="text-base"
              />
              <FieldDescription>
                La respuesta será igual exista o no una cuenta, para proteger tu
                privacidad.
              </FieldDescription>
            </Field>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Enviando…" : "Recibir código"}
            </Button>
          </FieldGroup>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void resetPassword()
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="recovery-code">
                Código de recuperación
              </FieldLabel>
              <InputOTP
                id="recovery-code"
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={otp}
                onChange={setOtp}
                autoFocus
                containerClassName="justify-center"
                aria-label="Código de recuperación de 6 dígitos"
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
            <Field>
              <FieldLabel htmlFor="recovery-password">
                Nueva contraseña
              </FieldLabel>
              <Input
                id="recovery-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="text-base"
              />
              <FieldDescription>
                Mínimo 8 caracteres, con letras y al menos un número.
              </FieldDescription>
            </Field>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Actualizando…" : "Guardar contraseña"}
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
