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

    const { patientData, query } = await req.json();

    if (!patientData && !query) {
      return NextResponse.json({ message: "Please provide clinical data or a query." }, { status: 400 });
    }

    const promptText = `You are a medical Clinical Decision Support System.
Evaluate the following patient data and query. Return the result STRICTLY as a JSON object with these exact keys: "treatmentRecommendations" (array of strings), "guidelineSuggestions" (array of strings), "riskFactorAnalysis" (array of strings), and "drugInteractionAlerts" (array of strings). Do NOT include markdown blocks like \`\`\`json.

Query: ${query}
Patient Data: ${JSON.stringify(patientData)}`;

    let aiResponseObj;
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(promptText);
      const text = result.response.text();
      const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      aiResponseObj = JSON.parse(cleanText);
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
        const text = data.choices[0].message.content;
        const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        aiResponseObj = JSON.parse(cleanText);
      } catch (orError) {
        console.error("OpenRouter API Error:", orError);
        throw new Error("Both AI providers failed");
      }
    }

    const responseString = JSON.stringify(aiResponseObj);

    // Save AI request
    await prisma.aIRequest.create({
      data: {
        doctorId: userId,
        prompt: promptText,
        response: responseString
      }
    });

    return NextResponse.json(aiResponseObj, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
