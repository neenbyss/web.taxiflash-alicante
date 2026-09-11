import { validateDeploymentEnv } from "../lib/deployment-env"

// No cargar .env local: Vercel inyecta sus variables; en local usar --env-file.
const errors = validateDeploymentEnv(process.env)
if (errors.length) {
  console.error(
    "Configuración de despliegue incompleta (no se muestran secretos):"
  )
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(
    "Variables de despliegue válidas. Falta comprobar conectividad, dominio remitente y OAuth en el entorno remoto."
  )
}
