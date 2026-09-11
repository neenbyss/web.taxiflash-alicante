# TaxiFlash

Aplicación de reservas de taxi con portales de cliente, chofer y administración.
Utiliza Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, tRPC,
Prisma, PostgreSQL y Better Auth.

## Organización de las páginas públicas

- `(static)`: landing, Nosotros (`/about`) y Servicios (`/services`).
- `(redirect)`: `/redirigir`, con logo y carga sencilla, sin navegación comercial.
- `(booking-status)`: consulta pública `/reserva` y `/reserva/[codigo]`, sin header ni footer comercial y con `noindex`.

Los nombres entre paréntesis organizan archivos; no forman parte de las URL.
Este último grupo reemplaza a `(publico)` sin cambiar los enlaces de consulta
existentes. No debe eliminarse la consulta de reservas al editar la redirección.

Cada página comercial compone sus bloques desde archivos `*.section.tsx`, igual
que la landing. `about/page.tsx` reúne `hero`, `story`, `purpose` y `principles`;
`services/page.tsx` reúne `hero` y `catalogue`. Edita el contenido y los estilos
en cada sección; deja la composición y los metadatos en `page.tsx`.

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

| Variable                          | Uso                                                                 |
| --------------------------------- | ------------------------------------------------------------------- |
| `DATABASE_URL`                    | Desde el host debe usar PostgreSQL en `localhost:5433`              |
| `POSTGRES_USER`                   | Usuario creado por PostgreSQL en Docker                             |
| `POSTGRES_PASSWORD`               | Contraseña local de PostgreSQL; usa otra en producción              |
| `POSTGRES_DB`                     | Nombre de la base creada por Docker                                 |
| `BETTER_AUTH_SECRET`              | Secreto aleatorio de al menos 32 caracteres                         |
| `BETTER_AUTH_URL`                 | Origen exacto de la aplicación                                      |
| `NEXT_PUBLIC_APP_URL`             | Origen público, sin secretos                                        |
| `GOOGLE_SITE_VERIFICATION`        | Token de la etiqueta HTML entregado por Google Search Console       |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Identificador GA4 (`G-...`); solo carga con consentimiento          |
| `BETTER_AUTH_TRUSTED_ORIGINS`     | Orígenes exactos permitidos, separados por comas                    |
| `TRUSTED_PROXY_HEADER`            | Cabecera sobrescrita por el proxy de producción                     |
| `TRUSTED_PROXY_IPS`               | IP o CIDR de cada proxy confiable, separados por comas              |
| `GOOGLE_CLIENT_ID`                | Client ID del OAuth de Google; déjalo vacío para ocultar Google     |
| `GOOGLE_CLIENT_SECRET`            | Secreto OAuth de Google; debe configurarse junto con el ID          |
| `EMAIL_PROVIDER`                  | `resend`, `smtp` o `disabled`                                       |
| `RESEND_API_KEY`                  | API key de Resend; solo servidor, nunca uses prefijo `NEXT_PUBLIC_` |
| `SMTP_HOST`                       | Host SMTP; `localhost` cuando se usa Mailpit                        |
| `SMTP_PORT`                       | Puerto SMTP; Mailpit usa `1025`                                     |
| `SMTP_USER` / `SMTP_PASS`         | Credenciales SMTP cuando el proveedor las requiere                  |
| `SMTP_SECURE`                     | `true` para TLS directo (normalmente puerto 465)                    |
| `EMAIL_FROM`                      | Remitente completo, por ejemplo `TaxiFlash <acceso@tudominio.es>`   |
| `TARIFA_BASE`                     | Bajada de bandera usada por la estimación                           |
| `TARIFA_POR_KM`                   | Importe estimado por kilómetro                                      |
| `TARIFA_MINIMA`                   | Importe mínimo estimado                                             |
| `SEED_ADMIN_EMAIL`                | Correo del administrador local creado por el seed                   |
| `SEED_ADMIN_PASSWORD`             | Contraseña local de ese administrador                               |

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

Puedes comprobar el proveedor sin enviar a una persona real. Por defecto usa
la dirección sintética `delivered@resend.dev`:

```bash
yarn email:check
```

### Probar desde un teléfono en la red local

Con el ordenador en `192.168.3.10`, usa temporalmente:

```dotenv
BETTER_AUTH_URL="http://192.168.3.10:3500"
NEXT_PUBLIC_APP_URL="http://192.168.3.10:3500"
BETTER_AUTH_TRUSTED_ORIGINS="http://localhost:3500,http://127.0.0.1:3500,http://192.168.3.10:3500"
TRUSTED_PROXY_HEADER="x-forwarded-for"
TRUSTED_PROXY_IPS=""
```

Después ejecuta `yarn dev` y abre `http://192.168.3.10:3500` en el teléfono.
El firewall de Windows debe permitir conexiones privadas al puerto 3500.
`x-forwarded-for` sin proxy se admite aquí únicamente para pruebas LAN. En una
publicación real coloca nginx, Cloudflare u otro proxy delante del servidor,
haz que sobrescriba la cabecera y configura su IP exacta en
`TRUSTED_PROXY_IPS`; no declares toda la red de clientes como confiable.

Como el proyecto genera `output: "standalone"`, el arranque del build es:

```bash
yarn build
yarn start
```

`yarn start` ejecuta internamente `.next/standalone/server.js` en
`0.0.0.0:3500`, por lo que ya no debe usarse `next start`. El paso `postbuild`
copia automáticamente `public/` y `.next/static/` al paquete standalone; estos
directorios son necesarios para que las imágenes, estilos y JavaScript del
navegador carguen correctamente.

Para producción reemplaza los tres orígenes locales por el dominio HTTPS real.
Google OAuth requiere registrar también la URL exacta de callback; Google puede
rechazar una IP privada como origen OAuth, aunque el acceso por correo y OTP sí
funciona en la LAN.

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

Revisión del 10/09/2026: la API limita los lotes tRPC a 10 operaciones y los
cuerpos a 64 KiB (tRPC), 16 KiB (auth) y 2 KiB (registro), midiendo los bytes
recibidos aunque no exista `Content-Length`. Las mutaciones tRPC validan el
origen y sus respuestas llevan `private, no-store`. Los errores internos no
devuelven mensajes de Prisma ni trazas en producción.

Las comprobaciones de cupos y duplicados de reservas se ejecutan dentro de una
transacción con bloqueo por cliente. Los intentos OTP reclaman una versión del
desafío antes de comparar el código para evitar intentos paralelos sin contar.
Los códigos predecibles del seed no permiten consultar viajes públicamente en
producción. Se restringieron las reseñas de chofer, los cambios de rol y el
contacto del cliente antes de asignar una reserva.

Pruebas de regresión locales (sin enviar correos ni crear reservas):

```bash
yarn tsx --test tests/security.test.ts
node --conditions=react-server --import tsx --test tests/access-control.test.ts
```

La segunda prueba utiliza el seed local únicamente para lecturas: comprueba
que un anónimo no acceda a perfiles/notificaciones y que un cliente no lea
reservas, chats, reseñas de chofer ni listas de usuarios que no le corresponden.

Los límites generales y de correo siguen almacenados en memoria por instancia.
En Vercel deben complementarse con un almacén compartido y reglas WAF antes
de abrir el servicio a tráfico público. Esta revisión no sustituye una prueba
de penetración ni garantiza protección frente a un DDoS volumétrico.

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

## Publicar temporalmente en Vercel

Esta es una prueba remota con comportamiento de producción, no el modo demo
simulado. No se publica automáticamente desde este repositorio.

`vercel.json` selecciona Next.js, Yarn y `yarn build:vercel`. Este comando valida
las variables, genera Prisma y compila. No ejecuta migraciones ni seed. Vercel
gestiona el servidor: **no uses `yarn start`, Docker ni un puerto fijo allí**.
`standalone` se genera solo fuera de Vercel para conservar Docker/local.
El proyecto admite Node 22 y 24; en Vercel usa Node 24, igual que la verificación
local actual. No configures Output Directory ni lo cambies a `out`.

### 1. Base de datos y variables

Prepara una base PostgreSQL remota **exclusiva para la presentación**, preferiblemente
en una región europea cercana a las funciones. Docker de tu PC no es accesible
desde Vercel. Copia la conexión con pooling en `DATABASE_URL` y, si tu proveedor
lo necesita, la conexión directa en `DIRECT_URL` para las migraciones. Conserva
los parámetros SSL del proveedor. Cada instancia limita su pool a 5 conexiones;
esto no sustituye el pool remoto ni los límites globales de la base.

Usa [config/vercel.env.example](config/vercel.env.example) como plantilla, no el
`.env` local. Sus valores son marcadores que debes sustituir.

| Variable | Qué configurar |
| --- | --- |
| `DATABASE_URL` | PostgreSQL remoto con pooling y TLS |
| `DIRECT_URL` | Opcional, conexión de migraciones; si se omite usa `DATABASE_URL` |
| `BETTER_AUTH_SECRET` | Secreto aleatorio nuevo de al menos 32 caracteres; nunca el local |
| `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` | El mismo origen HTTPS estable, sin barra final |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Orígenes HTTPS exactos, separados por coma, incluyendo el anterior |
| `TRUSTED_PROXY_HEADER` | `x-forwarded-for` en Vercel; `TRUSTED_PROXY_IPS` puede omitirse |
| `EMAIL_PROVIDER` | `resend` para esta prueba |
| `RESEND_API_KEY` | Clave de Resend del entorno remoto |
| `EMAIL_FROM` | Remitente de un dominio verificado para enviar al cliente |
| `TARIFA_BASE`, `TARIFA_POR_KM`, `TARIFA_MINIMA` | Valores positivos; confirma las tarifas antes de aceptar viajes reales |
| `SITE_NOINDEX` | `true` durante la presentación, también si usas el entorno Production |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Opcionales, siempre ambos o ninguno |
| `GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Opcionales durante la prueba |

Si eliges SMTP, añade `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER` y
`SMTP_PASS` del proveedor remoto. No uses Mailpit. Con Resend no necesitas SMTP.
No subas `POSTGRES_*`, `SEED_ADMIN_*`, ni secretos con prefijo `NEXT_PUBLIC_`.
No compartas el archivo con las credenciales ni lo subas a Git.

### 2. Configurar Vercel y autenticación

1. Importa el repositorio en Vercel o ejecuta `npx vercel link`.
2. Añade las variables de la tabla en **Settings → Environment Variables** del
   entorno que vas a usar. No compartas la base final de producción con previews.
3. Usa el dominio HTTPS final en `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` y
   `BETTER_AUTH_TRUSTED_ORIGINS`.
4. Configura Resend con una API key de producción y un `EMAIL_FROM` de un
   dominio verificado.
5. Para Google OAuth registra `https://TU-DOMINIO/api/auth/callback/google` y
   añade los usuarios de prueba en Google si la aplicación sigue en Testing.
6. Usa el dominio estable del proyecto para mostrar la web. Una URL aleatoria
   de Preview no queda autorizada automáticamente: configura su origen exacto y
   callback si quieres autenticar allí. **No autorices `*.vercel.app`.**
7. Mantén Deployment Protection para la prueba y da acceso al cliente mediante
   las opciones de Vercel. `noindex` evita indexación, no controla el acceso.

### 3. Validar, migrar y desplegar

Después de guardar las variables remotas y vincular el proyecto:

```bash
npx vercel env pull .env.vercel.local --environment=production
node --env-file=.env.vercel.local --import tsx scripts/check-deployment-env.ts
yarn db:generate
node --env-file=.env.vercel.local node_modules/prisma/build/index.js migrate status
node --env-file=.env.vercel.local node_modules/prisma/build/index.js migrate deploy
npx vercel --prod
```

Los comandos de Prisma cargan explícitamente el archivo remoto para no migrar
por error la base local. Antes de `migrate deploy`, verifica en la consola del
proveedor que seleccionaste la base de la presentación. No se ha ejecutado
ninguno de estos comandos remotos automáticamente.

Para Preview, usa `--environment=preview` al obtener las variables y `npx vercel`
al desplegar. Si cambias URLs o variables `NEXT_PUBLIC_*`, vuelve a desplegar.

**No ejecutes `yarn db:seed` en el despliegue ni contra la base definitiva.**
La base nueva no tiene usuarios: registra una cuenta real con OTP y crea unas
pocas reservas de prueba. El seed local contiene cuentas y datos ficticios que
no deben publicarse. Para probar administración, promueve únicamente tu cuenta
verificada desde una conexión administrativa segura y vuelve a iniciar sesión;
no habilites un registro público de administradores.

### 4. Comprobación tras publicar

- Abre `/`, `/about`, `/services`, `/reserva` y `/redirigir`.
- Prueba email OTP, perfil, sesión, cierre de sesión y recuperación de contraseña.
- Prueba Google si lo habilitaste; revisa remitente/destinatario y logs de entrega.
- Desde un móvil, prueba reserva, zoom, ubicación (HTTPS), origen y destino.
- Comprueba que un cliente no entra a administración ni consulta reservas ajenas.
- Comprueba `/robots.txt` y la cabecera `X-Robots-Tag`: la demo debe ser `noindex`.
- Revisa logs de funciones, conexiones de PostgreSQL y errores de correo. No
  registres tokens, OTP, cuerpos de autenticación ni datos personales completos.
- Antes de abrir la prueba al público, configura límites y protección en Vercel;
  el rate limit en memoria se reinicia y no se comparte entre instancias.

Para el sitio definitivo cambia `SITE_NOINDEX=false` y vuelve a desplegar. Los
Preview permanecen sin indexación. Para SEO, `GOOGLE_SITE_VERIFICATION` recibe el contenido de la etiqueta
de Search Console y `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` el ID `G-...`. Tras el
despliegue comprueba `/robots.txt` y `/sitemap.xml`, y envía este último desde
Search Console. No envíes el sitemap de la demo a Search Console. Analytics se
carga únicamente tras aceptar cookies.

Referencias: [Next.js en Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs),
[variables de entorno y CLI](https://vercel.com/docs/cli/env),
[cabeceras de IP de Vercel](https://vercel.com/docs/headers/request-headers).

```bash
yarn env:check
yarn lint
yarn typecheck
yarn build
```

El mapa usa teselas estándar de OpenStreetMap sin API key. Ese servicio
comunitario no ofrece SLA; para tráfico comercial elevado se debe elegir un
proveedor compatible o alojar teselas propias, conservando la atribución.

## Problemas frecuentes

- **Usuario no encontrado después del seed:** ejecuta los tres comandos de base
  anteriores y reinicia `yarn dev`.
- **Prisma no conecta:** confirma `docker compose ps` y que `DATABASE_URL` use
  `localhost:5433` cuando Next.js corre fuera de Docker.
- **No llegan correos:** revisa Mailpit en `http://localhost:8025`.
- **Puerto ocupado:** no ejecutes simultáneamente `yarn dev` y el servicio `app`
  de Docker Compose en el puerto 3500.
