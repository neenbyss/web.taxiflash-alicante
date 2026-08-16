"use client"

import { toast } from "sonner"

import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ROL_LABEL } from "@/lib/formato"
import { trpc } from "@/lib/trpc"

const ROLES = ["ADMIN", "CHOFER", "CLIENTE"] as const

/**
 * Matriz rol × permiso. Marcar/desmarcar guarda al momento; los usuarios
 * pueden tener además overrides individuales desde la tabla de usuarios.
 */
export function MatrizRolPermisos() {
  const utils = trpc.useUtils()
  const catalogo = trpc.permisos.catalogo.useQuery()
  const porRol = trpc.permisos.porRol.useQuery()

  const setRolPermisos = trpc.permisos.setRolPermisos.useMutation({
    onSuccess: () => {
      void utils.permisos.porRol.invalidate()
      void utils.permisos.mios.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
      void utils.permisos.porRol.invalidate()
    },
  })

  if (catalogo.isLoading || porRol.isLoading) {
    return <Skeleton className="h-72 rounded-2xl" />
  }
  if (!catalogo.data || !porRol.data) return null

  const permisosDeRol = (rol: string) => porRol.data[rol] ?? []

  const alternar = (rol: (typeof ROLES)[number], permisoId: string) => {
    const actuales = permisosDeRol(rol)
    const nuevos = actuales.includes(permisoId)
      ? actuales.filter((id) => id !== permisoId)
      : [...actuales, permisoId]
    setRolPermisos.mutate({ role: rol, permisoIds: nuevos })
  }

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Permiso</TableHead>
            {ROLES.map((rol) => (
              <TableHead key={rol} className="text-center">
                {ROL_LABEL[rol]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {catalogo.data.map((permiso) => (
            <TableRow key={permiso.id}>
              <TableCell>
                <p className="font-medium">{permiso.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {permiso.descripcion}
                </p>
              </TableCell>
              {ROLES.map((rol) => (
                <TableCell key={rol} className="text-center">
                  <Checkbox
                    aria-label={`${permiso.nombre} para ${ROL_LABEL[rol]}`}
                    checked={permisosDeRol(rol).includes(permiso.id)}
                    disabled={setRolPermisos.isPending}
                    onCheckedChange={() => alternar(rol, permiso.id)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
