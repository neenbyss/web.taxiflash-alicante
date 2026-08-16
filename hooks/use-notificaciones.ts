"use client"

import { trpc } from "@/lib/trpc"

/**
 * Centro de notificaciones in-app: listado con polling ligero y acciones de
 * lectura. El polling sustituye a websockets en este prototipo.
 */
export function useNotificaciones() {
  const utils = trpc.useUtils()

  const notificaciones = trpc.notificaciones.listar.useQuery(undefined, {
    refetchInterval: 20_000,
  })
  const noLeidas = trpc.notificaciones.contarNoLeidas.useQuery(undefined, {
    refetchInterval: 20_000,
  })

  const invalidar = () => {
    void utils.notificaciones.listar.invalidate()
    void utils.notificaciones.contarNoLeidas.invalidate()
  }

  const marcarLeida = trpc.notificaciones.marcarLeida.useMutation({
    onSuccess: invalidar,
  })
  const marcarTodasLeidas = trpc.notificaciones.marcarTodasLeidas.useMutation({
    onSuccess: invalidar,
  })

  return {
    notificaciones: notificaciones.data ?? [],
    cargando: notificaciones.isLoading,
    noLeidas: noLeidas.data ?? 0,
    marcarLeida: (id: string) => marcarLeida.mutate({ notificacionId: id }),
    marcarTodasLeidas: () => marcarTodasLeidas.mutate(),
  }
}
