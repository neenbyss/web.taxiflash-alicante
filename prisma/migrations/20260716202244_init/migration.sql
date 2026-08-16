-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENTE', 'CHOFER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReservaEstado" AS ENUM ('PENDIENTE', 'ACEPTADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "ReservaTipo" AS ENUM ('INMEDIATA', 'PROGRAMADA');

-- CreateEnum
CREATE TYPE "AlquilerEstado" AS ENUM ('A_CONFIRMAR', 'CONFIRMADO', 'RECHAZADO', 'CANCELADO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "NotificacionCanal" AS ENUM ('IN_APP', 'EMAIL');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENTE',
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "vehiculoPreferido" TEXT,
    "notasPreferencias" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro_cuenta" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registro_cuenta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permiso" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "permisoId" TEXT NOT NULL,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permiso" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permisoId" TEXT NOT NULL,
    "concedido" BOOLEAN NOT NULL,

    CONSTRAINT "user_permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "ReservaEstado" NOT NULL DEFAULT 'PENDIENTE',
    "tipo" "ReservaTipo" NOT NULL DEFAULT 'INMEDIATA',
    "clienteId" TEXT,
    "nombreContacto" TEXT NOT NULL,
    "telefonoContacto" TEXT,
    "emailContacto" TEXT,
    "choferId" TEXT,
    "fechaProgramada" TIMESTAMP(3),
    "origenDireccion" TEXT NOT NULL,
    "origenLat" DOUBLE PRECISION NOT NULL,
    "origenLng" DOUBLE PRECISION NOT NULL,
    "destinoDireccion" TEXT NOT NULL,
    "destinoLat" DOUBLE PRECISION NOT NULL,
    "destinoLng" DOUBLE PRECISION NOT NULL,
    "paradas" JSONB NOT NULL DEFAULT '[]',
    "distanciaKm" DOUBLE PRECISION,
    "tarifaEstimada" DOUBLE PRECISION,
    "notas" TEXT,
    "motivoEstado" TEXT,
    "aceptadaEn" TIMESTAMP(3),
    "iniciadaEn" TIMESTAMP(3),
    "finalizadaEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alquiler_entre_ciudades" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "AlquilerEstado" NOT NULL DEFAULT 'A_CONFIRMAR',
    "clienteId" TEXT,
    "nombreContacto" TEXT NOT NULL,
    "telefonoContacto" TEXT,
    "emailContacto" TEXT,
    "choferId" TEXT,
    "ciudadOrigen" TEXT NOT NULL,
    "ciudadDestino" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "modalidad" TEXT NOT NULL,
    "horas" INTEGER,
    "notas" TEXT,
    "precioConfirmado" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alquiler_entre_ciudades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "canal" "NotificacionCanal" NOT NULL DEFAULT 'IN_APP',
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensaje" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resena" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "choferId" TEXT,
    "puntuacion" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "oculta" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resena_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "registro_cuenta_ip_createdAt_idx" ON "registro_cuenta"("ip", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_codigo_key" ON "permiso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "rol_permiso_role_permisoId_key" ON "rol_permiso"("role", "permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "user_permiso_userId_permisoId_key" ON "user_permiso"("userId", "permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "reserva_codigo_key" ON "reserva"("codigo");

-- CreateIndex
CREATE INDEX "reserva_estado_createdAt_idx" ON "reserva"("estado", "createdAt");

-- CreateIndex
CREATE INDEX "reserva_clienteId_idx" ON "reserva"("clienteId");

-- CreateIndex
CREATE INDEX "reserva_choferId_idx" ON "reserva"("choferId");

-- CreateIndex
CREATE UNIQUE INDEX "alquiler_entre_ciudades_codigo_key" ON "alquiler_entre_ciudades"("codigo");

-- CreateIndex
CREATE INDEX "alquiler_entre_ciudades_estado_createdAt_idx" ON "alquiler_entre_ciudades"("estado", "createdAt");

-- CreateIndex
CREATE INDEX "alquiler_entre_ciudades_clienteId_idx" ON "alquiler_entre_ciudades"("clienteId");

-- CreateIndex
CREATE INDEX "notificacion_userId_leida_createdAt_idx" ON "notificacion"("userId", "leida", "createdAt");

-- CreateIndex
CREATE INDEX "mensaje_reservaId_createdAt_idx" ON "mensaje"("reservaId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "resena_reservaId_key" ON "resena"("reservaId");

-- CreateIndex
CREATE INDEX "resena_choferId_idx" ON "resena"("choferId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permiso" ADD CONSTRAINT "user_permiso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permiso" ADD CONSTRAINT "user_permiso_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alquiler_entre_ciudades" ADD CONSTRAINT "alquiler_entre_ciudades_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alquiler_entre_ciudades" ADD CONSTRAINT "alquiler_entre_ciudades_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "mensaje_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reserva"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "mensaje_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resena" ADD CONSTRAINT "resena_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reserva"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resena" ADD CONSTRAINT "resena_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resena" ADD CONSTRAINT "resena_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
