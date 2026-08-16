import type { PermisoCodigo } from "@/lib/permisos"
import type { Role } from "@/lib/generated/prisma/enums"
import { db } from "@/server/db"

/**
 * Permisos efectivos de un usuario:
 *   permisos por defecto de su rol (RolPermiso, editable por el admin)
 *   + overrides individuales (UserPermiso.concedido=true añade,
 *     concedido=false revoca).
 */
export async function getPermisosEfectivos(
  userId: string,
  role: Role
): Promise<Set<string>> {
  const [rolPermisos, overrides] = await Promise.all([
    db.rolPermiso.findMany({
      where: { role },
      include: { permiso: { select: { codigo: true } } },
    }),
    db.userPermiso.findMany({
      where: { userId },
      include: { permiso: { select: { codigo: true } } },
    }),
  ])

  const efectivos = new Set(rolPermisos.map((rp) => rp.permiso.codigo))
  for (const override of overrides) {
    if (override.concedido) efectivos.add(override.permiso.codigo)
    else efectivos.delete(override.permiso.codigo)
  }
  return efectivos
}

export async function tienePermiso(
  userId: string,
  role: Role,
  permiso: PermisoCodigo
): Promise<boolean> {
  const permisos = await getPermisosEfectivos(userId, role)
  return permisos.has(permiso)
}
