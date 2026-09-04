import { NotificacionesView } from "@/components/views/notificaciones-view"
import { requireRole } from "@/server/session"

export const metadata = { title: "Notificaciones" }

export default async function AdminNotificacionesPage() {
  await requireRole("ADMIN")
  return <NotificacionesView />
}
