// Correo transaccional con Nodemailer (SMTP).
// Decisión: Nodemailer en vez de Resend porque no exige API key externa y en
// desarrollo funciona contra Mailpit (incluido en docker-compose). Para migrar
// a Resend basta con reimplementar `enviarEmail`.
//
// MODO SIN EMAIL: si SMTP_HOST está vacío o no definido, el servicio queda
// deshabilitado — no se envía nada y la app funciona igual (las notificaciones
// in-app no dependen de esto). Cuando tengas un proveedor SMTP, solo rellena
// las variables SMTP_* del .env.

import nodemailer from "nodemailer"

let transporter: nodemailer.Transporter | null = null
let avisoMostrado = false

/** true si hay un servidor SMTP configurado via variables de entorno. */
export function emailHabilitado(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim())
}

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  })
  return transporter
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

/**
 * Envío "fire-and-forget": si el email está deshabilitado se omite en
 * silencio, y un fallo de SMTP no rompe la operación de negocio (la
 * notificación in-app ya quedó registrada). Solo se loguea.
 */
export async function enviarEmail(opts: {
  to: string
  subject: string
  titulo: string
  lineas: string[]
  urlAccion?: { texto: string; href: string }
}): Promise<void> {
  if (!emailHabilitado()) {
    if (!avisoMostrado) {
      avisoMostrado = true
      console.info(
        "[email] SMTP_HOST no configurado: los correos quedan deshabilitados (la app funciona igual)."
      )
    }
    return
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3500"
  const parrafos = opts.lineas
    .map((l) => `<p style="margin:0 0 12px">${escapeHtml(l)}</p>`)
    .join("")
  const boton = opts.urlAccion
    ? `<p style="margin:20px 0"><a href="${appUrl}${opts.urlAccion.href}" style="background:#111;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">${escapeHtml(opts.urlAccion.texto)}</a></p>`
    : ""

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM ?? "TaxiFlash <no-reply@taxiflash.local>",
      to: opts.to,
      subject: opts.subject,
      text: [opts.titulo, "", ...opts.lineas].join("\n"),
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px">${escapeHtml(opts.titulo)}</h2>
        ${parrafos}
        ${boton}
        <hr style="border:none;border-top:1px solid #ddd;margin:24px 0" />
        <p style="color:#777;font-size:12px">TaxiFlash — este mensaje fue generado automáticamente.</p>
      </div>`,
    })
  } catch (error) {
    console.error("[email] fallo al enviar:", error)
  }
}
