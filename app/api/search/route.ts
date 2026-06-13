import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!";

export async function GET(req: Request) {
  try {
    // Authenticate
    const tokenCookie = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("medconnect_token="));
    if (!tokenCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = tokenCookie.split("=")[1];
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query) {
      return NextResponse.json([]);
    }

    const doctors = await prisma.doctor.findMany({
      where: {
        role: "DOCTOR",
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { specialization: { contains: query, mode: "insensitive" } },
          { hospital: { contains: query, mode: "insensitive" } },
        ]
      },
      select: {
        id: true,
        fullName: true,
        specialization: true,
        profileImage: true,
        hospital: true,
        city: true,
        isVerified: true
      },
      take: 20
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
