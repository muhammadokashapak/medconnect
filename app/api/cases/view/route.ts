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
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { casePostId } = await req.json();

    if (!casePostId) {
      return NextResponse.json({ message: "Case Post ID is required" }, { status: 400 });
    }

    // Upsert view so it only increments once per doctor
    await prisma.caseView.upsert({
      where: {
        doctorId_casePostId: {
          doctorId,
          casePostId,
        }
      },
      update: {},
      create: {
        doctorId,
        casePostId,
      }
    });

    return NextResponse.json({ message: "View recorded" }, { status: 200 });
  } catch (error) {
    console.error("View Record Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
