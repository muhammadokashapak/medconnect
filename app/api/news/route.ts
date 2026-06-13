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

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";

    const where: any = {};
    if (category && category !== "All") {
      where.category = category;
    }

    const news = await prisma.medicalNews.findMany({
      where,
      orderBy: { publishedAt: "desc" }
    });

    return NextResponse.json(news, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { newsId } = await req.json();

    if (newsId) {
       const newsItem = await prisma.medicalNews.findUnique({ where: { id: newsId }});
       if (newsItem) {
          await prisma.resourceView.create({
            data: {
              resourceType: 'NEWS',
              resourceId: newsItem.id,
              resourceTitle: newsItem.title,
              doctorId: userId
            }
          });
       }
    }

    return NextResponse.json({ message: "View recorded" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
