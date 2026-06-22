import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Starting seed process...");

  // 1. SEED DRUGS
  console.log("Seeding Drugs...");
  const drugsData = [
    { name: "Aspirin", genericName: "Acetylsalicylic acid", indications: "Pain relief, fever, inflammation", dosage: "81mg, 325mg", contraindications: "Bleeding disorders", sideEffects: "GI upset", interactions: "Warfarin" },
    { name: "Warfarin", genericName: "Warfarin sodium", indications: "Anticoagulant", dosage: "1mg, 5mg", contraindications: "Active bleeding", sideEffects: "Hemorrhage", interactions: "Aspirin, NSAIDs" },
    { name: "Ibuprofen", genericName: "Ibuprofen", indications: "Pain relief, fever", dosage: "200mg, 400mg", contraindications: "Peptic ulcer", sideEffects: "Stomach pain", interactions: "Aspirin" },
    { name: "Lisinopril", genericName: "Lisinopril", indications: "Hypertension", dosage: "10mg, 20mg", contraindications: "Pregnancy", sideEffects: "Dry cough", interactions: "Potassium supplements" },
    { name: "Metformin", genericName: "Metformin hydrochloride", indications: "Type 2 diabetes", dosage: "500mg, 1000mg", contraindications: "Severe renal dysfunction", sideEffects: "Diarrhea", interactions: "Contrast media" },
    { name: "Atorvastatin", genericName: "Atorvastatin calcium", indications: "Hyperlipidemia", dosage: "20mg, 40mg", contraindications: "Active liver disease", sideEffects: "Muscle pain", interactions: "Grapefruit juice" },
    { name: "Amoxicillin", genericName: "Amoxicillin", indications: "Bacterial infections", dosage: "500mg", contraindications: "Penicillin allergy", sideEffects: "Rash, diarrhea", interactions: "Methotrexate" },
    { name: "Omeprazole", genericName: "Omeprazole", indications: "GERD", dosage: "20mg", contraindications: "Hypersensitivity", sideEffects: "Headache", interactions: "Clopidogrel" },
  ];

  for (const d of drugsData) {
    await prisma.drug.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    });
  }
  console.log("Drugs seeded successfully.");

  // 2. SEED DOCTORS
  console.log("Seeding Doctors...");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("password123", salt);

  const doctorsData = [
    {
      fullName: "Dr. Aisha Khan",
      email: "aisha.khan@example.com",
      password: hashedPassword,
      phoneNumber: "+923001234561",
      pmdcNumber: "PMDC-1001",
      verificationStatus: "VERIFIED",
      specialization: "Cardiology",
      hospital: "Aga Khan University Hospital",
      city: "Karachi",
      experienceYears: 15,
      profileImage: "https://i.pravatar.cc/150?img=1"
    },
    {
      fullName: "Dr. Bilal Ahmed",
      email: "bilal.ahmed@example.com",
      password: hashedPassword,
      phoneNumber: "+923001234562",
      pmdcNumber: "PMDC-1002",
      verificationStatus: "VERIFIED",
      specialization: "Neurology",
      hospital: "Shifa International",
      city: "Islamabad",
      experienceYears: 10,
      profileImage: "https://i.pravatar.cc/150?img=11"
    },
    {
      fullName: "Dr. Sana Tariq",
      email: "sana.tariq@example.com",
      password: hashedPassword,
      phoneNumber: "+923001234563",
      pmdcNumber: "PMDC-1003",
      verificationStatus: "VERIFIED",
      specialization: "Dermatology",
      hospital: "Doctors Hospital",
      city: "Lahore",
      experienceYears: 8,
      profileImage: "https://i.pravatar.cc/150?img=5"
    },
    {
      fullName: "Dr. Omar Farooq",
      email: "omar.farooq@example.com",
      password: hashedPassword,
      phoneNumber: "+923001234564",
      pmdcNumber: "PMDC-1004",
      verificationStatus: "VERIFIED",
      specialization: "Pediatrics",
      hospital: "Ziauddin Hospital",
      city: "Karachi",
      experienceYears: 12,
      profileImage: "https://i.pravatar.cc/150?img=8"
    },
    {
      fullName: "Dr. Fatima Jinnah",
      email: "fatima.jinnah@example.com",
      password: hashedPassword,
      phoneNumber: "+923001234565",
      pmdcNumber: "PMDC-1005",
      verificationStatus: "VERIFIED",
      specialization: "Endocrinology",
      hospital: "Jinnah Hospital",
      city: "Lahore",
      experienceYears: 20,
      profileImage: "https://i.pravatar.cc/150?img=9"
    }
  ];

  for (const doc of doctorsData) {
    await prisma.doctor.upsert({
      where: { email: doc.email },
      update: {
        verificationStatus: "VERIFIED", // Ensure verified
        specialization: doc.specialization,
        hospital: doc.hospital,
        city: doc.city,
      },
      create: doc,
    });
  }
  console.log("Doctors seeded successfully.");

  console.log("Seed process completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
