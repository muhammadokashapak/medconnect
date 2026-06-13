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

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const queue = await prisma.queueToken.findMany({
      where: { 
        doctorId: userId,
        status: { in: ["WAITING", "IN_CONSULTATION"] }
      },
      include: {
        patient: { select: { fullName: true, mrn: true, gender: true } }
      },
      orderBy: { tokenNumber: "asc" }
    });

    return NextResponse.json(queue, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { patientId } = body;

    // Find latest token number for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const latest = await prisma.queueToken.findFirst({
      where: { 
        doctorId: userId,
        createdAt: { gte: startOfDay }
      },
      orderBy: { tokenNumber: "desc" }
    });

    const nextToken = latest ? latest.tokenNumber + 1 : 1;

    const token = await prisma.queueToken.create({
      data: {
        tokenNumber: nextToken,
        patientId,
        doctorId: userId
      },
      include: {
        patient: { select: { fullName: true, mrn: true } }
      }
    });

    return NextResponse.json(token, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { tokenId, status } = body;

    const token = await prisma.queueToken.update({
      where: { id: tokenId },
      data: { status }
    });

    return NextResponse.json(token, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
