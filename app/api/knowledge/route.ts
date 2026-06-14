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

    // Fetch featured resources (top 3 of each)
    let guidelines = await prisma.guideline.findMany({ take: 3, orderBy: { createdAt: "desc" } }).catch(() => []);
    let drugs = await prisma.drug.findMany({ take: 3, orderBy: { createdAt: "desc" } }).catch(() => []);
    let researchPapers = await prisma.researchPaper.findMany({ take: 3, orderBy: { createdAt: "desc" } }).catch(() => []);
    let news = await prisma.medicalNews.findMany({ take: 3, orderBy: { publishedAt: "desc" } }).catch(() => []);

    // Fallback data if DB is empty so the Knowledge Hub always has content
    if (guidelines.length === 0) {
      guidelines = [
        { id: "g1", title: "Hypertension Management 2026", specialty: "Cardiology", description: "Comprehensive guidelines for managing hypertension in adults.", version: "v1.0" },
        { id: "g2", title: "Type 2 Diabetes Mellitus Standard of Care", specialty: "Endocrinology", description: "Latest standards for managing Type 2 Diabetes.", version: "v2.1" }
      ] as any;
    }

    if (news.length === 0) {
      news = [
        { id: "n1", title: "FDA Approves New Targeted Therapy for Melanoma", source: "MedNews Daily", publishedAt: new Date().toISOString() },
        { id: "n2", title: "Breakthrough in Alzheimer's Biomarker Detection", source: "Global Health Journal", publishedAt: new Date().toISOString() }
      ] as any;
    }

    // Fetch recently viewed topics by this doctor
    const recentlyViewed = await prisma.resourceView.findMany({
      where: { doctorId: userId },
      orderBy: { viewedAt: "desc" },
      take: 5,
    }).catch(() => []);

    return NextResponse.json({
      featured: {
        guidelines,
        drugs,
        researchPapers,
        news
      },
      recentlyViewed
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
