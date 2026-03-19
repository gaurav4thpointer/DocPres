-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CLINIC', 'DOCTOR');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "logoPath" TEXT,
    "footerText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_slug_key" ON "Clinic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_email_key" ON "Clinic"("email");

-- Step 1: Add clinicId to Doctor (nullable)
ALTER TABLE "Doctor" ADD COLUMN "clinicId" TEXT;

-- Step 2: Create one clinic per doctor from existing data
INSERT INTO "Clinic" ("id", "name", "slug", "email", "password", "address", "phone", "logoPath", "footerText", "isActive", "createdAt", "updatedAt")
SELECT 
    'clinic_' || d."id",
    COALESCE(cs."clinicName", d."name" || ' Clinic'),
    'clinic-' || LOWER(REPLACE(REPLACE(d."id", '-', ''), ' ', '')),
    'clinic-' || d."id" || '@docpres.local',
    d."password",
    cs."address",
    cs."phone",
    cs."logoPath",
    cs."footerText",
    true,
    NOW(),
    NOW()
FROM "Doctor" d
LEFT JOIN "ClinicSettings" cs ON cs."doctorId" = d."id";

-- Step 3: Update Doctor with clinicId
UPDATE "Doctor" SET "clinicId" = 'clinic_' || "id";

-- Step 4: Make Doctor.clinicId NOT NULL and add FK
ALTER TABLE "Doctor" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Drop Doctor email unique, add composite unique
DROP INDEX IF EXISTS "Doctor_email_key";
CREATE UNIQUE INDEX "Doctor_clinicId_email_key" ON "Doctor"("clinicId", "email");

-- Step 6: Add clinicId to ClinicSettings
ALTER TABLE "ClinicSettings" ADD COLUMN "clinicId" TEXT;
UPDATE "ClinicSettings" cs SET "clinicId" = d."clinicId" FROM "Doctor" d WHERE cs."doctorId" = d."id";
ALTER TABLE "ClinicSettings" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "ClinicSettings" ADD CONSTRAINT "ClinicSettings_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Add clinicId to Patient
ALTER TABLE "Patient" ADD COLUMN "clinicId" TEXT;
UPDATE "Patient" p SET "clinicId" = d."clinicId" FROM "Doctor" d WHERE p."doctorId" = d."id";
ALTER TABLE "Patient" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 8: Add clinicId to Medicine
ALTER TABLE "Medicine" ADD COLUMN "clinicId" TEXT;
UPDATE "Medicine" m SET "clinicId" = d."clinicId" FROM "Doctor" d WHERE m."doctorId" = d."id";
ALTER TABLE "Medicine" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 9: Add clinicId to Prescription
ALTER TABLE "Prescription" ADD COLUMN "clinicId" TEXT;
UPDATE "Prescription" pr SET "clinicId" = d."clinicId" FROM "Doctor" d WHERE pr."doctorId" = d."id";
ALTER TABLE "Prescription" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 10: Add clinicId to AdviceTemplate
ALTER TABLE "AdviceTemplate" ADD COLUMN "clinicId" TEXT;
UPDATE "AdviceTemplate" a SET "clinicId" = d."clinicId" FROM "Doctor" d WHERE a."doctorId" = d."id";
ALTER TABLE "AdviceTemplate" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "AdviceTemplate" ADD CONSTRAINT "AdviceTemplate_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 11: Drop isAdmin from Doctor (replaced by Admin model)
ALTER TABLE "Doctor" DROP COLUMN IF EXISTS "isAdmin";
