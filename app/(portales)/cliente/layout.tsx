import { DashboardShell } from "@/components/layout/dashboard-shell"
import type { Role } from "@/lib/generated/prisma/enums"
import { requireRole } from "@/server/session"

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole("CLIENTE")
  return (
    <DashboardShell
      portalId="cliente"
      rol={session.user.role as Role}
      usuario={{ name: session.user.name, email: session.user.email }}
    >
      {children}
    </DashboardShell>
  )
}
