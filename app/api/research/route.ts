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
    const query = searchParams.get("query") || "";

    const where: any = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { authors: { contains: query, mode: "insensitive" } },
        { abstract: { contains: query, mode: "insensitive" } }
      ];
    }

    const papers = await prisma.researchPaper.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(papers, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { paperId, action } = await req.json();

    if (!paperId) return NextResponse.json({ message: "Missing paper ID" }, { status: 400 });

    if (action === "save") {
      await prisma.savedResearch.upsert({
        where: { doctorId_researchPaperId: { doctorId: userId, researchPaperId: paperId } },
        update: {},
        create: { doctorId: userId, researchPaperId: paperId }
      });
      return NextResponse.json({ message: "Saved" }, { status: 200 });
    } else if (action === "view") {
      const paper = await prisma.researchPaper.findUnique({ where: { id: paperId }});
      if (paper) {
        await prisma.resourceView.create({
          data: {
            resourceType: 'RESEARCH',
            resourceId: paper.id,
            resourceTitle: paper.title,
            doctorId: userId
          }
        });
        
        await prisma.activity.create({
          data: {
            type: "DOWNLOAD_RESEARCH",
            description: `Downloaded research: ${paper.title}`,
            doctorId: userId
          }
        });
      }
      return NextResponse.json({ message: "View recorded" }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
