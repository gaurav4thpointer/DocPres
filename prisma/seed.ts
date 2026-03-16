import { PrismaClient, Gender, MedicineForm, MedicineTiming, PrescriptionStatus, PrescriptionType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing data
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.adviceTemplate.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.clinicSettings.deleteMany();
  await prisma.doctor.deleteMany();

  // Doctor
  const passwordHash = await bcrypt.hash("doctor123", 12);
  const doctor = await prisma.doctor.create({
    data: {
      email: "dr.sharma@clinic.com",
      password: passwordHash,
      name: "Rajiv Sharma",
      qualification: "MBBS, MD (Internal Medicine)",
      specialization: "General Physician & Diabetologist",
      registrationNo: "MH-12345",
      mobile: "+91 98765 43210",
    },
  });

  // Clinic Settings
  await prisma.clinicSettings.create({
    data: {
      doctorId: doctor.id,
      clinicName: "Sharma Medical Centre",
      address: "101, Saraswati Building, MG Road, Pune - 411001, Maharashtra",
      phone: "020-27654321",
      footerText:
        "This prescription is valid for 30 days. Follow the prescribed dosage strictly. Consult doctor if symptoms persist or worsen.",
    },
  });

  // Medicines
  const medicines = await prisma.medicine.createManyAndReturn({
    data: [
      {
        doctorId: doctor.id,
        name: "Paracetamol",
        genericName: "Acetaminophen",
        form: MedicineForm.TABLET,
        strength: "500mg",
        defaultDosage: "1 tablet",
        defaultFrequency: "Thrice daily (TDS)",
        defaultDuration: "5 days",
        defaultTiming: MedicineTiming.AFTER_FOOD,
        defaultInstructions: "For fever and pain",
        isFavorite: true,
      },
      {
        doctorId: doctor.id,
        name: "Cetirizine",
        genericName: "Cetirizine HCl",
        form: MedicineForm.TABLET,
        strength: "10mg",
        defaultDosage: "1 tablet",
        defaultFrequency: "Once daily (OD)",
        defaultDuration: "7 days",
        defaultTiming: MedicineTiming.AFTER_FOOD,
        defaultInstructions: "For allergy and cold",
        isFavorite: true,
      },
      {
        doctorId: doctor.id,
        name: "Amoxicillin",
        genericName: "Amoxicillin Trihydrate",
        form: MedicineForm.CAPSULE,
        strength: "500mg",
        defaultDosage: "1 capsule",
        defaultFrequency: "Thrice daily (TDS)",
        defaultDuration: "7 days",
        defaultTiming: MedicineTiming.AFTER_FOOD,
        defaultInstructions: "Complete the full course",
        isFavorite: false,
      },
      {
        doctorId: doctor.id,
        name: "Metformin",
        genericName: "Metformin HCl",
        form: MedicineForm.TABLET,
        strength: "500mg",
        defaultDosage: "1 tablet",
        defaultFrequency: "Twice daily (BD)",
        defaultDuration: "Continue",
        defaultTiming: MedicineTiming.AFTER_FOOD,
        defaultInstructions: "For blood sugar control",
        isFavorite: true,
      },
      {
        doctorId: doctor.id,
        name: "Amlodipine",
        genericName: "Amlodipine Besylate",
        form: MedicineForm.TABLET,
        strength: "5mg",
        defaultDosage: "1 tablet",
        defaultFrequency: "Once daily (OD)",
        defaultDuration: "Continue",
        defaultTiming: MedicineTiming.AFTER_FOOD,
        defaultInstructions: "For blood pressure",
        isFavorite: true,
      },
      {
        doctorId: doctor.id,
        name: "Pantoprazole",
        genericName: "Pantoprazole Sodium",
        form: MedicineForm.TABLET,
        strength: "40mg",
        defaultDosage: "1 tablet",
        defaultFrequency: "Once daily (OD)",
        defaultDuration: "14 days",
        defaultTiming: MedicineTiming.EMPTY_STOMACH,
        defaultInstructions: "Take 30 minutes before breakfast",
        isFavorite: true,
      },
      {
        doctorId: doctor.id,
        name: "Azithromycin",
        genericName: "Azithromycin Dihydrate",
        form: MedicineForm.TABLET,
        strength: "500mg",
        defaultDosage: "1 tablet",
        defaultFrequency: "Once daily (OD)",
        defaultDuration: "5 days",
        defaultTiming: MedicineTiming.AFTER_FOOD,
        defaultInstructions: "For respiratory infections",
        isFavorite: false,
      },
      {
        doctorId: doctor.id,
        name: "Montelukast",
        genericName: "Montelukast Sodium",
        form: MedicineForm.TABLET,
        strength: "10mg",
        defaultDosage: "1 tablet",
        defaultFrequency: "Once daily (OD)",
        defaultDuration: "1 month",
        defaultTiming: MedicineTiming.ANYTIME,
        defaultInstructions: "At bedtime for asthma / allergic rhinitis",
        isFavorite: false,
      },
      {
        doctorId: doctor.id,
        name: "Vitamin D3",
        genericName: "Cholecalciferol",
        form: MedicineForm.CAPSULE,
        strength: "60000 IU",
        defaultDosage: "1 capsule",
        defaultFrequency: "Once weekly",
        defaultDuration: "2 months",
        defaultTiming: MedicineTiming.AFTER_FOOD,
        defaultInstructions: "Take with milk",
        isFavorite: false,
      },
      {
        doctorId: doctor.id,
        name: "Atorvastatin",
        genericName: "Atorvastatin Calcium",
        form: MedicineForm.TABLET,
        strength: "10mg",
        defaultDosage: "1 tablet",
        defaultFrequency: "Once daily (OD)",
        defaultDuration: "Continue",
        defaultTiming: MedicineTiming.AFTER_FOOD,
        defaultInstructions: "Take at bedtime for cholesterol",
        isFavorite: false,
      },
      {
        doctorId: doctor.id,
        name: "Ibuprofen",
        genericName: "Ibuprofen",
        form: MedicineForm.TABLET,
        strength: "400mg",
        defaultDosage: "1 tablet",
        defaultFrequency: "Thrice daily (TDS)",
        defaultDuration: "5 days",
        defaultTiming: MedicineTiming.AFTER_FOOD,
        defaultInstructions: "For pain and inflammation",
        isFavorite: false,
      },
      {
        doctorId: doctor.id,
        name: "Cough Syrup (DX)",
        genericName: "Dextromethorphan + Guaifenesin",
        form: MedicineForm.SYRUP,
        strength: "100ml",
        defaultDosage: "10 ml",
        defaultFrequency: "Thrice daily (TDS)",
        defaultDuration: "7 days",
        defaultTiming: MedicineTiming.AFTER_FOOD,
        defaultInstructions: "Shake well before use",
        isFavorite: false,
      },
    ],
  });

  // Advice Templates
  await prisma.adviceTemplate.createMany({
    data: [
      {
        doctorId: doctor.id,
        title: "Fever / Viral",
        content:
          "Take adequate rest. Drink plenty of fluids (water, ORS, coconut water). Avoid cold food and drinks. Sponge bath if temperature is very high. Visit if fever exceeds 103°F or does not subside in 3 days.",
      },
      {
        doctorId: doctor.id,
        title: "Diabetes Advice",
        content:
          "Check blood sugar regularly. Follow a low-sugar, low-carb diet. Exercise 30 minutes daily (brisk walking). Avoid sweets, white rice, maida. Monitor HbA1c every 3 months.",
      },
      {
        doctorId: doctor.id,
        title: "Hypertension Advice",
        content:
          "Reduce salt intake. Avoid fried and processed food. Exercise regularly. Manage stress. Take BP medications regularly without skipping. Monitor BP daily at home.",
      },
      {
        doctorId: doctor.id,
        title: "General Wellness",
        content:
          "Maintain a balanced diet rich in vegetables and fruits. Sleep 7-8 hours daily. Drink 2-3 litres of water. Avoid smoking and alcohol. Exercise regularly.",
      },
    ],
  });

  // Patients
  const patients = await prisma.patient.createManyAndReturn({
    data: [
      {
        doctorId: doctor.id,
        fullName: "Anita Verma",
        age: 45,
        gender: Gender.FEMALE,
        mobile: "9876543001",
        address: "12, Gandhi Nagar, Pune",
        allergies: "Penicillin",
        chronicConditions: "Hypertension, Hypothyroidism",
        notes: "Patient prefers evening appointments",
        weight: 68,
      },
      {
        doctorId: doctor.id,
        fullName: "Raju Patil",
        age: 58,
        gender: Gender.MALE,
        mobile: "9876543002",
        address: "45, Shivaji Colony, Pune",
        allergies: "Sulfa drugs",
        chronicConditions: "Diabetes Type 2, Hypertension",
        notes: "Regular monthly follow-up",
        weight: 82,
      },
      {
        doctorId: doctor.id,
        fullName: "Priya Mehta",
        age: 28,
        gender: Gender.FEMALE,
        mobile: "9876543003",
        address: "7, Model Colony, Pune",
        allergies: null,
        chronicConditions: null,
        notes: "First visit - referred by Dr. Singh",
        weight: 55,
      },
      {
        doctorId: doctor.id,
        fullName: "Suresh Kumar",
        age: 35,
        gender: Gender.MALE,
        mobile: "9876543004",
        address: "22, Karve Road, Pune",
        allergies: null,
        chronicConditions: null,
        notes: null,
        weight: 75,
      },
      {
        doctorId: doctor.id,
        fullName: "Kavita Joshi",
        age: 62,
        gender: Gender.FEMALE,
        mobile: "9876543005",
        address: "89, Deccan Gymkhana, Pune",
        allergies: "NSAIDs",
        chronicConditions: "Osteoarthritis, Diabetes Type 2",
        notes: "Knee replacement surgery scheduled next year",
        weight: 71,
      },
      {
        doctorId: doctor.id,
        fullName: "Arjun Nair",
        age: 42,
        gender: Gender.MALE,
        mobile: "9876543006",
        address: "14, Koregaon Park, Pune",
        allergies: null,
        chronicConditions: "Myopia, Presbyopia",
        notes: "Wears glasses since age 16. Due for annual eye checkup.",
        weight: 78,
      },
    ],
  });

  // Prescriptions
  const metformin = medicines.find((m) => m.name === "Metformin")!;
  const amlodipine = medicines.find((m) => m.name === "Amlodipine")!;
  const pantoprazole = medicines.find((m) => m.name === "Pantoprazole")!;
  const paracetamol = medicines.find((m) => m.name === "Paracetamol")!;
  const cetirizine = medicines.find((m) => m.name === "Cetirizine")!;
  const atorvastatin = medicines.find((m) => m.name === "Atorvastatin")!;

  // Prescription 1 - Anita Verma (Finalized)
  await prisma.prescription.create({
    data: {
      doctorId: doctor.id,
      patientId: patients[0].id,
      status: PrescriptionStatus.FINALIZED,
      prescriptionDate: new Date("2025-03-10"),
      chiefComplaints: "Headache, fatigue, mild dizziness for 1 week",
      diagnosis: "Hypertension - uncontrolled, Essential",
      clinicalNotes: "BP: 158/96 mmHg. Pulse: 78 bpm. Advised dietary changes.",
      investigations: "CBC, Lipid Profile, Serum Electrolytes, ECG",
      generalAdvice:
        "Reduce salt intake. Avoid fried and processed food. Exercise regularly. Manage stress. Take BP medications regularly without skipping. Monitor BP daily at home.",
      followUpDate: new Date("2025-04-10"),
      items: {
        create: [
          {
            medicineId: amlodipine.id,
            medicineName: amlodipine.name,
            strength: amlodipine.strength!,
            dosage: amlodipine.defaultDosage!,
            frequency: amlodipine.defaultFrequency!,
            duration: amlodipine.defaultDuration!,
            timing: amlodipine.defaultTiming,
            instructions: amlodipine.defaultInstructions,
            sortOrder: 0,
          },
          {
            medicineId: pantoprazole.id,
            medicineName: pantoprazole.name,
            strength: pantoprazole.strength!,
            dosage: pantoprazole.defaultDosage!,
            frequency: pantoprazole.defaultFrequency!,
            duration: "14 days",
            timing: pantoprazole.defaultTiming,
            instructions: pantoprazole.defaultInstructions,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // Prescription 2 - Raju Patil (Finalized)
  await prisma.prescription.create({
    data: {
      doctorId: doctor.id,
      patientId: patients[1].id,
      status: PrescriptionStatus.FINALIZED,
      prescriptionDate: new Date("2025-03-12"),
      chiefComplaints: "Increased thirst, frequent urination, fatigue",
      diagnosis: "Diabetes Type 2 - uncontrolled. Hypertension - stable.",
      clinicalNotes: "FBS: 186 mg/dL, PPBS: 248 mg/dL. HbA1c: 8.2%. BP: 138/88.",
      investigations: "HbA1c, FBS, PPBS, Kidney Function Test, Urine routine",
      generalAdvice:
        "Check blood sugar regularly. Follow a low-sugar, low-carb diet. Exercise 30 minutes daily (brisk walking). Avoid sweets, white rice, maida. Monitor HbA1c every 3 months.",
      followUpDate: new Date("2025-04-12"),
      internalNotes: "Patient mentioned non-compliance with diet. Counseled again.",
      items: {
        create: [
          {
            medicineId: metformin.id,
            medicineName: metformin.name,
            strength: "1000mg",
            dosage: "1 tablet",
            frequency: "Twice daily (BD)",
            duration: "Continue",
            timing: MedicineTiming.AFTER_FOOD,
            instructions: metformin.defaultInstructions,
            sortOrder: 0,
          },
          {
            medicineId: amlodipine.id,
            medicineName: amlodipine.name,
            strength: amlodipine.strength!,
            dosage: amlodipine.defaultDosage!,
            frequency: amlodipine.defaultFrequency!,
            duration: "Continue",
            timing: amlodipine.defaultTiming,
            sortOrder: 1,
          },
          {
            medicineId: atorvastatin.id,
            medicineName: atorvastatin.name,
            strength: "20mg",
            dosage: "1 tablet",
            frequency: "Once daily (OD)",
            duration: "Continue",
            timing: MedicineTiming.AFTER_FOOD,
            instructions: "Bedtime",
            sortOrder: 2,
          },
        ],
      },
    },
  });

  // Prescription 3 - Priya Mehta (Draft - General)
  await prisma.prescription.create({
    data: {
      doctorId: doctor.id,
      patientId: patients[2].id,
      status: PrescriptionStatus.DRAFT,
      prescriptionType: PrescriptionType.GENERAL,
      prescriptionDate: new Date(),
      chiefComplaints: "Cold, runny nose, sneezing for 3 days",
      diagnosis: "Allergic Rhinitis",
      items: {
        create: [
          {
            medicineId: cetirizine.id,
            medicineName: cetirizine.name,
            strength: cetirizine.strength!,
            dosage: cetirizine.defaultDosage!,
            frequency: cetirizine.defaultFrequency!,
            duration: cetirizine.defaultDuration!,
            timing: cetirizine.defaultTiming,
            instructions: cetirizine.defaultInstructions,
            sortOrder: 0,
          },
          {
            medicineId: paracetamol.id,
            medicineName: paracetamol.name,
            strength: paracetamol.strength!,
            dosage: paracetamol.defaultDosage!,
            frequency: paracetamol.defaultFrequency!,
            duration: paracetamol.defaultDuration!,
            timing: paracetamol.defaultTiming,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // Prescription 4 - Arjun Nair (Finalized - Eye)
  const arjun = patients.find((p) => p.fullName === "Arjun Nair")!;
  await prisma.prescription.create({
    data: {
      doctorId: doctor.id,
      patientId: arjun.id,
      status: PrescriptionStatus.FINALIZED,
      prescriptionType: PrescriptionType.EYE,
      prescriptionDate: new Date("2025-03-14"),
      chiefComplaints: "Blurring of vision, difficulty reading fine print, mild headache",
      diagnosis: "Myopia with Presbyopia, Bilateral",
      clinicalNotes: "IOP: RE 14 mmHg, LE 15 mmHg. Fundus normal. Slit lamp: clear media.",
      generalAdvice:
        "Use anti-glare screen protectors. Maintain 50 cm reading distance. Avoid prolonged screen exposure. Wear recommended glasses consistently.",
      followUpDate: new Date("2025-09-14"),
      templateData: {
        visionRight: "6/12",
        visionLeft: "6/9",
        rightEyeSphere: "-3.50",
        leftEyeSphere: "-2.75",
        rightEyeCylinder: "-0.75",
        leftEyeCylinder: "-0.50",
        rightEyeAxis: "180",
        leftEyeAxis: "175",
        rightEyeAdd: "+2.00",
        leftEyeAdd: "+2.00",
        rightEyePrism: "",
        leftEyePrism: "",
        pd: "64 mm (32 / 32)",
        diagnosisDetails: "Myopia with Presbyopia, Bilateral",
        lensAdvice: "Progressive lenses with anti-reflective coating",
        frameAdvice: "Full frame recommended for progressive lenses",
        remarks: "Review after 6 months. Continue current glasses until new pair is ready.",
      },
      items: {
        create: [
          {
            medicineName: "Lubricating Eye Drops (Carboxymethylcellulose 0.5%)",
            strength: "10 ml",
            dosage: "1 drop each eye",
            frequency: "Four times daily (QID)",
            duration: "1 month",
            timing: MedicineTiming.ANYTIME,
            instructions: "Instill before screen use and at bedtime",
            sortOrder: 0,
          },
        ],
      },
    },
  });

  // Prescription 5 - Suresh Kumar (Draft - General)
  await prisma.prescription.create({
    data: {
      doctorId: doctor.id,
      patientId: patients[3].id,
      status: PrescriptionStatus.DRAFT,
      prescriptionType: PrescriptionType.GENERAL,
      prescriptionDate: new Date(),
      chiefComplaints: "Mild fever, body ache, sore throat for 2 days",
      diagnosis: "Viral fever, Pharyngitis",
      investigations: "CBC with differential, Throat swab culture",
      items: {
        create: [
          {
            medicineId: paracetamol.id,
            medicineName: paracetamol.name,
            strength: paracetamol.strength!,
            dosage: paracetamol.defaultDosage!,
            frequency: paracetamol.defaultFrequency!,
            duration: "5 days",
            timing: paracetamol.defaultTiming,
            instructions: paracetamol.defaultInstructions,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  console.log("✅ Seed complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Email:    dr.sharma@clinic.com");
  console.log("   Password: doctor123");
  console.log(`\n👨‍⚕️  Doctor: Dr. ${doctor.name}`);
  console.log(`👥  Patients: ${patients.length}`);
  console.log(`💊  Medicines: ${medicines.length}`);
  console.log(`📄  Prescriptions: 5 (3 finalized, 2 draft)`);
  console.log(`     - 4 General Prescriptions`);
  console.log(`     - 1 Eye Prescription (Arjun Nair, Finalized)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
