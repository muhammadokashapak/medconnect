import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Create a super admin doctor if it doesn't exist
    let admin = await prisma.doctor.findFirst({
      where: { role: "SUPER_ADMIN" }
    });

    if (!admin) {
      admin = await prisma.doctor.create({
        data: {
          fullName: "System Admin",
          email: "admin@medconnect.com",
          phoneNumber: "0000000000",
          pmdcNumber: "ADMIN001",
          password: "password123", // In real app, hash this
          isVerified: true,
          role: "SUPER_ADMIN",
          specialization: "Administration",
        }
      });
    }

    // 2. Create Hospitals
    const hospital1 = await prisma.hospital.create({
      data: {
        name: "Aga Khan University Hospital",
        city: "Karachi",
        address: "Stadium Road, Karachi",
        phone: "021-111-911-911",
        email: "info@akuh.edu.pk",
        website: "https://hospitals.aku.edu",
        description: "Aga Khan University Hospital is a premier quaternary care hospital.",
      }
    });

    const hospital2 = await prisma.hospital.create({
      data: {
        name: "Shifa International Hospital",
        city: "Islamabad",
        address: "Sector H-8/4, Islamabad",
        phone: "051-8463666",
        email: "info@shifa.com.pk",
        website: "https://www.shifa.com.pk",
        description: "Shifa International Hospital is a 500-bed tertiary care facility.",
      }
    });

    // 3. Create Departments
    const dept1 = await prisma.department.create({
      data: {
        name: "Cardiology",
        description: "Comprehensive cardiac care.",
        hospitalId: hospital1.id
      }
    });

    const dept2 = await prisma.department.create({
      data: {
        name: "Neurology",
        description: "Advanced neurological treatments.",
        hospitalId: hospital1.id
      }
    });

    // 4. Create Organizations
    const org1 = await prisma.organization.create({
      data: {
        name: "Pakistan Medical Association",
        type: "PROFESSIONAL_SOCIETY",
        description: "The representative body of medical practitioners in Pakistan.",
        website: "https://www.pma.org.pk",
      }
    });

    // 5. Create Announcements & Events
    await prisma.hospitalAnnouncement.create({
      data: {
        hospitalId: hospital1.id,
        title: "New Cardiology Wing Opening",
        content: "We are excited to announce the opening of our new state-of-the-art Cardiology wing next month.",
        type: "GENERAL"
      }
    });

    await prisma.hospitalEvent.create({
      data: {
        hospitalId: hospital1.id,
        title: "Annual Medical Symposium 2026",
        description: "Join us for the annual gathering of medical professionals.",
        date: new Date("2026-12-01T09:00:00Z"),
        location: "Main Auditorium, AKUH"
      }
    });

    // 6. Create CME Courses
    await prisma.cMECourse.create({
      data: {
        title: "Advanced Cardiac Life Support (ACLS) Certification",
        description: "An interactive course for healthcare providers on managing cardiovascular emergencies.",
        credits: 10,
        date: new Date("2026-10-15T09:00:00Z"),
        provider: "American Heart Association via AKUH"
      }
    });

    await prisma.cMECourse.create({
      data: {
        title: "Ethics in Modern Medicine",
        description: "A comprehensive look at ethical dilemmas in the age of AI and telemedicine.",
        credits: 5,
        date: new Date("2026-11-05T10:00:00Z"),
        provider: "Pakistan Medical Association"
      }
    });

    return NextResponse.json({ message: "Phase 10 Seed Data Created Successfully!" }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Seed Failed", error: String(error) }, { status: 500 });
  }
}
