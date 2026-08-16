"use client"

import { useState } from "react"
import { toast } from "sonner"

import { PermisosUsuarioDialog } from "@/components/dialogs/permisos-usuario-dialog"
import { UsuarioDialog } from "@/components/dialogs/usuario-dialog"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatearFecha, ROL_LABEL } from "@/lib/formato"
import { trpc } from "@/lib/trpc"

type RolFiltro = "TODOS" | "CLIENTE" | "CHOFER" | "ADMIN"

const ITEMS_ROL_FILTRO = [
  { value: "TODOS", label: "Todos los roles" },
  ...Object.entries(ROL_LABEL).map(([value, label]) => ({ value, label })),
]

/** Gestión de cuentas: alta, activación/desactivación y permisos. */
export function TablaUsuarios() {
  const utils = trpc.useUtils()
  const [rol, setRol] = useState<RolFiltro>("TODOS")
  const [busqueda, setBusqueda] = useState("")

  const usuarios = trpc.usuarios.listar.useInfiniteQuery(
    {
      role: rol === "TODOS" ? undefined : rol,
      busqueda: busqueda.trim() || undefined,
      incluirInactivos: true,
      limite: 20,
    },
    { getNextPageParam: (ultima) => ultima.nextCursor }
  )

  const invalidar = () => void utils.usuarios.listar.invalidate()
  const actualizar = trpc.usuarios.actualizar.useMutation({
    onSuccess: () => {
      toast.success("Usuario actualizado.")
      invalidar()
    },
    onError: (error) => toast.error(error.message),
  })

  const filas = usuarios.data?.pages.flatMap((pagina) => pagina.usuarios) ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o email…"
          className="max-w-xs"
          aria-label="Buscar usuarios"
        />
        <Select
          value={rol}
          onValueChange={(valor) => setRol((valor as RolFiltro) ?? "TODOS")}
          items={ITEMS_ROL_FILTRO}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ITEMS_ROL_FILTRO.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <UsuarioDialog onGuardado={invalidar} />
        </div>
      </div>

      {usuarios.isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Viajes</TableHead>
                <TableHead>Alta</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Sin resultados.
                  </TableCell>
                </TableRow>
              )}
              {filas.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>
                    <p className="font-medium">{usuario.name}</p>
                    <p className="text-xs text-muted-foreground">{usuario.email}</p>
                  </TableCell>
                  <TableCell>{ROL_LABEL[usuario.role] ?? usuario.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        usuario.activo
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-red-500/15 text-red-700 dark:text-red-400"
                      }
                    >
                      {usuario.activo ? "Activa" : "Desactivada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {usuario.role === "CHOFER"
                      ? usuario._count.reservasComoChofer
                      : usuario._count.reservasComoCliente}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatearFecha(usuario.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {usuario.role !== "CLIENTE" && (
                        <PermisosUsuarioDialog
                          userId={usuario.id}
                          nombre={usuario.name}
                        />
                      )}
                      {usuario.activo ? (
                        <ConfirmDialog
                          trigger={
                            <Button variant="destructive" size="sm">
                              Desactivar
                            </Button>
                          }
                          titulo={`Desactivar a ${usuario.name}`}
                          descripcion="La cuenta no podrá iniciar sesión y sus sesiones abiertas se cerrarán. Puedes reactivarla cuando quieras."
                          textoConfirmar="Desactivar"
                          destructivo
                          onConfirmar={() =>
                            actualizar.mutateAsync({
                              userId: usuario.id,
                              activo: false,
                            })
                          }
                        />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actualizar.isPending}
                          onClick={() =>
                            actualizar.mutate({ userId: usuario.id, activo: true })
                          }
                        >
                          Reactivar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {usuarios.hasNextPage && (
        <Button
          variant="outline"
          className="self-center"
          disabled={usuarios.isFetchingNextPage}
          onClick={() => void usuarios.fetchNextPage()}
        >
          {usuarios.isFetchingNextPage ? "Cargando…" : "Cargar más"}
        </Button>
      )}
    </div>
  )
}
