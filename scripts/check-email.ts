import "dotenv/config"

import { enviarEmail } from "../server/services/email.service"

const to = process.env.EMAIL_TEST_TO ?? "delivered@resend.dev"

await enviarEmail({
  to,
  subject: "TaxiFlash: comprobación de correo",
  titulo: "Correo configurado",
  lineas: ["Prueba automática de la integración con el proveedor de correo."],
  required: true,
})

console.log(`Proveedor de correo operativo. Destino de prueba: ${to}`)
