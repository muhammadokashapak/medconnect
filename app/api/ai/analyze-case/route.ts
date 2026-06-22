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

    const { symptoms, history, age, gender, labResults } = await req.json();

    if (!symptoms) {
      return NextResponse.json({ message: "Symptoms are required for analysis" }, { status: 400 });
    }

    // Prepare prompt to save
    const promptText = `You are an expert medical AI assistant.
Analyze the following patient case and return the result STRICTLY as a JSON object with these exact keys: "possibleDiagnoses" (array of strings), "differentialDiagnoses" (array of strings), "recommendedTests" (array of strings), "redFlags" (array of strings), and "specialistReferral" (string).
Do not include any markdown formatting like \`\`\`json.

Patient Info:
Age: ${age}, Gender: ${gender}
Symptoms: ${symptoms}
History: ${history || 'None'}
Labs: ${labResults || 'None'}`;

    let aiResponseObj;
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(promptText);
      const text = result.response.text();
      // Clean potential markdown backticks
      const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      aiResponseObj = JSON.parse(cleanText);
    } catch (apiError) {
      console.error("Gemini API Error:", apiError);
      // Fallback to OpenRouter if Gemini fails or is not configured
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
        const text = data.choices[0].message.content;
        const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        aiResponseObj = JSON.parse(cleanText);
      } catch (orError) {
        console.error("OpenRouter API Error:", orError);
        throw new Error("Both AI providers failed");
      }
    }

    // Log the request
    await prisma.aIRequest.create({
      data: {
        doctorId: userId,
        prompt: promptText,
        response: JSON.stringify(aiResponseObj)
      }
    });

    return NextResponse.json(aiResponseObj, { status: 200 });
  } catch (error) {
    console.error("AI Case Analysis Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
