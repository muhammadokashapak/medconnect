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

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const savedGuidelines = await prisma.savedGuideline.findMany({
      where: { doctorId: userId },
      include: { guideline: true },
      orderBy: { createdAt: "desc" }
    });

    const savedResearch = await prisma.savedResearch.findMany({
      where: { doctorId: userId },
      include: { researchPaper: true },
      orderBy: { createdAt: "desc" }
    });

    const recentViews = await prisma.resourceView.findMany({
      where: { doctorId: userId },
      orderBy: { viewedAt: "desc" },
      take: 10
    });

    return NextResponse.json({
      savedGuidelines,
      savedResearch,
      recentViews,
      stats: {
        totalSaved: savedGuidelines.length + savedResearch.length,
        totalViews: await prisma.resourceView.count({ where: { doctorId: userId } }),
        interactionChecks: await prisma.activity.count({ where: { doctorId: userId, type: "INTERACTION_CHECK" } })
      }
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
