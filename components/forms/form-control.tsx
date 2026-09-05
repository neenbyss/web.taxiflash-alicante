"use client"

import { useState } from "react"

import {
  RiEyeFill,
  RiEyeOffFill,
  type RemixiconComponentType,
} from "@/components/icons"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

type FormError = { message?: string }

type FormInputControlProps = Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "icon"
> & {
  label: string
  icon: RemixiconComponentType
  error?: FormError
  description?: React.ReactNode
  revealPassword?: boolean
  fieldClassName?: string
  groupClassName?: string
}

export function FormInputControl({
  label,
  icon: Icon,
  error,
  description,
  revealPassword = false,
  fieldClassName,
  groupClassName,
  id,
  type,
  ...props
}: FormInputControlProps) {
  const [visible, setVisible] = useState(false)
  const password = type === "password" && revealPassword

  return (
    <Field data-invalid={Boolean(error)} className={fieldClassName}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup className={groupClassName}>
        <InputGroupAddon>
          <Icon aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          type={password && visible ? "text" : type}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {password && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-sm"
              aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={visible}
              onClick={() => setVisible((current) => !current)}
            >
              {visible ? (
                <RiEyeOffFill aria-hidden />
              ) : (
                <RiEyeFill aria-hidden />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  )
}

type FormTextareaControlProps = Omit<
  React.ComponentProps<typeof InputGroupTextarea>,
  "icon"
> & {
  label: string
  icon: RemixiconComponentType
  error?: FormError
  description?: React.ReactNode
  fieldClassName?: string
  groupClassName?: string
}

export function FormTextareaControl({
  label,
  icon: Icon,
  error,
  description,
  fieldClassName,
  groupClassName,
  id,
  className,
  ...props
}: FormTextareaControlProps) {
  return (
    <Field data-invalid={Boolean(error)} className={fieldClassName}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup className={cn("h-auto items-start", groupClassName)}>
        <InputGroupAddon className="self-start pt-3">
          <Icon aria-hidden />
        </InputGroupAddon>
        <InputGroupTextarea
          id={id}
          aria-invalid={Boolean(error)}
          className={className}
          {...props}
        />
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  )
}
