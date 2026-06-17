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
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const specialty = searchParams.get("specialty") || "";
    const city = searchParams.get("city") || "";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      verificationStatus: "VERIFIED",
    };

    if (query) {
      whereClause.OR = [
        { fullName: { contains: query, mode: "insensitive" } },
        { pmdcNumber: { contains: query, mode: "insensitive" } },
        { hospital: { contains: query, mode: "insensitive" } }
      ];
    }
    
    if (specialty) {
      whereClause.specialization = { contains: specialty, mode: "insensitive" };
    }
    
    if (city) {
      whereClause.city = { contains: city, mode: "insensitive" };
    }

    const doctors = await prisma.doctor.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        specialization: true,
        hospital: true,
        city: true,
        profileImage: true,
        experienceYears: true,
      },
      orderBy: { fullName: "asc" },
      skip,
      take: limit,
    });

    const total = await prisma.doctor.count({ where: whereClause });

    return NextResponse.json({
      data: doctors,
      meta: {
        total,
        page,
        limit,
        hasMore: skip + doctors.length < total
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Doctors Search Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
