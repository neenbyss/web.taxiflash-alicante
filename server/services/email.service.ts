// Correo transaccional centralizado. EMAIL_PROVIDER permite alternar entre
// Resend y SMTP/Nodemailer sin tocar los flujos de negocio.

import nodemailer from "nodemailer"

type EmailProvider = "resend" | "smtp" | "disabled"
type EmailOptions = {
  to: string
  subject: string
  titulo: string
  lineas: string[]
  codigo?: string
  urlAccion?: { texto: string; href: string }
  required?: boolean
}

let transporter: nodemailer.Transporter | null = null
let avisoMostrado = false

function provider(): EmailProvider {
  const configured = process.env.EMAIL_PROVIDER?.trim().toLowerCase()
  if (
    configured === "resend" ||
    configured === "smtp" ||
    configured === "disabled"
  )
    return configured
  if (process.env.RESEND_API_KEY || process.env.RESEND_API) return "resend"
  if (process.env.SMTP_HOST) return "smtp"
  return "disabled"
}

export function emailHabilitado(): boolean {
  const selected = provider()
  if (selected === "resend")
    return Boolean(process.env.RESEND_API_KEY || process.env.RESEND_API)
  if (selected === "smtp") return Boolean(process.env.SMTP_HOST)
  return false
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
    .replaceAll("'", "&#039;")
}

function actionUrl(href: string): string | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3500"
  try {
    const url = new URL(href, appUrl)
    return url.origin === new URL(appUrl).origin ? url.toString() : null
  } catch {
    return null
  }
}

function renderEmail(opts: EmailOptions) {
  const parrafos = opts.lineas
    .map(
      (linea) =>
        `<p style="margin:0 0 12px;color:#5f5a4c;line-height:1.65">${escapeHtml(linea)}</p>`
    )
    .join("")
  const url = opts.urlAccion ? actionUrl(opts.urlAccion.href) : null
  const boton =
    url && opts.urlAccion
      ? `<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#282826;color:#fff4d6;padding:13px 20px;border-radius:10px;text-decoration:none;font-weight:700">${escapeHtml(opts.urlAccion.texto)}</a></p>`
      : ""
  const codigo = opts.codigo
    ? `<div style="margin:24px 0;padding:18px 20px;background:#fff3cc;border-radius:12px;color:#282826;font-size:30px;font-weight:800;letter-spacing:8px;text-align:center">${escapeHtml(opts.codigo)}</div>`
    : ""
  return {
    text: [
      opts.titulo,
      "",
      ...opts.lineas,
      opts.codigo ? `Código: ${opts.codigo}` : "",
      url ?? "",
    ]
      .filter(Boolean)
      .join("\n"),
    html: `<div style="background:#f5f1e8;padding:32px 16px;font-family:Arial,sans-serif"><div style="max-width:520px;margin:0 auto;background:#fff;padding:32px;border-radius:16px"><p style="margin:0 0 22px;color:#b27600;font-size:14px;font-weight:800">TaxiFlash</p><h1 style="margin:0 0 16px;color:#282826;font-family:Georgia,serif;font-size:28px;line-height:1.2">${escapeHtml(opts.titulo)}</h1>${parrafos}${codigo}${boton}<p style="margin:26px 0 0;color:#817b6d;font-size:12px;line-height:1.5">Si no solicitaste este correo, puedes ignorarlo. TaxiFlash nunca te pedirá este código por teléfono.</p></div></div>`,
  }
}

async function sendWithResend(
  opts: EmailOptions,
  content: ReturnType<typeof renderEmail>
) {
  const apiKey = process.env.RESEND_API_KEY || process.env.RESEND_API
  if (!apiKey) throw new Error("RESEND_API_KEY no está configurada")
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [opts.to],
      subject: opts.subject,
      ...content,
    }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok)
    throw new Error(`Resend respondió con estado ${response.status}`)
}

export async function enviarEmail(opts: EmailOptions): Promise<void> {
  if (!emailHabilitado()) {
    if (opts.required)
      throw new Error("El proveedor de correo no está configurado")
    if (!avisoMostrado) {
      avisoMostrado = true
      console.info(
        "[email] Proveedor no configurado: se omiten los correos no críticos."
      )
    }
    return
  }
  const content = renderEmail(opts)
  try {
    if (provider() === "resend") await sendWithResend(opts, content)
    else
      await getTransporter().sendMail({
        from: process.env.EMAIL_FROM,
        to: opts.to,
        subject: opts.subject,
        ...content,
      })
  } catch (error) {
    console.error(
      "[email] fallo de entrega",
      error instanceof Error ? error.message : "desconocido"
    )
    if (opts.required)
      throw new Error("No se pudo entregar el correo de verificación")
  }
}
