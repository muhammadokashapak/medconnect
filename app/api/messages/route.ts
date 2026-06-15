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

    const doctor = await prisma.doctor.findUnique({ where: { id: userId } });
    if (!doctor || doctor.verificationStatus !== "VERIFIED") {
      return NextResponse.json({ message: "You must be VERIFIED to send messages" }, { status: 403 });
    }

    const { conversationId, content, replyToId } = await req.json();
    if (!conversationId || !content.trim()) {
      return NextResponse.json({ message: "Invalid message data" }, { status: 400 });
    }

    // Ensure user is part of the conversation
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

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId: userId,
        replyToId: replyToId || null,
      },
      include: {
        replyTo: true
      }
    });

    // Update conversation updatedAt and set unread for others
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        doctorId: { not: userId }
      },
      data: { hasUnread: true }
    });

    // Notify other participants
    const others = await prisma.conversationParticipant.findMany({
      where: { conversationId, doctorId: { not: userId } },
      include: { doctor: true }
    });
    
    let isAiConversation = false;
    let aiBotId = "";

    for (const p of others) {
      if (p.doctor.pmdcNumber === "AI-BOT") {
        isAiConversation = true;
        aiBotId = p.doctorId;
      } else {
        await prisma.notification.create({
          data: {
            doctorId: p.doctorId,
            title: "New Message",
            message: `Dr. ${doctor.fullName} sent you a message.`,
            type: "MESSAGE",
            actionUrl: "/messages"
          }
        });
      }
    }

    if (isAiConversation && aiBotId) {
      // Don't generate response here asynchronously. Let frontend trigger it.
    }

    return NextResponse.json({ message: "Message sent", data: message, isAiConversation, aiBotId }, { status: 201 });
  } catch (error) {
    console.error("Send Message Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}


