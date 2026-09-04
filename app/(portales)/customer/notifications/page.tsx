import { NotificacionesView } from "@/components/views/notificaciones-view"
import { requireRole } from "@/server/session"

export const metadata = { title: "Notificaciones" }

export default async function ClienteNotificacionesPage() {
  await requireRole("CLIENTE")
  return <NotificacionesView />
}
