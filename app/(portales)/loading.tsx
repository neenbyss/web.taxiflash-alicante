import { Skeleton } from "@/components/ui/skeleton"

// Estado de carga compartido por los tres portales mientras el segmento
// resuelve en el servidor (convención loading.tsx de Next.js).
export default function PortalLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-40 w-full rounded-4xl" />
      <Skeleton className="h-40 w-full rounded-4xl" />
    </div>
  )
}
