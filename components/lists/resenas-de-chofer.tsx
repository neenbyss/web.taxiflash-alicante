"use client"

import { ResenaCard } from "@/components/cards/resena-card"
import { StarRating } from "@/components/shared/star-rating"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"

/** Reseñas visibles de un chofer (su propio portal o el panel de admin). */
export function ResenasDeChofer({ choferId }: { choferId: string }) {
  const resenas = trpc.resenas.deChofer.useQuery({ choferId })

  if (resenas.isLoading) return <Skeleton className="h-40 rounded-4xl" />
  if (!resenas.data) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-2xl border px-4 py-3">
        <StarRating valor={Math.round(resenas.data.promedio ?? 0)} tamano="sm" />
        <span className="text-sm">
          <strong>{resenas.data.promedio?.toFixed(1) ?? "—"}</strong> de 5 ·{" "}
          {resenas.data.total} reseña{resenas.data.total === 1 ? "" : "s"}
        </span>
      </div>
      {resenas.data.resenas.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Todavía no hay reseñas.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {resenas.data.resenas.map((resena) => (
            <ResenaCard
              key={resena.id}
              resena={resena}
              autor={`${resena.cliente.name} · viaje ${resena.reserva.codigo}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
