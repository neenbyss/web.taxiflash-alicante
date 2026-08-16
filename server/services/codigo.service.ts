import { randomInt } from "crypto"

// Alfabeto sin caracteres ambiguos (0/O, 1/I/L).
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

/** Código público corto (ej. "R-7KM2Q9XA") para consultar reservas sin cuenta. */
export function generarCodigo(prefijo: string): string {
  let codigo = ""
  for (let i = 0; i < 8; i++) {
    codigo += ALFABETO[randomInt(ALFABETO.length)]
  }
  return `${prefijo}-${codigo}`
}
