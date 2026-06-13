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

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { casePostId } = await req.json();

    await prisma.savedCase.create({
      data: { doctorId: userId, casePostId }
    });

    return NextResponse.json({ message: "Case saved" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const casePostId = searchParams.get("casePostId");

    if (!casePostId) return NextResponse.json({ message: "Missing casePostId" }, { status: 400 });

    await prisma.savedCase.deleteMany({
      where: { doctorId: userId, casePostId }
    });

    return NextResponse.json({ message: "Case unsaved" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const savedCases = await prisma.savedCase.findMany({
      where: { doctorId: userId },
      include: {
        casePost: {
          include: { doctor: { select: { fullName: true, specialization: true, profileImage: true } } }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(savedCases, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
