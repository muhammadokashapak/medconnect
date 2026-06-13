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
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const consultations = await prisma.consultation.findMany({
      where: {
        appointment: {
          OR: [
            { doctorId: userId },
            { consultantId: userId }
          ]
        }
      },
      include: {
        appointment: {
          include: {
            doctor: { select: { fullName: true, specialization: true } },
            consultant: { select: { fullName: true, specialization: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(consultations, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { appointmentId, duration, diagnosis, recommendations, treatmentPlan } = await req.json();

    const consultation = await prisma.consultation.create({
      data: {
        appointmentId,
        duration,
        diagnosis,
        recommendations,
        treatmentPlan
      }
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
