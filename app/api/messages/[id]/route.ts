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

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const conversationId = params.id;

    const participation = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_doctorId: {
          conversationId,
          doctorId: userId
        }
      }
    });

    if (!participation) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (participation.hasUnread) {
      await prisma.conversationParticipant.update({
        where: { id: participation.id },
        data: { hasUnread: false }
      });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, fullName: true, profileImage: true }
        },
        replyTo: {
          select: { id: true, content: true, sender: { select: { fullName: true } } }
        }
      }
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
