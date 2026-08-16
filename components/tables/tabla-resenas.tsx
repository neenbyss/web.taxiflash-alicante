"use client"

import { toast } from "sonner"

import { ResenaCard } from "@/components/cards/resena-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"

/** Moderación de reseñas: ver todas y ocultar/mostrar las inapropiadas. */
export function TablaResenas() {
  const utils = trpc.useUtils()
  const resenas = trpc.resenas.listarAdmin.useInfiniteQuery(
    { incluirOcultas: true, limite: 20 },
    { getNextPageParam: (ultima) => ultima.nextCursor }
  )
  const setOculta = trpc.resenas.setOculta.useMutation({
    onSuccess: (data) => {
      toast.success(data.oculta ? "Reseña ocultada." : "Reseña visible de nuevo.")
      void utils.resenas.listarAdmin.invalidate()
    },
    onError: (error) => toast.error(error.message),
  })

  if (resenas.isLoading) return <Skeleton className="h-64 rounded-2xl" />

  const filas = resenas.data?.pages.flatMap((pagina) => pagina.resenas) ?? []

  if (!filas.length) {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
        Todavía no hay reseñas.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {filas.map((resena) => (
        <div key={resena.id} className="flex flex-col gap-2">
          <ResenaCard
            resena={resena}
            autor={`${resena.cliente.name} → ${resena.chofer?.name ?? "sin chofer"} · viaje ${resena.reserva.codigo}`}
          />
          <div className="flex items-center gap-2 pl-1">
            {resena.oculta && (
              <Badge
                variant="secondary"
                className="bg-red-500/15 text-red-700 dark:text-red-400"
              >
                Oculta
              </Badge>
            )}
            <Button
              variant="outline"
              size="xs"
              disabled={setOculta.isPending}
              onClick={() =>
                setOculta.mutate({ resenaId: resena.id, oculta: !resena.oculta })
              }
            >
              {resena.oculta ? "Mostrar" : "Ocultar"}
            </Button>
          </div>
        </div>
      ))}
      {resenas.hasNextPage && (
        <Button
          variant="outline"
          className="self-center"
          disabled={resenas.isFetchingNextPage}
          onClick={() => void resenas.fetchNextPage()}
        >
          {resenas.isFetchingNextPage ? "Cargando…" : "Cargar más"}
        </Button>
      )}
    </div>
  )
}
