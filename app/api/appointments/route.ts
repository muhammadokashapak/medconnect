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

    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { doctorId: userId },
          { consultantId: userId }
        ]
      },
      include: {
        doctor: { select: { fullName: true, specialization: true, profileImage: true } },
        consultant: { select: { fullName: true, specialization: true, profileImage: true } },
      },
      orderBy: { scheduledAt: "desc" }
    });

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { consultantId, scheduledAt, notes } = await req.json();

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: userId,
        consultantId,
        scheduledAt: new Date(scheduledAt),
        notes
      }
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { appointmentId, status } = await req.json();

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status }
    });

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    await prisma.appointment.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
