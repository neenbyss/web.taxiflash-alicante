"use client"

import { RiCheckDoubleLine } from "@remixicon/react"
import { useState } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/layout/page-header"
import { ListaNotificaciones } from "@/components/shared/lista-notificaciones"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/lib/trpc"

/** Página completa de notificaciones con filtros. */
export function NotificacionesView() {
  const utils = trpc.useUtils()
  const [filtro, setFiltro] = useState<"todas" | "sin_leer">("todas")

  const query = trpc.notificaciones.listar.useQuery(
    { limite: 50 },
    { refetchInterval: 30_000 }
  )
  const noLeidas = trpc.notificaciones.contarNoLeidas.useQuery()

  const invalidar = () => {
    void utils.notificaciones.listar.invalidate()
    void utils.notificaciones.contarNoLeidas.invalidate()
  }
  const marcarLeida = trpc.notificaciones.marcarLeida.useMutation({
    onSuccess: invalidar,
  })
  const marcarTodas = trpc.notificaciones.marcarTodasLeidas.useMutation({
    onSuccess: () => {
      toast.success("Todas marcadas como leídas.")
      invalidar()
    },
  })

  const notificaciones = query.data ?? []
  const sinLeer = noLeidas.data ?? 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Notificaciones"
        descripcion="Avisos sobre tus reservas, viajes y cuenta."
      >
        {sinLeer > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => marcarTodas.mutate()}
            disabled={marcarTodas.isPending}
          >
            <RiCheckDoubleLine data-icon="inline-start" aria-hidden />
            Marcar todas leídas
          </Button>
        )}
      </PageHeader>

      <Tabs value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="sin_leer">
            Sin leer{sinLeer > 0 ? ` (${sinLeer})` : ""}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="overflow-hidden p-0">
        {query.isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : (
          <ListaNotificaciones
            notificaciones={notificaciones}
            filtro={filtro}
            onLeida={(id) => marcarLeida.mutate({ notificacionId: id })}
          />
        )}
      </Card>
    </div>
  )
}
