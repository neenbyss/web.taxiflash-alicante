"use client"

import { RiArrowRightLine, RiNotification3Line } from "@remixicon/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { ListaNotificaciones } from "@/components/shared/lista-notificaciones"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotificaciones } from "@/hooks/use-notificaciones"
import { Label } from "../ui/label"

/** Centro de notificaciones in-app (campana con contador y listado). */
export function NotificationBell() {
  const { notificaciones, noLeidas, marcarLeida, marcarTodasLeidas } =
    useNotificaciones()
  const pathname = usePathname()
  const [filtro, setFiltro] = useState<"todas" | "sin_leer">("todas")

  // Base del portal actual (/cliente, /chofer, /admin) para "Ver todas".
  const portalBase = `/${pathname.split("/")[1] || "cliente"}`

  // Avisa con un toast cuando llega una notificación nueva (tras el montaje).
  const ultimaVistaId = useRef<string | null>(null)
  const iniciado = useRef(false)
  useEffect(() => {
    const top = notificaciones[0]
    if (!top) return
    if (!iniciado.current) {
      iniciado.current = true
      ultimaVistaId.current = top.id
      return
    }
    if (top.id !== ultimaVistaId.current) {
      ultimaVistaId.current = top.id
      if (!top.leida) toast.info(top.titulo, { description: top.cuerpo })
    }
  }, [notificaciones])

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              noLeidas > 0
                ? `Notificaciones, ${noLeidas} sin leer`
                : "Notificaciones"
            }
            className="relative"
          />
        }
      >
        <RiNotification3Line aria-hidden />
        {noLeidas > 0 && (
          <Badge
            aria-hidden
            className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-[10px]"
          >
            {noLeidas > 99 ? "99+" : noLeidas}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 gap-0">

        <div className="px-4 pt-2">
          <Label className="flex items-center gap-2 font-medium pb-4 pt-2">
            <RiNotification3Line className="size-4" aria-hidden />
            Notificaciones
          </Label>
          <Tabs
            value={filtro}
            onValueChange={(v) => setFiltro(v as typeof filtro)}
          >
            <TabsList variant="line" className="bg-transparent p-0">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="sin_leer">
                Sin leer{noLeidas > 0 ? ` (${noLeidas})` : ""}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex justify-between items-center gap-4 pt-5 pb-1">
            {noLeidas > 0 ? 
              <button
                type="button"
                onClick={marcarTodasLeidas}
                className="text-sm text-primary hover:underline"
              >
                Marcar todos como leidos
              </button>
              :
              <span className="text-sm opacity-40">
                Marcar todos como leidos
              </span>
            }
            <Button
              variant="link"
              className="text-foreground hover:text-primary h-2"
              render={<Link href={`${portalBase}/notificaciones`} />}
            >
              Ver todas
              <RiArrowRightLine className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-96">
          <ListaNotificaciones
            notificaciones={notificaciones}
            filtro={filtro}
            onLeida={marcarLeida}
          />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
