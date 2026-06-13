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

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const id = params?.id;
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        departments: true,
        memberships: {
          include: { doctor: true },
          where: { status: "APPROVED" }
        },
        events: {
          orderBy: { date: "asc" }
        },
        announcements: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!hospital) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Check if current user is a member
    const userMembership = await prisma.hospitalMembership.findUnique({
      where: {
        doctorId_hospitalId: {
          doctorId: userId,
          hospitalId: id
        }
      }
    });

    return NextResponse.json({ 
      ...hospital, 
      userMembership: userMembership ? userMembership.status : null 
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
