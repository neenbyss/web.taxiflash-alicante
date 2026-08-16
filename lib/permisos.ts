// Catálogo de permisos de la aplicación.
// La asignación por rol/usuario vive en la base de datos (RolPermiso / UserPermiso)
// y es editable desde el portal de admin; aquí solo se definen los códigos válidos.

export const PERMISOS = {
  GESTIONAR_USUARIOS: "gestionar_usuarios",
  GESTIONAR_PERMISOS: "gestionar_permisos",
  ASIGNAR_RESERVAS: "asignar_reservas",
  ACEPTAR_RESERVAS: "aceptar_reservas",
  VER_REPORTES: "ver_reportes",
  MODERAR_RESENAS: "moderar_resenas",
  GESTIONAR_ALQUILERES: "gestionar_alquileres",
} as const

export type PermisoCodigo = (typeof PERMISOS)[keyof typeof PERMISOS]

export const CATALOGO_PERMISOS: {
  codigo: PermisoCodigo
  nombre: string
  descripcion: string
}[] = [
  {
    codigo: PERMISOS.GESTIONAR_USUARIOS,
    nombre: "Gestionar usuarios",
    descripcion: "Crear, editar y desactivar cuentas de clientes y choferes.",
  },
  {
    codigo: PERMISOS.GESTIONAR_PERMISOS,
    nombre: "Gestionar permisos",
    descripcion: "Asignar o revocar permisos a roles y usuarios.",
  },
  {
    codigo: PERMISOS.ASIGNAR_RESERVAS,
    nombre: "Asignar reservas",
    descripcion: "Asignar manualmente reservas a un chofer concreto.",
  },
  {
    codigo: PERMISOS.ACEPTAR_RESERVAS,
    nombre: "Aceptar reservas",
    descripcion: "Ver reservas pendientes y aceptarlas (primero en aceptar se la queda).",
  },
  {
    codigo: PERMISOS.VER_REPORTES,
    nombre: "Ver reportes",
    descripcion: "Acceder a reportes y listados agregados de reservas.",
  },
  {
    codigo: PERMISOS.MODERAR_RESENAS,
    nombre: "Moderar reseñas",
    descripcion: "Ver todas las reseñas y ocultar las inapropiadas.",
  },
  {
    codigo: PERMISOS.GESTIONAR_ALQUILERES,
    nombre: "Gestionar alquileres",
    descripcion: "Confirmar precio y estado de alquileres entre ciudades.",
  },
]

// Permisos por defecto de cada rol; el seed los inserta en RolPermiso y
// desde ahí el admin puede modificarlos libremente.
export const PERMISOS_POR_ROL_DEFAULT: Record<string, PermisoCodigo[]> = {
  ADMIN: CATALOGO_PERMISOS.map((p) => p.codigo),
  CHOFER: [PERMISOS.ACEPTAR_RESERVAS],
  CLIENTE: [],
}
