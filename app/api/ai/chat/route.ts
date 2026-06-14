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

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mocked response
    const mockResponseText = `This is a simulated AI response to your query: "${message}". In a production environment, this would be connected to an advanced medical LLM to provide clinical insights, drug interactions, or procedural guidance.`;

    // Log the request
    await prisma.aIRequest.create({
      data: {
        doctorId: userId,
        prompt: `Chat: ${message}`,
        response: mockResponseText
      }
    });

    return NextResponse.json({ response: mockResponseText }, { status: 200 });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
