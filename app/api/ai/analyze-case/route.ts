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
    if (!doctor || doctor.verificationStatus !== "VERIFIED") {
      return NextResponse.json({ message: "You must be fully verified to use AI tools" }, { status: 403 });
    }

    const { symptoms, history, age, gender, labResults } = await req.json();

    if (!symptoms) {
      return NextResponse.json({ message: "Symptoms are required for analysis" }, { status: 400 });
    }

    // Prepare prompt to save
    const promptText = `Analyze Case: Age: ${age}, Gender: ${gender}\nSymptoms: ${symptoms}\nHistory: ${history || 'None'}\nLabs: ${labResults || 'None'}`;

    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mocked response
    const mockResponse = {
      possibleDiagnoses: ["Primary Condition A", "Primary Condition B"],
      differentialDiagnoses: ["Secondary Condition X", "Secondary Condition Y", "Secondary Condition Z"],
      recommendedTests: ["Complete Blood Count (CBC)", "Metabolic Panel", "Specific Imaging"],
      redFlags: ["Alert symptom 1", "Alert symptom 2"],
      specialistReferral: "Consider referral to specialized department if symptoms persist."
    };

    // Log the request
    await prisma.aIRequest.create({
      data: {
        doctorId: userId,
        prompt: promptText,
        response: JSON.stringify(mockResponse)
      }
    });

    return NextResponse.json(mockResponse, { status: 200 });
  } catch (error) {
    console.error("AI Case Analysis Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
