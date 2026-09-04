"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { trpc } from "@/lib/trpc"
import { perfilSchema, type PerfilInput } from "@/lib/validations/auth"

/** Edición del perfil propio (clientes y choferes). */
export function PerfilForm({ esCliente }: { esCliente: boolean }) {
  const utils = trpc.useUtils()
  const perfil = trpc.usuarios.miPerfil.useQuery()

  const form = useForm<PerfilInput>({
    resolver: zodResolver(perfilSchema),
    values: perfil.data
      ? {
          name: perfil.data.name,
          telefono: perfil.data.telefono ?? "",
          direccionFrecuente: perfil.data.direccionFrecuente ?? "",
          vehiculoPreferido: perfil.data.vehiculoPreferido ?? "",
          notasPreferencias: perfil.data.notasPreferencias ?? "",
        }
      : undefined,
  })
  const errores = form.formState.errors

  const actualizar = trpc.usuarios.actualizarPerfil.useMutation({
    onSuccess: () => {
      toast.success("Perfil actualizado.")
      void utils.usuarios.miPerfil.invalidate()
    },
    onError: (error) => toast.error(error.message),
  })

  if (perfil.isLoading) return <Skeleton className="h-96 rounded-4xl" />

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Mi perfil</CardTitle>
        <CardDescription>{perfil.data?.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((values) => actualizar.mutate(values))}
          noValidate
        >
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field data-invalid={Boolean(errores.name)}>
              <FieldLabel htmlFor="perfil-name">Nombre</FieldLabel>
              <Input id="perfil-name" {...form.register("name")} />
              <FieldError errors={[errores.name]} />
            </Field>
            <Field data-invalid={Boolean(errores.telefono)}>
              <FieldLabel htmlFor="perfil-telefono">Teléfono</FieldLabel>
              <Input id="perfil-telefono" type="tel" {...form.register("telefono")} />
              <FieldError errors={[errores.telefono]} />
            </Field>
            {esCliente && (
              <>
                <Field data-invalid={Boolean(errores.direccionFrecuente)} className="sm:col-span-2">
                  <FieldLabel htmlFor="perfil-direccion">
                    Dirección frecuente
                  </FieldLabel>
                  <Input
                    id="perfil-direccion"
                    placeholder="Ej.: Calle Mayor 1, Madrid"
                    {...form.register("direccionFrecuente")}
                  />
                  <FieldError errors={[errores.direccionFrecuente]} />
                </Field>
                <Field data-invalid={Boolean(errores.vehiculoPreferido)}>
                  <FieldLabel htmlFor="perfil-vehiculo">
                    Tipo de vehículo preferido
                  </FieldLabel>
                  <Input
                    id="perfil-vehiculo"
                    placeholder="Ej.: monovolumen, adaptado, estándar…"
                    {...form.register("vehiculoPreferido")}
                  />
                  <FieldError errors={[errores.vehiculoPreferido]} />
                </Field>
                <Field data-invalid={Boolean(errores.notasPreferencias)} className="sm:col-span-2">
                  <FieldLabel htmlFor="perfil-notas">
                    Preferencias habituales
                  </FieldLabel>
                  <Textarea
                    id="perfil-notas"
                    rows={3}
                    placeholder="Ej.: viajo con silla infantil, prefiero pago con tarjeta…"
                    {...form.register("notasPreferencias")}
                  />
                  <FieldDescription>
                    Estas notas acompañan tus reservas para personalizar el servicio.
                  </FieldDescription>
                  <FieldError errors={[errores.notasPreferencias]} />
                </Field>
              </>
            )}
            <Button type="submit" disabled={actualizar.isPending} className="h-11 sm:col-span-2 sm:ml-auto sm:min-w-44">
              {actualizar.isPending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
