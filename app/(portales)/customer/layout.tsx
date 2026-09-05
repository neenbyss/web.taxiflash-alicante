import type { Metadata } from "next"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import type { Role } from "@/lib/generated/prisma/enums"
import { requireRole } from "@/server/session"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole("CLIENTE")
  return (
    <DashboardShell
      portalId="customer"
      role={session.user.role as Role}
      user={{ name: session.user.name, email: session.user.email }}
    >
      {children}
    </DashboardShell>
  )
}
