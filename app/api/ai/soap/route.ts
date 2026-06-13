import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { generateAIResponse } from "@/lib/ai/provider";

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

    const body = await req.json();
    const { transcript, visitNotes } = body;

    const userPrompt = `Generate a structured SOAP note from the following input: ${transcript || visitNotes}`;
    
    const aiResult = await generateAIResponse(
      "You are a clinical documentation AI assistant.",
      userPrompt,
      "SOAP"
    );

    await prisma.aIClinicalSession.create({
      data: {
        provider: aiResult.providerUsed,
        type: "SOAP",
        summary: "SOAP note generated.",
        doctorId: userId,
        conversations: {
          create: [
            { role: "USER", content: userPrompt },
            { role: "ASSISTANT", content: aiResult.content, tokens: aiResult.tokens }
          ]
        }
      }
    });

    return NextResponse.json({ response: aiResult.content }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
