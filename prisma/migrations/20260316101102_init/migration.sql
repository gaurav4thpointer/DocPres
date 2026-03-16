-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MedicineForm" AS ENUM ('TABLET', 'CAPSULE', 'SYRUP', 'OINTMENT', 'DROPS', 'INJECTION', 'POWDER', 'LOTION', 'OTHER');

-- CreateEnum
CREATE TYPE "MedicineTiming" AS ENUM ('BEFORE_FOOD', 'AFTER_FOOD', 'EMPTY_STOMACH', 'ANYTIME');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('DRAFT', 'FINALIZED');

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qualification" TEXT,
    "specialization" TEXT,
    "registrationNo" TEXT,
    "mobile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicSettings" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "clinicName" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "logoPath" TEXT,
    "signaturePath" TEXT,
    "stampPath" TEXT,
    "footerText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender" NOT NULL,
    "mobile" TEXT,
    "address" TEXT,
    "allergies" TEXT,
    "chronicConditions" TEXT,
    "notes" TEXT,
    "weight" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "form" "MedicineForm" NOT NULL DEFAULT 'TABLET',
    "strength" TEXT,
    "defaultDosage" TEXT,
    "defaultFrequency" TEXT,
    "defaultDuration" TEXT,
    "defaultTiming" "MedicineTiming" NOT NULL DEFAULT 'AFTER_FOOD',
    "defaultInstructions" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'DRAFT',
    "prescriptionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chiefComplaints" TEXT,
    "diagnosis" TEXT,
    "clinicalNotes" TEXT,
    "investigations" TEXT,
    "generalAdvice" TEXT,
    "followUpDate" TIMESTAMP(3),
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "medicineId" TEXT,
    "medicineName" TEXT NOT NULL,
    "strength" TEXT,
    "dosage" TEXT,
    "frequency" TEXT,
    "duration" TEXT,
    "timing" "MedicineTiming",
    "route" TEXT,
    "instructions" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdviceTemplate" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdviceTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicSettings_doctorId_key" ON "ClinicSettings"("doctorId");

-- AddForeignKey
ALTER TABLE "ClinicSettings" ADD CONSTRAINT "ClinicSettings_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdviceTemplate" ADD CONSTRAINT "AdviceTemplate_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
