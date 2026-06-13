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
    const [guidelines, drugs, researchPapers, news] = await Promise.all([
      prisma.guideline.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
      prisma.drug.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
      prisma.researchPaper.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
      prisma.medicalNews.findMany({ take: 3, orderBy: { publishedAt: "desc" } }),
    ]);

    // Fetch recently viewed topics by this doctor
    const recentlyViewed = await prisma.resourceView.findMany({
      where: { doctorId: userId },
      orderBy: { viewedAt: "desc" },
      take: 5,
    });

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
