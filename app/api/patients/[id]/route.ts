import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!";

function getUserIdFromToken(req: Request): string | null {
  const tokenCookie = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("medconnect_token="));
  if (!tokenCookie) return null;
  const token = tokenCookie.split("=")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch (error) {
    return null;
  }
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const patientId = params?.id;
    if (!patientId) return NextResponse.json({ message: "Missing Patient ID" }, { status: 400 });

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        medicalHistory: true,
        allergies: true,
        medications: {
          orderBy: { name: "asc" }
        },
        diagnoses: {
          orderBy: { diagnosedAt: "desc" }
        },
        vitalSigns: {
          orderBy: { recordedAt: "desc" },
          take: 10
        },
        labResults: {
          orderBy: { date: "desc" }
        },
        prescriptions: {
          orderBy: { issuedAt: "desc" }
        },
        immunizations: {
          orderBy: { dateAdministered: "desc" }
        },
        clinicalVisits: {
          orderBy: { visitedAt: "desc" },
          include: { doctor: { select: { fullName: true } } }
        }
      }
    });

    if (!patient) return NextResponse.json({ message: "Not Found" }, { status: 404 });

    // Check authorization: MVP restricts to doctor who created them. In a real hospital, this would be hospital-wide.
    // For now, if the user is a doctor, they can access it if they are the primary doctor or have an appointment.
    if (patient.doctorId !== userId) {
      // Check if they have an appointment
      const appt = await prisma.appointment.findFirst({
        where: { patientId: patient.id, doctorId: userId }
      });
      if (!appt) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(patient, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
