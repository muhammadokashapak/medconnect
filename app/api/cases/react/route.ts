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

    const { casePostId, type = "LIKE" } = await req.json();

    if (!casePostId) {
      return NextResponse.json({ message: "Case Post ID is required" }, { status: 400 });
    }

    const existingReaction = await prisma.caseReaction.findUnique({
      where: {
        doctorId_casePostId: {
          doctorId,
          casePostId,
        }
      }
    });

    if (existingReaction) {
      // Toggle off if clicking the same reaction, or update if different (simplified to toggle off for now)
      if (existingReaction.type === type) {
        await prisma.caseReaction.delete({
          where: { id: existingReaction.id }
        });
        return NextResponse.json({ message: "Reaction removed", reacted: false }, { status: 200 });
      } else {
        await prisma.caseReaction.update({
          where: { id: existingReaction.id },
          data: { type }
        });
        return NextResponse.json({ message: "Reaction updated", reacted: true, type }, { status: 200 });
      }
    }

    await prisma.caseReaction.create({
      data: {
        doctorId,
        casePostId,
        type,
      }
    });

    return NextResponse.json({ message: "Reaction added", reacted: true, type }, { status: 200 });
  } catch (error) {
    console.error("React Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
