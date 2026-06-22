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
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: userId } });
    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    const { caseText } = await req.json();

    if (!caseText) {
      return NextResponse.json({ message: "Case text is required" }, { status: 400 });
    }

    const promptText = `Summarize the following clinical notes concisely and professionally, highlighting primary symptoms, patient history, and key findings:
${caseText}`;

    let summaryText = "";
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(promptText);
      summaryText = result.response.text().trim();
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
            messages: [{ role: "user", content: promptText }]
          })
        });
        const data = await response.json();
        summaryText = data.choices[0].message.content.trim();
      } catch (orError) {
        console.error("OpenRouter API Error:", orError);
        throw new Error("Both AI providers failed");
      }
    }

    // Log the request
    await prisma.aIRequest.create({
      data: {
        doctorId: userId,
        prompt: `Summarize:\n${caseText.substring(0, 500)}...`,
        response: summaryText
      }
    });

    return NextResponse.json({ summary: summaryText }, { status: 200 });
  } catch (error) {
    console.error("AI Summarize Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
