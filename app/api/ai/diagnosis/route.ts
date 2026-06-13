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
    const { symptoms, history, labs, vitals } = body;

    const userPrompt = `Patient symptoms: ${symptoms}. History: ${history}. Labs: ${labs}. Vitals: ${vitals}. Provide a differential diagnosis.`;
    
    // Call the AI Abstraction Layer
    const aiResult = await generateAIResponse(
      "You are an expert clinical diagnostic AI assistant.",
      userPrompt,
      "DIAGNOSIS"
    );

    // Save session to DB for Phase 14 Audit Logging
    const session = await prisma.aIClinicalSession.create({
      data: {
        provider: aiResult.providerUsed,
        type: "DIAGNOSIS",
        summary: "Diagnostic query processed.",
        doctorId: userId,
        conversations: {
          create: [
            { role: "USER", content: userPrompt },
            { role: "ASSISTANT", content: aiResult.content, tokens: aiResult.tokens }
          ]
        }
      }
    });

    return NextResponse.json({ response: aiResult.content, session }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
