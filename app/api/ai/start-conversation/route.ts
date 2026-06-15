import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { hash } from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!";
const AI_EMAIL = "ai@medconnect.com";
const AI_PMDC = "AI-BOT";

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

    // 1. Find or create AI Bot User
    let aiBot = await prisma.doctor.findUnique({
      where: { email: AI_EMAIL }
    });

    if (!aiBot) {
      const hashedPassword = await hash("random_secure_password_ai_bot_123", 10);
      aiBot = await prisma.doctor.create({
        data: {
          fullName: "Medical Chatbot",
          email: AI_EMAIL,
          pmdcNumber: AI_PMDC,
          phoneNumber: "0000000000",
          password: hashedPassword,
          isVerified: true,
          verificationStatus: "VERIFIED",
          specialization: "Artificial Intelligence",
          bio: "I am an advanced Medical AI assistant powered by Google Gemini, here to help you with clinical queries and decision support.",
          profileImage: "https://api.dicebear.com/7.x/bottts/svg?seed=MedicalAI&backgroundColor=4f46e5"
        }
      });
    }

    // 2. Check if a conversation already exists between userId and aiBot.id
    const existingConversations = await prisma.conversation.findMany({
      where: {
        AND: [
          { participants: { some: { doctorId: userId } } },
          { participants: { some: { doctorId: aiBot.id } } },
        ]
      },
      select: { id: true }
    });

    if (existingConversations.length > 0) {
      return NextResponse.json({ conversationId: existingConversations[0].id }, { status: 200 });
    }

    // 3. Create new conversation if it doesn't exist
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { doctorId: userId },
            { doctorId: aiBot.id }
          ]
        }
      }
    });

    return NextResponse.json({ conversationId: newConversation.id }, { status: 201 });
  } catch (error) {
    console.error("AI Start Conversation Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
