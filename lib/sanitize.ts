// Sanitización de texto libre (notas, chat, reseñas).
// Se almacena texto plano: se eliminan caracteres de control y se recorta.
// El escape de HTML lo hace React al renderizar (nunca usamos dangerouslySetInnerHTML
// con contenido de usuario).

// Caracteres de control C0/DEL excepto \n (10) y \t (9), construido por
// código de carácter para no incrustar bytes de control en el fuente.
const c = String.fromCharCode
const CONTROL_CHARS = new RegExp(
  `[${c(0)}-${c(8)}${c(11)}${c(12)}${c(14)}-${c(31)}${c(127)}]`,
  "g"
)

export function sanitizeText(value: string): string {
  return value.replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim()
}

export function sanitizeMultiline(value: string): string {
  return value
    .replace(CONTROL_CHARS, "")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim()
}
