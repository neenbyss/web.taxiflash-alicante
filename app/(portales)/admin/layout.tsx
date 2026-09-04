import { DashboardShell } from "@/components/layout/dashboard-shell"
import type { Role } from "@/lib/generated/prisma/enums"
import { requireRole } from "@/server/session"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole("ADMIN")
  return (
    <DashboardShell
      portalId="admin"
      role={session.user.role as Role}
      user={{ name: session.user.name, email: session.user.email }}
    >
      {children}
    </DashboardShell>
  )
}
