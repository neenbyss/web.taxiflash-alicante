# TaxiFlash

Prototipo funcional de gestión de reservas de taxi **por formulario**: el
cliente solicita, la reserva queda **pendiente**, y un chofer la acepta
manualmente desde su portal (o el admin la asigna). **No** es un sistema de
matching en tiempo real: no hay geolocalización en vivo, colas con TTL ni
distribución automática entre choferes.

## Stack

Next.js 16 (App Router, `proxy.ts`) · React 19 · TypeScript estricto ·
shadcn/ui (Base UI) · tRPC v11 · PostgreSQL + Prisma 7 · better-auth ·
Zustand · React Hook Form + Zod v4 · Nodemailer (opcional) ·
Leaflet/OpenStreetMap · Docker Compose.

---

## 🚀 Guía de ejecución paso a paso

### Requisitos previos

| Herramienta | Versión | Para qué |
| ----------- | ------- | -------- |
| Node.js | 20.9 o superior | ejecutar la app en modo desarrollo |
| pnpm | 9+ (`npm i -g pnpm`) | gestor de paquetes del proyecto |
| Docker Desktop | reciente | PostgreSQL (y opcionalmente toda la app) |

### Opción A — Desarrollo local (recomendada para trabajar)

**Paso 1.** Clona/abre el proyecto y crea tu archivo de entorno:

```bash
cp .env.example .env
```

**Paso 2.** Abre `.env` y revisa lo mínimo:

- `BETTER_AUTH_SECRET` → pon cualquier cadena larga aleatoria
  (ej. genera una con `openssl rand -hex 32` o escribe 40+ caracteres a mano).
- `SMTP_HOST` → **déjalo vacío si no tienes servicio de correo**
  (ver sección "¿Sin servicio de email?"). Todo funciona igual.
- El resto ya tiene valores que funcionan tal cual.

**Paso 3.** Instala las dependencias:

```bash
pnpm install
```

**Paso 4.** Levanta la base de datos (y Mailpit, inofensivo si no usas email):

```bash
docker compose up -d db mailpit
```

Esto deja PostgreSQL escuchando en `localhost:5433` con los datos persistidos
en un volumen de Docker.

**Paso 5.** Crea las tablas (migraciones):

```bash
pnpm db:migrate
```

**Paso 6.** Carga los datos iniciales (catálogo de permisos + cuentas demo):

```bash
pnpm db:seed
```

**Paso 7.** Arranca el servidor de desarrollo:

```bash
pnpm dev
```

**Paso 8.** Abre http://localhost:3500 y entra con una cuenta demo:

| Rol     | Email                     | Contraseña    | Portal |
| ------- | ------------------------- | ------------- | ------ |
| Admin   | `admin@taxiflash.local`   | `Admin123!`   | `/admin` |
| Chofer  | `chofer@taxiflash.local`  | `Chofer123!`  | `/chofer` |
| Cliente | `cliente@taxiflash.local` | `Cliente123!` | `/cliente` |

**Paso 9 (prueba del flujo completo).**
1. Entra como **cliente** → `/cliente/reservar`, fija origen y destino en el mapa y envía. El contacto se toma de tu perfil (no se pide). Guarda el código `R-XXXXXXXX`.
2. Entra como **chofer** → pestaña "Pendientes" → **Aceptar** → "Iniciar viaje" → "Finalizar viaje".
3. Vuelve como **cliente**: cuando el chofer finalice el viaje podrás dejar una **reseña** desde el detalle.
4. Entra como **admin** para ver reportes, asignar reservas y gestionar usuarios/permisos. Desde el menú de usuario (arriba a la derecha) puedes **cambiar de portal** y operar también como chofer.

> **Reservar requiere cuenta.** Un visitante sin sesión no puede crear reservas
> ni alquileres; se le lleva a registro/login. El único flujo público es
> consultar el estado de una reserva por su código en `/reserva`.

### Opción B — Todo con Docker (app incluida)

```bash
cp .env.example .env        # edita BETTER_AUTH_SECRET (obligatorio)
docker compose up --build
```

Esto construye la imagen, levanta PostgreSQL y Mailpit, aplica migraciones y
seed automáticamente (servicio `migrate`) y arranca la app en
http://localhost:3500. Para detener todo: `docker compose down`
(los datos de la BD se conservan; `docker compose down -v` los borra).

### Comandos útiles del día a día

| Comando | Descripción |
| ------- | ----------- |
| `pnpm dev` | servidor de desarrollo (hot reload) |
| `pnpm build` + `pnpm start` | build y servidor de producción |
| `pnpm typecheck` / `pnpm lint` | verificación de tipos / linter |
| `pnpm db:migrate` | crear/aplicar migraciones en dev |
| `pnpm db:seed` | re-ejecutar seed (idempotente, no duplica) |
| `pnpm db:studio` | Prisma Studio (explorador visual de la BD) |
| `docker compose up -d db mailpit` | solo infraestructura |
| `docker compose logs -f app` | logs de la app en Docker |

---

## 📧 ¿Sin servicio de email? (modo por defecto)

El proyecto está preparado para funcionar **sin ningún proveedor de correo**:

- Si `SMTP_HOST` está **vacío** en el `.env`, el servicio de email queda
  deshabilitado: no se intenta enviar nada, no hay errores, y todos los flujos
  (reservas, aceptación, reseñas, alquileres…) funcionan normal. Los usuarios
  se enteran de todo por las **notificaciones in-app** (campana en cada portal).
- Aunque estuviera configurado, el envío es *fire-and-forget*: un fallo de
  SMTP solo se loguea, nunca rompe la operación.

Cuando tengas servicio de correo, hay dos caminos:

1. **Probar en local sin proveedor real**: pon `SMTP_HOST="localhost"` y
   `SMTP_PORT="1025"` — los correos van a Mailpit (bandeja falsa en
   http://localhost:8025, no sale nada a internet).
2. **Producción**: rellena `SMTP_*` con los datos de tu proveedor
   (Brevo, SES, Gmail SMTP, etc.). O migra a Resend reimplementando solo
   `server/services/email.service.ts`.

Lo mismo aplica a **Google OAuth**: si `GOOGLE_CLIENT_ID`/`SECRET` están
vacíos, el botón de Google no se muestra y el login por email/contraseña
funciona igual.

---

## 🔒 Seguridad de páginas y rutas

> **Nota sobre Next.js 16**: el clásico `middleware.ts` fue **renombrado a
> `proxy.ts`** (misma función: código que corre en el servidor antes de cada
> request). Este proyecto ya lo usa; si buscas "middleware", es
> [proxy.ts](proxy.ts).

La protección tiene **tres capas** (defensa en profundidad):

1. **`proxy.ts` (middleware de Next 16)** — sin tocar la base de datos:
   - `/cliente`, `/chofer`, `/admin` sin cookie de sesión → redirige a
     `/login?callbackUrl=…`.
   - `/login` y `/register` con sesión activa → redirige al portal del rol.
2. **Layout de cada portal** — `requireRole()` valida la **sesión real** y el
   rol en el servidor; un cliente que entre a `/admin` es redirigido a su
   portal, y una cuenta desactivada es expulsada.
3. **Procedimientos tRPC** — cada operación vuelve a exigir sesión, rol y/o
   permiso (`protectedProcedure`, `roleProcedure`, `permissionProcedure`),
   además de rate limiting por usuario/IP.

Complementos:

- **Cabeceras de seguridad** globales en [next.config.ts](next.config.ts):
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`.
- Validación Zod en cliente **y** servidor (mismos esquemas en `lib/validations/`).
- Anti-bots en registro: honeypot + máx. 5 cuentas/IP por 24h + rate limit.
- Sanitización de texto libre y selects explícitos que no exponen datos de
  otros usuarios (el contacto del chofer solo se ve tras la aceptación).

---

## 📁 Estructura del proyecto

```
app/                        # RUTAS (route groups: no cambian la URL)
  (publico)/                #   sin cuenta: home + consulta de reserva por código
  (auth)/                   #   login y registro
  (portales)/               #   cliente/ chofer/ admin/ (layout + guard de rol c/u)
                            #   + loading.tsx compartido (skeleton de segmento)
  api/                      #   better-auth y tRPC
  layout.tsx                #   raíz: providers, fuentes, toaster
  error.tsx / not-found.tsx #   error boundary y 404 (convenciones Next.js)

components/                 # COMPONENTES agrupados por tipo
  ui/                       #   shadcn/ui base (button, dialog, table…)
  forms/                    #   formularios RHF+zod (reserva, alquiler, login, registro, perfil…)
  dialogs/                  #   diálogos reutilizables (confirmar, reseña, asignar, usuario, permisos…)
  tables/                   #   tablas del admin (reservas, usuarios, reseñas, alquileres, matriz permisos)
  cards/                    #   cards de entidades (reserva, reseña)
  lists/                    #   listados por portal (mis reservas, pendientes, mis viajes…)
  views/                    #   vistas compuestas (detalle de reserva, estado público, reportes)
  layout/                   #   shell de portal y campana de notificaciones
  mapa/                     #   Leaflet: selector de puntos y buscador de direcciones
  chat/                     #   chat por reserva (beta)
  providers/                #   tRPC/React Query y theme
  shared/                   #   piezas pequeñas transversales (badge de estado, estrellas)

hooks/                      # useNotificaciones, usePermisos
stores/                     # zustand: borrador de reserva (mapa ⇄ formulario)
lib/                        # validations/ (zod), permisos, roles, sanitize, formato, geocoding…
server/                     # SOLO servidor
  auth.ts                   #   better-auth (credenciales + Google, linking, anti-bot)
  trpc.ts                   #   contexto + middlewares (auth, rol, permiso, rate limit)
  routers/                  #   un router tRPC por dominio + _app.ts
  services/                 #   tarifa, email, notificaciones, permisos, códigos
prisma/                     # schema, migraciones, seed
proxy.ts                    # middleware de Next 16 (protección de rutas)
docker-compose.yml          # db + mailpit + migrate + app
```

---

## Decisiones técnicas

- **Reservar requiere sesión**: `reservas.crear` y `alquiler.crear` son
  procedimientos protegidos; el contacto se toma del perfil del usuario, no del
  formulario. El único flujo anónimo es consultar una reserva por su código.
- **Roles unificados (admin superconjunto)**: los roles siguen siendo
  `CLIENTE | CHOFER | ADMIN`, pero `requireRole` deja pasar a un ADMIN a
  cualquier portal, y el menú de usuario ofrece un **selector de portal**. Así
  un admin puede además operar como chofer sin necesidad de multi-rol. La
  navegación de los tres portales vive en `lib/navegacion.ts` (sin duplicar).
- **Permisos**: catálogo en BD (`Permiso`) + `RolPermiso` (defaults por rol,
  editables en `/admin/permisos`) + `UserPermiso` (overrides individuales).
  Permisos efectivos = rol ± overrides. Salvaguardas: ADMIN no puede perder
  `gestionar_permisos` ni desactivarse a sí mismo.
- **Tarifa**: siempre calculada en servidor (OSRM público para distancia de
  ruta, fallback haversine × 1.3). La UI aclara que es estimada y el cobro
  real es por taxímetro.
- **Aceptación sin carreras**: update condicional sobre estado `PENDIENTE`;
  el segundo chofer recibe un CONFLICT claro.
- **Email**: Nodemailer sobre SMTP genérico (sin API key), deshabilitable por
  completo. Mailpit para desarrollo.
- **Mapa**: Leaflet + OSM + Nominatim, todo sin API keys.
- **Chat**: beta explícita, polling 5s, solo participantes de la reserva.

## Limitaciones conocidas (prototipo)

- Rate limiting y buckets en memoria: válidos para una sola instancia.
- Polling en lugar de websockets/SSE para notificaciones y chat.
- Nominatim/OSRM públicos: sin SLA, con límites de peticiones.
- Push web no implementado (extra opcional; iría con Web Push API + service
  worker, sin apps nativas).
- Sin verificación de email ni recuperación de contraseña (better-auth lo
  soporta; requiere servicio de correo configurado).
