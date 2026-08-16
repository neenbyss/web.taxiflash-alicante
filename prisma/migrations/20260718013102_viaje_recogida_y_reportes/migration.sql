-- CreateEnum
CREATE TYPE "ReporteEstado" AS ENUM ('ABIERTO', 'EN_REVISION', 'RESUELTO');

-- AlterTable
ALTER TABLE "reserva" ADD COLUMN     "choferEnCaminoEn" TIMESTAMP(3),
ADD COLUMN     "choferLlegoEn" TIMESTAMP(3),
ADD COLUMN     "clienteSaleEn" TIMESTAMP(3),
ADD COLUMN     "esperaHasta" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "reporte" (
    "id" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "reservaId" TEXT,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "ReporteEstado" NOT NULL DEFAULT 'ABIERTO',
    "notaAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reporte_estado_createdAt_idx" ON "reporte"("estado", "createdAt");

-- AddForeignKey
ALTER TABLE "reporte" ADD CONSTRAINT "reporte_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporte" ADD CONSTRAINT "reporte_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reserva"("id") ON DELETE SET NULL ON UPDATE CASCADE;
