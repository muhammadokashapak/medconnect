import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!";

async function getDoctorId(req: Request): Promise<string | null> {
  const tokenCookie = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("medconnect_token="));
  if (!tokenCookie) return null;
  const token = tokenCookie.split("=")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const doc = await prisma.doctor.findUnique({ where: { id: decoded.id } });
    return doc ? doc.id : null;
  } catch (error) {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const doctorId = await getDoctorId(req);
    if (!doctorId) return NextResponse.json([], { status: 200 });

    const parts = await prisma.conversationParticipant.findMany({
      where: { doctorId },
      include: {
        conversation: {
          include: {
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            participants: { include: { doctor: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = parts.map(p => {
      const conv = p.conversation;
      const other = conv.participants.find(pp => pp.doctorId !== doctorId)?.doctor || null;
      return {
        id: conv.id,
        updatedAt: conv.updatedAt,
        lastMessage: conv.messages[0] || null,
        hasUnread: p.hasUnread,
        otherDoctor: other ? { id: other.id, fullName: other.fullName, profileImage: other.profileImage } : null
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const doctorId = await getDoctorId(req);
    if (!doctorId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { participantId } = body;
    if (!participantId) return NextResponse.json({ message: "participantId required" }, { status: 400 });

    // Find existing conversation between the two
    const existing = await prisma.conversation.findFirst({
      where: {
        participants: { some: { doctorId } },
        AND: { participants: { some: { doctorId: participantId } } }
      },
      include: { participants: true }
    });

    if (existing) return NextResponse.json({ conversationId: existing.id }, { status: 200 });

    const conv = await prisma.conversation.create({ data: {} });
    await prisma.conversationParticipant.createMany({ data: [
      { conversationId: conv.id, doctorId },
      { conversationId: conv.id, doctorId: participantId }
    ]});

    return NextResponse.json({ conversationId: conv.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
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

// Get all conversations for the user
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const participants = await prisma.conversationParticipant.findMany({
      where: { doctorId: userId },
      include: {
        conversation: {
          include: {
            participants: {
              where: { doctorId: { not: userId } },
              include: {
                doctor: {
                  select: { id: true, fullName: true, profileImage: true, specialization: true }
                }
              }
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1
            }
          }
        }
      },
      orderBy: { conversation: { updatedAt: "desc" } }
    });

    const formattedConversations = participants.map(p => {
      const otherParticipant = p.conversation.participants[0]?.doctor;
      const lastMessage = p.conversation.messages[0];
      return {
        id: p.conversation.id,
        updatedAt: p.conversation.updatedAt,
        hasUnread: p.hasUnread,
        otherDoctor: otherParticipant,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isMine: lastMessage.senderId === userId
        } : null
      };
    });

    return NextResponse.json(formattedConversations, { status: 200 });
  } catch (error) {
    console.error("Fetch Conversations Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

// Start a conversation
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const doctor = await prisma.doctor.findUnique({ where: { id: userId } });
    if (!doctor || doctor.verificationStatus !== "VERIFIED") {
      return NextResponse.json({ message: "You must be VERIFIED to start a conversation" }, { status: 403 });
    }

    const { targetDoctorId } = await req.json();
    if (!targetDoctorId || targetDoctorId === userId) {
      return NextResponse.json({ message: "Invalid target doctor" }, { status: 400 });
    }

    // Check if conversation already exists
    const existingParticipation = await prisma.conversationParticipant.findFirst({
      where: {
        doctorId: userId,
        conversation: {
          participants: {
            some: { doctorId: targetDoctorId }
          }
        }
      }
    });

    if (existingParticipation) {
      return NextResponse.json({ conversationId: existingParticipation.conversationId }, { status: 200 });
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { doctorId: userId },
            { doctorId: targetDoctorId }
          ]
        }
      }
    });

    return NextResponse.json({ conversationId: newConversation.id }, { status: 201 });
  } catch (error) {
    console.error("Create Conversation Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
