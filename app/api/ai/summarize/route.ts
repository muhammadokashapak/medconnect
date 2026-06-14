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

    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mocked response
    const mockSummary = "This is an AI-generated concise summary of the provided clinical notes. It highlights the primary symptoms, patient history, and key findings for rapid review by other medical professionals.";

    // Log the request
    await prisma.aIRequest.create({
      data: {
        doctorId: userId,
        prompt: `Summarize:\n${caseText.substring(0, 500)}...`,
        response: mockSummary
      }
    });

    return NextResponse.json({ summary: mockSummary }, { status: 200 });
  } catch (error) {
    console.error("AI Summarize Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
