"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROL_LABEL } from "@/lib/formato"
import { trpc } from "@/lib/trpc"
import {
  crearUsuarioAdminSchema,
  type CrearUsuarioAdminInput,
} from "@/lib/validations/usuario"

const ITEMS_ROL = Object.entries(ROL_LABEL).map(([value, label]) => ({ value, label }))

/** Alta manual de cuentas (cliente, chofer o admin) desde el panel. */
export function UsuarioDialog({ onGuardado }: { onGuardado?: () => void }) {
  const [abierto, setAbierto] = useState(false)

  const form = useForm<CrearUsuarioAdminInput>({
    resolver: zodResolver(crearUsuarioAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "CHOFER",
      telefono: "",
    },
  })
  const errores = form.formState.errors

  const crear = trpc.usuarios.crear.useMutation({
    onSuccess: (usuario) => {
      toast.success(`Cuenta creada para ${usuario.email}.`)
      setAbierto(false)
      form.reset()
      onGuardado?.()
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger render={<Button />}>Nueva cuenta</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear cuenta</DialogTitle>
          <DialogDescription>
            Alta manual de un cliente, chofer o administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((values) => crear.mutate(values))} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errores.name)}>
              <FieldLabel htmlFor="nuevo-name">Nombre *</FieldLabel>
              <Input id="nuevo-name" {...form.register("name")} />
              <FieldError errors={[errores.name]} />
            </Field>
            <Field data-invalid={Boolean(errores.email)}>
              <FieldLabel htmlFor="nuevo-email">Email *</FieldLabel>
              <Input id="nuevo-email" type="email" {...form.register("email")} />
              <FieldError errors={[errores.email]} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errores.role)}>
                <FieldLabel>Rol *</FieldLabel>
                <Controller
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(valor) =>
                        field.onChange(valor as CrearUsuarioAdminInput["role"])
                      }
                      items={ITEMS_ROL}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEMS_ROL.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errores.role]} />
              </Field>
              <Field data-invalid={Boolean(errores.telefono)}>
                <FieldLabel htmlFor="nuevo-telefono">Teléfono</FieldLabel>
                <Input id="nuevo-telefono" type="tel" {...form.register("telefono")} />
                <FieldError errors={[errores.telefono]} />
              </Field>
            </div>
            <Field data-invalid={Boolean(errores.password)}>
              <FieldLabel htmlFor="nuevo-password">Contraseña inicial *</FieldLabel>
              <Input id="nuevo-password" type="password" {...form.register("password")} />
              <FieldError errors={[errores.password]} />
            </Field>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? "Creando…" : "Crear cuenta"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
