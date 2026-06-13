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

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const id = params?.id;
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    const event = await prisma.hospitalEvent.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ message: "Event not found" }, { status: 404 });

    const existing = await prisma.eventAttendance.findUnique({
      where: {
        doctorId_eventId: {
          doctorId: userId,
          eventId: id
        }
      }
    });

    if (existing) {
      return NextResponse.json({ message: "Already registered" }, { status: 400 });
    }

    await prisma.eventAttendance.create({
      data: {
        doctorId: userId,
        eventId: id,
        status: "REGISTERED"
      }
    });

    await prisma.activity.create({
      data: {
        doctorId: userId,
        type: "EVENT_REGISTER",
        description: `Registered for event: ${event.title}`
      }
    });

    return NextResponse.json({ message: "Registered successfully" }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
