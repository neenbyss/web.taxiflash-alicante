import { StarRating } from "@/components/shared/star-rating"
import { formatearFecha } from "@/lib/formato"

type ResenaCardProps = {
  resena: {
    puntuacion: number
    titulo: string
    descripcion: string
    createdAt: Date
  }
  autor?: string
}

/** Vista de una reseña (historial del cliente, perfil del chofer, admin). */
export function ResenaCard({ resena, autor }: ResenaCardProps) {
  return (
    <div className="rounded-2xl border px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StarRating valor={resena.puntuacion} tamano="sm" />
        <span className="text-xs text-muted-foreground">
          {autor && `${autor} · `}
          {formatearFecha(resena.createdAt)}
        </span>
      </div>
      <p className="mt-1.5 text-sm font-medium">{resena.titulo}</p>
      <p className="mt-0.5 text-sm whitespace-pre-wrap text-muted-foreground">
        {resena.descripcion}
      </p>
    </div>
  )
}
