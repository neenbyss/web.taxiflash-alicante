/** Ruta principal del portal de cada rol. */
export const HOME_POR_ROL: Record<string, string> = {
  CLIENTE: "/cliente",
  CHOFER: "/chofer",
  ADMIN: "/admin",
}

export function homeDeRol(role: string | undefined | null): string {
  return (role && HOME_POR_ROL[role]) ?? "/"
}
