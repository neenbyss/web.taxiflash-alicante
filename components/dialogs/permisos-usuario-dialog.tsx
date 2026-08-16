"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"

type PermisosUsuarioDialogProps = {
  userId: string
  nombre: string
}

type EstadoOverride = "heredado" | "concedido" | "revocado"

const ITEMS_OVERRIDE = [
  { value: "heredado", label: "Heredado del rol" },
  { value: "concedido", label: "Concedido" },
  { value: "revocado", label: "Revocado" },
]

/**
 * Overrides de permisos por usuario: cada permiso puede heredarse del rol,
 * concederse como extra o revocarse individualmente.
 */
export function PermisosUsuarioDialog({ userId, nombre }: PermisosUsuarioDialogProps) {
  const [abierto, setAbierto] = useState(false)
  const utils = trpc.useUtils()

  const catalogo = trpc.permisos.catalogo.useQuery(undefined, { enabled: abierto })
  const overrides = trpc.permisos.overridesDeUsuario.useQuery(
    { userId },
    { enabled: abierto }
  )
  const setPermiso = trpc.permisos.setUserPermiso.useMutation({
    onSuccess: () => {
      void utils.permisos.overridesDeUsuario.invalidate({ userId })
      void utils.permisos.mios.invalidate()
    },
    onError: (error) => toast.error(error.message),
  })

  const estadoDe = (permisoId: string): EstadoOverride => {
    const override = overrides.data?.overrides.find((o) => o.permisoId === permisoId)
    if (!override) return "heredado"
    return override.concedido ? "concedido" : "revocado"
  }

  const cambiar = (permisoId: string, estado: EstadoOverride) => {
    setPermiso.mutate({
      userId,
      permisoId,
      concedido:
        estado === "heredado" ? null : estado === "concedido" ? true : false,
    })
  }

  const cargando = catalogo.isLoading || overrides.isLoading

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Permisos
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Permisos de {nombre}</DialogTitle>
          <DialogDescription>
            “Heredado” usa lo definido para su rol; “concedido/revocado” lo
            sobreescribe solo para esta cuenta.
          </DialogDescription>
        </DialogHeader>
        {cargando ? (
          <Skeleton className="h-64" />
        ) : (
          <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
            {catalogo.data?.map((permiso) => {
              const efectivo = overrides.data?.efectivos.includes(permiso.codigo)
              return (
                <div
                  key={permiso.id}
                  className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {permiso.nombre}
                      <Badge
                        variant="secondary"
                        className={
                          efectivo
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400"
                        }
                      >
                        {efectivo ? "Activo" : "Inactivo"}
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {permiso.descripcion}
                    </p>
                  </div>
                  <Select
                    value={estadoDe(permiso.id)}
                    onValueChange={(valor) =>
                      valor && cambiar(permiso.id, valor as EstadoOverride)
                    }
                    items={ITEMS_OVERRIDE}
                  >
                    <SelectTrigger size="sm" className="w-40 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEMS_OVERRIDE.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
