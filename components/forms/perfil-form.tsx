"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  FormInputControl,
  FormTextareaControl,
} from "@/components/forms/form-control"
import {
  RiCarLine,
  RiFileTextLine,
  RiMapPin2Line,
  RiPhoneLine,
  RiUser3Line,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
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
            <FormInputControl
              label="Nombre"
              icon={RiUser3Line}
              error={errores.name}
              id="perfil-name"
              autoComplete="name"
              {...form.register("name")}
            />
            <FormInputControl
              label="Teléfono"
              icon={RiPhoneLine}
              error={errores.telefono}
              id="perfil-telefono"
              type="tel"
              autoComplete="tel"
              {...form.register("telefono")}
            />
            {esCliente && (
              <>
                <FormInputControl
                  label="Dirección frecuente"
                  icon={RiMapPin2Line}
                  error={errores.direccionFrecuente}
                  fieldClassName="sm:col-span-2"
                  id="perfil-direccion"
                  placeholder="Ej.: Calle Mayor 1, Madrid"
                  {...form.register("direccionFrecuente")}
                />
                <FormInputControl
                  label="Tipo de vehículo preferido"
                  icon={RiCarLine}
                  error={errores.vehiculoPreferido}
                  id="perfil-vehiculo"
                  placeholder="Ej.: monovolumen, adaptado, estándar…"
                  {...form.register("vehiculoPreferido")}
                />
                <FormTextareaControl
                  label="Preferencias habituales"
                  icon={RiFileTextLine}
                  error={errores.notasPreferencias}
                  fieldClassName="sm:col-span-2"
                  description="Estas notas acompañan tus reservas para personalizar el servicio."
                  id="perfil-notas"
                  rows={3}
                  placeholder="Ej.: viajo con silla infantil, prefiero pago con tarjeta…"
                  {...form.register("notasPreferencias")}
                />
              </>
            )}
            <Button
              type="submit"
              disabled={actualizar.isPending}
              className="h-11 sm:col-span-2 sm:ml-auto sm:min-w-44"
            >
              {actualizar.isPending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
