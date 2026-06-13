import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // 1. Get an existing Doctor (acting as the admin/primary doctor for seed data)
    const doctor = await prisma.doctor.findFirst();
    if (!doctor) {
      return NextResponse.json({ message: "No doctor found to attach seed data. Register a doctor first." }, { status: 400 });
    }

    // 2. Get an existing Hospital
    let hospital = await prisma.hospital.findFirst();
    if (!hospital) {
      hospital = await prisma.hospital.create({
        data: {
          name: "City General Hospital",
          city: "Metropolis",
          description: "Main medical center"
        }
      });
    }

    // --- PHASE 11: PATIENTS & EHR ---
    const p1 = await prisma.patient.upsert({
      where: { mrn: "MRN-1001" },
      update: {},
      create: {
        mrn: "MRN-1001",
        fullName: "John Doe",
        gender: "Male",
        dob: new Date("1980-05-15"),
        bloodGroup: "O+",
        phone: "555-0101",
        doctorId: doctor.id,
        medicalHistory: {
          create: {
            chronicDiseases: "Hypertension",
            surgeries: "Appendectomy (2010)",
            smokingStatus: "Never",
            alcoholUse: "Occasional"
          }
        },
        allergies: {
          create: [
            { allergen: "Penicillin", severity: "High", reaction: "Rash" }
          ]
        },
        vitalSigns: {
          create: [
            { bp: "120/80", pulse: 72, temperature: 98.6, weight: 80 }
          ]
        }
      }
    });

    const p2 = await prisma.patient.upsert({
      where: { mrn: "MRN-1002" },
      update: {},
      create: {
        mrn: "MRN-1002",
        fullName: "Jane Smith",
        gender: "Female",
        dob: new Date("1992-08-22"),
        bloodGroup: "A-",
        phone: "555-0202",
        doctorId: doctor.id,
        medicalHistory: {
          create: {
            chronicDiseases: "Asthma",
            smokingStatus: "Former",
          }
        }
      }
    });

    // --- PHASE 13: HOSPITAL ERP (Staff, Ward, Bed, Inventory) ---
    const staff1 = await prisma.staff.upsert({
      where: { email: "nurse.joy@hospital.com" },
      update: {},
      create: {
        fullName: "Nurse Joy",
        email: "nurse.joy@hospital.com",
        phone: "555-9001",
        role: "NURSE",
        password: "hashedpassword123",
        hospitalId: hospital.id
      }
    });

    const staff2 = await prisma.staff.upsert({
      where: { email: "lab.tech@hospital.com" },
      update: {},
      create: {
        fullName: "Mike Tech",
        email: "lab.tech@hospital.com",
        phone: "555-9002",
        role: "LAB_TECH",
        password: "hashedpassword123",
        hospitalId: hospital.id
      }
    });

    let ward = await prisma.ward.findFirst({ where: { hospitalId: hospital.id } });
    if (!ward) {
      ward = await prisma.ward.create({
        data: {
          name: "General Ward A",
          hospitalId: hospital.id,
          rooms: {
            create: [
              {
                number: "101",
                type: "GENERAL",
                beds: {
                  create: [
                    { number: "101-A", status: "AVAILABLE" },
                    { number: "101-B", status: "OCCUPIED" }
                  ]
                }
              },
              {
                number: "ICU-1",
                type: "ICU",
                beds: {
                  create: [
                    { number: "ICU-Bed-1", status: "AVAILABLE" }
                  ]
                }
              }
            ]
          }
        }
      });
    }

    let supplier = await prisma.supplier.findFirst();
    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: "MedEquip Suppliers Inc.",
          contactInfo: "contact@medequip.com"
        }
      });

      await prisma.inventoryItem.createMany({
        data: [
          { name: "Paracetamol 500mg", category: "MEDICINE", quantity: 500, unitPrice: 0.10, supplierId: supplier.id },
          { name: "Surgical Masks", category: "CONSUMABLE", quantity: 1000, unitPrice: 0.05, supplierId: supplier.id },
          { name: "Syringes 5ml", category: "CONSUMABLE", quantity: 200, unitPrice: 0.20, supplierId: supplier.id }
        ]
      });
    }

    return NextResponse.json({ message: "Phases 11-14 Seed Data Created Successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ message: "Server Error", error: String(error) }, { status: 500 });
  }
}
