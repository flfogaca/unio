-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('paciente', 'dentista', 'psicologo', 'medico', 'admin');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('em_fila', 'em_atendimento', 'finalizado', 'cancelado');

-- CreateEnum
CREATE TYPE "ConsultationPriority" AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- CreateEnum
CREATE TYPE "Specialty" AS ENUM ('psicologo', 'dentista', 'medico_clinico');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cro" TEXT,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT,
    "specialty" "Specialty" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'em_fila',
    "priority" "ConsultationPriority" NOT NULL DEFAULT 'media',
    "position" INTEGER NOT NULL DEFAULT 1,
    "estimatedWaitTime" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "roomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "specialty" "Specialty" NOT NULL,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "prescription" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "vitalSigns" JSONB,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "sharedWith" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_call_rooms" (
    "id" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_call_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_call_participants" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "video_call_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consultationId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_statistics" (
    "id" TEXT NOT NULL,
    "specialty" "Specialty" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalInQueue" INTEGER NOT NULL DEFAULT 0,
    "totalInProgress" INTEGER NOT NULL DEFAULT 0,
    "totalFinished" INTEGER NOT NULL DEFAULT 0,
    "averageWaitTime" INTEGER NOT NULL DEFAULT 0,
    "averageDuration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_consultationId_key" ON "medical_records"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "video_call_rooms_consultationId_key" ON "video_call_rooms"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "video_call_rooms_roomId_key" ON "video_call_rooms"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "video_call_participants_roomId_userId_key" ON "video_call_participants"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "queue_statistics_specialty_date_key" ON "queue_statistics"("specialty", "date");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_call_participants" ADD CONSTRAINT "video_call_participants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "video_call_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_call_participants" ADD CONSTRAINT "video_call_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
