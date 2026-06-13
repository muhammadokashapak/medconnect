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

    const promptString = `Decision Support Query: ${query}\nPatient Data: ${JSON.stringify(patientData)}`;

    // In a real application, you would pass `promptString` to an LLM like OpenAI, Gemini, or Claude.
    // For MedConnect simulation, we provide a generic AI clinical decision support response.

    const mockAiResponse = {
      treatmentRecommendations: [
        "Optimize current antihypertensive regimen per JNC 8 guidelines.",
        "Consider initiating a statin for cardiovascular risk reduction based on ASCVD score.",
        "Recommend lifestyle modifications including DASH diet and regular aerobic exercise."
      ],
      guidelineSuggestions: [
        "AHA/ACC Hypertension Guidelines 2017",
        "ADA Standards of Medical Care in Diabetes"
      ],
      riskFactorAnalysis: [
        "High risk for major adverse cardiovascular events (MACE) due to uncontrolled hypertension.",
        "Moderate risk for chronic kidney disease progression."
      ],
      drugInteractionAlerts: [
        "Monitor renal function if initiating ACE inhibitor with concurrent NSAID use."
      ]
    };

    const responseString = JSON.stringify(mockAiResponse);

    // Save AI request
    await prisma.aIRequest.create({
      data: {
        doctorId: userId,
        prompt: promptString,
        response: responseString
      }
    });

    return NextResponse.json(mockAiResponse, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
