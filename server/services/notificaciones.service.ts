import { db } from "@/server/db"
import { emailHabilitado, enviarEmail } from "@/server/services/email.service"

type NotificacionInput = {
  userId: string
  tipo: string
  titulo: string
  cuerpo: string
  url?: string
}

/** Crea una notificación in-app. */
export async function notificar(input: NotificacionInput): Promise<void> {
  await db.notificacion.create({
    data: { ...input, canal: "IN_APP" },
  })
}

/**
 * Notificación in-app + correo. El email es fire-and-forget; si el usuario no
 * tiene dirección (o es un invitado sin cuenta) se pasa `emailDestino`.
 * Si no hay SMTP configurado, solo queda la notificación in-app.
 */
export async function notificarConEmail(
  input: NotificacionInput & { emailDestino?: string | null }
): Promise<void> {
  const { emailDestino, ...notif } = input
  await notificar(notif)

  if (!emailHabilitado()) return

  const destino =
    emailDestino ??
    (
      await db.user.findUnique({
        where: { id: input.userId },
        select: { email: true },
      })
    )?.email

  if (!destino) return

  await db.notificacion.create({
    data: { ...notif, canal: "EMAIL", leida: true },
  })
  void enviarEmail({
    to: destino,
    subject: `TaxiFlash — ${input.titulo}`,
    titulo: input.titulo,
    lineas: [input.cuerpo],
    urlAccion: input.url ? { texto: "Ver detalle", href: input.url } : undefined,
  })
}

/** Email a un invitado sin cuenta (no hay notificación in-app que crear). */
export function emailAInvitado(opts: {
  email: string
  titulo: string
  cuerpo: string
  url?: string
}): void {
  void enviarEmail({
    to: opts.email,
    subject: `TaxiFlash — ${opts.titulo}`,
    titulo: opts.titulo,
    lineas: [opts.cuerpo],
    urlAccion: opts.url ? { texto: "Ver estado", href: opts.url } : undefined,
  })
}

/** Notifica in-app a todos los usuarios activos de un rol. */
export async function notificarPorRol(
  role: "ADMIN" | "CHOFER",
  notif: Omit<NotificacionInput, "userId">
): Promise<void> {
  const usuarios = await db.user.findMany({
    where: { role, activo: true },
    select: { id: true },
  })
  if (!usuarios.length) return
  await db.notificacion.createMany({
    data: usuarios.map((u) => ({ ...notif, userId: u.id, canal: "IN_APP" as const })),
  })
}
