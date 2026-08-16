"use client"

import type { PermisoCodigo } from "@/lib/permisos"
import { trpc } from "@/lib/trpc"

/** Permisos efectivos del usuario autenticado, para condicionar la UI. */
export function usePermisos() {
  const query = trpc.permisos.mios.useQuery(undefined, {
    staleTime: 60_000,
  })
  const permisos = new Set(query.data ?? [])
  return {
    cargando: query.isLoading,
    permisos,
    tiene: (permiso: PermisoCodigo) => permisos.has(permiso),
  }
}
