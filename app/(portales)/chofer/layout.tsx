import { DashboardShell } from "@/components/layout/dashboard-shell"
import type { Role } from "@/lib/generated/prisma/enums"
import { requireRole } from "@/server/session"

export default async function ChoferLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole("CHOFER")
  return (
    <DashboardShell
      portalId="chofer"
      rol={session.user.role as Role}
      usuario={{ name: session.user.name, email: session.user.email }}
    >
      {children}
    </DashboardShell>
  )
}
