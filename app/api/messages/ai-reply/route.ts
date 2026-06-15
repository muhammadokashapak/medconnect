import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const { conversationId, userMessage, aiBotId, doctorName } = await req.json();

    if (!conversationId || !userMessage || !aiBotId) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
    if (!GEMINI_API_KEY) {
      const msg = await prisma.message.create({
        data: {
          content: "Please set the GEMINI_API_KEY environment variable to enable AI responses.",
          conversationId,
          senderId: aiBotId,
        }
      });
      return NextResponse.json(msg, { status: 200 });
    }

    const messageCount = await prisma.message.count({
      where: { conversationId, senderId: aiBotId }
    });
    
    let aiIntroInstruction = "";
    if (messageCount === 0) {
      aiIntroInstruction = "If it's a medical question, answer it professionally and introduce yourself as an AI assistant.";
    } else {
      aiIntroInstruction = "If it's a medical question, answer it professionally. DO NOT introduce yourself or state that you are an AI assistant, just answer the question directly.";
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a helpful Medical AI Assistant named "Medical Chatbot" inside a doctor's messaging app. You are talking to Dr. ${doctorName}. They said: "${userMessage}". \n\n1. If the message is a greeting (e.g., "hi", "hello"), reply warmly using their name (Dr. ${doctorName}) and ask how you can help. DO NOT use the refusal message for greetings.\n2. ${aiIntroInstruction}\n3. ONLY IF the user explicitly asks for sensitive, harmful, illegal, or unethical content, you MUST refuse by stating exactly: "I cannot reply about this, it is against my policies."\n4. IMPORTANT: DO NOT use markdown asterisks (*) or bold syntax (**). NEVER output any stars. Use dashes (-) for lists and ALL CAPS for emphasis.`;
    
    let text = "";
    try {
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } catch (apiError: any) {
      console.error("Gemini API specific error:", apiError);
      text = "I cannot reply about this, it is against my policies.";
    }

    // Mark previous user messages as read and delivered since AI processed them
    await prisma.message.updateMany({
      where: { conversationId, senderId: userId, isRead: false },
      data: { isRead: true, isDelivered: true, readAt: new Date() }
    });
    
    const savedMessage = await prisma.message.create({
      data: {
        content: text,
        conversationId,
        senderId: aiBotId,
      },
      include: {
        sender: { select: { fullName: true, profileImage: true } }
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        doctorId: { not: aiBotId }
      },
      data: { hasUnread: true }
    });

    return NextResponse.json(savedMessage, { status: 200 });

  } catch (error) {
    console.error("AI Reply Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
