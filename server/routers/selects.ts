// Formas de selección compartidas para NO exponer datos sensibles de otros
// usuarios (contraseñas nunca salen de la tabla account; aquí se controla
// además email/teléfono según el contexto).

/** Datos públicos mínimos de un usuario (listas, chat). */
export const usuarioPublicoSelect = {
  id: true,
  name: true,
  image: true,
} as const

/** Datos de contacto: solo para la contraparte de una reserva aceptada o admin. */
export const usuarioContactoSelect = {
  id: true,
  name: true,
  image: true,
  telefono: true,
  email: true,
} as const

export const reservaListadoInclude = {
  cliente: { select: usuarioPublicoSelect },
  chofer: { select: usuarioPublicoSelect },
} as const

export const reservaDetalleInclude = {
  cliente: { select: usuarioContactoSelect },
  chofer: { select: usuarioContactoSelect },
  resena: true,
} as const
