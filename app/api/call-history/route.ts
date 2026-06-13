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

    const calls = await prisma.callHistory.findMany({
      where: {
        OR: [
          { callerId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        caller: { select: { fullName: true, profileImage: true } },
        receiver: { select: { fullName: true, profileImage: true } }
      },
      orderBy: { startedAt: "desc" }
    });

    return NextResponse.json(calls, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { receiverId, type, duration, startedAt, endedAt } = await req.json();

    const call = await prisma.callHistory.create({
      data: {
        callerId: userId,
        receiverId,
        type,
        duration,
        startedAt: new Date(startedAt),
        endedAt: new Date(endedAt)
      }
    });

    return NextResponse.json(call, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
