-- CreateEnum
CREATE TYPE "PrescriptionType" AS ENUM ('GENERAL', 'EYE');

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "prescriptionType" "PrescriptionType" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "templateData" JSONB;
