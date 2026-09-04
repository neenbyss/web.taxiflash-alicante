# TaxiFlash

Aplicación de reservas de taxi con portales de cliente, chofer y administración.
Utiliza Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, tRPC,
Prisma, PostgreSQL y Better Auth.

## Inicio rápido

Requisitos: Node.js 22 o superior, Yarn y Docker Desktop iniciado.

```bash
corepack enable
yarn install --frozen-lockfile
copy .env.example .env
yarn env:check
yarn dev:setup
yarn dev
```

`yarn dev:setup` levanta PostgreSQL y Mailpit, genera Prisma, aplica las
migraciones y ejecuta el seed. La web estará en `http://localhost:3500`.

Para probar correos reales con Resend, configura `EMAIL_PROVIDER="resend"`,
`RESEND_API_KEY` y un `EMAIL_FROM` autorizado. Para ver los correos únicamente
en Mailpit, usa `EMAIL_PROVIDER="smtp"`; no necesitas una API externa.

| Servicio   | Dirección               |
| ---------- | ----------------------- |
| Aplicación | `http://localhost:3500` |
| PostgreSQL | `localhost:5433`        |
| Mailpit    | `http://localhost:8025` |
| SMTP local | `localhost:1025`        |

## Cuentas y datos de prueba

Estas credenciales son exclusivamente para desarrollo local:

| Rol           | Correo                         | Contraseña    | Portal      |
| ------------- | ------------------------------ | ------------- | ----------- |
| Administrador | `admin@taxiflash.local`        | `Admin123!`   | `/admin`    |
| Chofer        | `chofer@taxiflash.local`       | `Chofer123!`  | `/driver`   |
| Chofer        | `elena.chofer@taxiflash.local` | `Chofer123!`  | `/driver`   |
| Chofer        | `david.chofer@taxiflash.local` | `Chofer123!`  | `/driver`   |
| Cliente       | `cliente@taxiflash.local`      | `Cliente123!` | `/customer` |
| Cliente       | `javier@taxiflash.local`       | `Cliente123!` | `/customer` |
| Cliente       | `laura@taxiflash.local`        | `Cliente123!` | `/customer` |
| Cliente       | `pablo@taxiflash.local`        | `Cliente123!` | `/customer` |

El seed crea o actualiza 8 usuarios, permisos por rol, 12 reservas
(`TF-1831` a `TF-1842`), 3 alquileres (`A-4099` a `A-4101`), 4 reseñas,
7 notificaciones y 2 reportes. Es idempotente: puede ejecutarse varias veces.

```bash
yarn db:generate
yarn db:deploy
yarn db:seed
```

Si el servidor estaba abierto durante una migración, reinicia `yarn dev` para
que cargue el cliente de Prisma actualizado.

## Comandos habituales

| Comando            | Uso                                         |
| ------------------ | ------------------------------------------- |
| `yarn dev`         | Inicia Next.js en el puerto 3500            |
| `yarn dev:setup`   | Prepara infraestructura, migraciones y seed |
| `yarn infra:up`    | Inicia PostgreSQL y Mailpit                 |
| `yarn infra:down`  | Detiene contenedores conservando datos      |
| `yarn db:generate` | Regenera el cliente de Prisma               |
| `yarn db:migrate`  | Crea una migración de desarrollo            |
| `yarn db:deploy`   | Aplica migraciones existentes               |
| `yarn db:seed`     | Carga o actualiza datos de prueba           |
| `yarn db:studio`   | Abre Prisma Studio                          |
| `yarn env:check`   | Valida el entorno sin mostrar secretos      |
| `yarn lint`        | Ejecuta ESLint                              |
| `yarn typecheck`   | Comprueba TypeScript                        |
| `yarn build`       | Genera el build de producción               |

```bash
docker compose ps
docker compose logs -f db
docker compose up --build
```

Para inspeccionar PostgreSQL:

```bash
docker compose exec db psql -U taxiflash -d taxiflash
```

```sql
SELECT email, role, activo FROM "user" ORDER BY email;
SELECT COUNT(*) FROM reserva;
SELECT COUNT(*) FROM notificacion;
```

Sal con `\q`. `docker compose down` conserva los datos; `docker compose down
-v` elimina definitivamente el volumen local.

## Variables de entorno

Parte siempre de `.env.example`.

| Variable                  | Uso                                                                 |
| ------------------------- | ------------------------------------------------------------------- |
| `DATABASE_URL`            | Desde el host debe usar PostgreSQL en `localhost:5433`              |
| `POSTGRES_USER`           | Usuario creado por PostgreSQL en Docker                             |
| `POSTGRES_PASSWORD`       | Contraseña local de PostgreSQL; usa otra en producción              |
| `POSTGRES_DB`             | Nombre de la base creada por Docker                                 |
| `BETTER_AUTH_SECRET`      | Secreto aleatorio de al menos 32 caracteres                         |
| `BETTER_AUTH_URL`         | Origen exacto de la aplicación                                      |
| `NEXT_PUBLIC_APP_URL`     | Origen público, sin secretos                                        |
| `TRUSTED_PROXY_HEADER`    | Cabecera sobrescrita por el proxy de producción                     |
| `GOOGLE_CLIENT_ID`        | Client ID del OAuth de Google; déjalo vacío para ocultar Google     |
| `GOOGLE_CLIENT_SECRET`    | Secreto OAuth de Google; debe configurarse junto con el ID          |
| `EMAIL_PROVIDER`          | `resend`, `smtp` o `disabled`                                       |
| `RESEND_API_KEY`          | API key de Resend; solo servidor, nunca uses prefijo `NEXT_PUBLIC_` |
| `SMTP_HOST`               | Host SMTP; `localhost` cuando se usa Mailpit                        |
| `SMTP_PORT`               | Puerto SMTP; Mailpit usa `1025`                                     |
| `SMTP_USER` / `SMTP_PASS` | Credenciales SMTP cuando el proveedor las requiere                  |
| `SMTP_SECURE`             | `true` para TLS directo (normalmente puerto 465)                    |
| `EMAIL_FROM`              | Remitente completo, por ejemplo `TaxiFlash <acceso@tudominio.es>`   |
| `TARIFA_BASE`             | Bajada de bandera usada por la estimación                           |
| `TARIFA_POR_KM`           | Importe estimado por kilómetro                                      |
| `TARIFA_MINIMA`           | Importe mínimo estimado                                             |
| `SEED_ADMIN_EMAIL`        | Correo del administrador local creado por el seed                   |
| `SEED_ADMIN_PASSWORD`     | Contraseña local de ese administrador                               |

Configuración mínima para probar Resend:

```dotenv
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_..."
EMAIL_FROM="TaxiFlash <onboarding@resend.dev>"
```

`onboarding@resend.dev` sirve para las pruebas permitidas por Resend. Para
enviar a usuarios reales debes verificar tu dominio en Resend y cambiar
`EMAIL_FROM` a una dirección de ese dominio.

Alternativa local con Nodemailer y Mailpit:

```dotenv
EMAIL_PROVIDER="smtp"
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASS=""
SMTP_SECURE="false"
EMAIL_FROM="TaxiFlash <no-reply@taxiflash.local>"
```

Después de modificar `.env`, reinicia `yarn dev` y comprueba la configuración:

```bash
yarn env:check
```

## Registro y recuperación de acceso

El registro por correo no crea usuarios al enviar el formulario. El servidor
genera un OTP de seis dígitos y un enlace de un solo uso, guarda únicamente sus
resúmenes criptográficos y los invalida después de diez minutos. Solo después
de verificar el correo se permite completar el perfil y crear la contraseña.

- Cada código admite un máximo de cinco intentos.
- Solicitar otro correo invalida el código y enlace anteriores.
- Hay límites separados por dirección de correo e IP.
- La prueba de correo se guarda en una cookie `HttpOnly`, firmada y temporal.
- El endpoint normal de alta rechaza registros que no tengan esa prueba.
- La recuperación de contraseña usa un OTP independiente y no revela si el
  correo pertenece a una cuenta.
- Google OAuth funciona como alternativa cuando ambas variables de Google
  están configuradas.

Genera secretos con `openssl rand -hex 32`. Nunca publiques `.env` ni uses las
contraseñas del seed en producción.

## Seguridad antes de producción

- Cambia todos los secretos y no ejecutes el seed en producción.
- Usa HTTPS y coloca CDN/WAF o proxy inverso delante de Next.js.
- Bloquea el acceso directo al origen y sobrescribe la cabecera de IP confiable.
- Sustituye el rate limit en memoria por Redis/Upstash si usas varias réplicas.
- En Resend verifica el dominio, configura SPF/DKIM y separa las API keys de
  desarrollo y producción.
- Limita solicitudes, conexiones, cabeceras y tamaño del body en el proxy.
- Configura copias cifradas de PostgreSQL y prueba su restauración.
- Ejecuta lint, TypeScript, build y auditoría de dependencias en CI.
- Un DDoS volumétrico requiere defensa previa mediante CDN/WAF y rate limiting
  distribuido; la aplicación por sí sola no puede detenerlo.

En caso de fuga, aísla el origen, conserva logs, rota secretos y credenciales,
revoca sesiones y determina los datos afectados.

## Problemas frecuentes

- **Usuario no encontrado después del seed:** ejecuta los tres comandos de base
  anteriores y reinicia `yarn dev`.
- **Prisma no conecta:** confirma `docker compose ps` y que `DATABASE_URL` use
  `localhost:5433` cuando Next.js corre fuera de Docker.
- **No llegan correos:** revisa Mailpit en `http://localhost:8025`.
- **Puerto ocupado:** no ejecutes simultáneamente `yarn dev` y el servicio `app`
  de Docker Compose en el puerto 3500.
