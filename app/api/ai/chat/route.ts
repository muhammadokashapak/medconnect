import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';

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
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: userId } });
    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    let aiResponseText = "";
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const systemInstruction = "You are a helpful and knowledgeable MedConnect AI Clinical Assistant. Provide accurate, professional, and helpful responses to the doctor's queries.";
      const prompt = `${systemInstruction}\n\nUser Query: "${message}"`;
      
      const result = await model.generateContent(prompt);
      aiResponseText = result.response.text();
    } catch (aiError) {
      console.error("Gemini API Error:", aiError);
      aiResponseText = "Sorry, I am currently unable to connect to the AI service. Please make sure the API key is correctly configured.";
    }

    // Log the request
    await prisma.aIRequest.create({
      data: {
        doctorId: userId,
        prompt: `Chat: ${message}`,
        response: aiResponseText
      }
    });

    return NextResponse.json({ response: aiResponseText }, { status: 200 });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
