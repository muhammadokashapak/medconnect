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
    const specialty = searchParams.get("specialty") || "";

    const where: any = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (specialty) {
      where.specialty = specialty;
    }

    const guidelines = await prisma.guideline.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(guidelines, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
