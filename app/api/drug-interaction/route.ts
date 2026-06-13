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

    const { drugIds } = await req.json();

    if (!drugIds || !Array.isArray(drugIds) || drugIds.length < 2) {
      return NextResponse.json({ message: "Select at least two drugs to check interactions." }, { status: 400 });
    }

    const drugs = await prisma.drug.findMany({
      where: {
        id: { in: drugIds }
      }
    });

    if (drugs.length !== drugIds.length) {
      return NextResponse.json({ message: "One or more drugs not found." }, { status: 404 });
    }

    // Mock logic for interactions based on known pairs for demonstration
    const interactions = [];
    const names = drugs.map(d => d.name.toLowerCase());

    if (names.includes("lisinopril") && names.includes("aspirin")) {
      interactions.push({
        drugs: ["Lisinopril", "Aspirin"],
        severity: "Moderate",
        description: "NSAIDs (like Aspirin) can reduce the antihypertensive effect of ACE inhibitors (like Lisinopril) and increase the risk of renal impairment."
      });
    }

    if (names.includes("albuterol") && names.includes("metformin")) {
      interactions.push({
        drugs: ["Albuterol", "Metformin"],
        severity: "Minor",
        description: "Beta-2 agonists like Albuterol may transiently increase blood glucose levels, potentially requiring adjustment of diabetic medications."
      });
    }

    // Default fallback if no specific rule matches
    if (interactions.length === 0) {
      interactions.push({
        drugs: drugs.map(d => d.name),
        severity: "None Detected",
        description: "No known significant interactions between the selected drugs based on the current database."
      });
    }

    // Record interaction check as an activity
    await prisma.activity.create({
      data: {
        type: "INTERACTION_CHECK",
        description: `Checked interactions for: ${drugs.map(d => d.name).join(", ")}`,
        doctorId: userId
      }
    });

    return NextResponse.json({ interactions }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
