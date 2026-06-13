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

    const doctor = await prisma.doctor.findUnique({ where: { id: userId } });
    if (!doctor || !["SUPER_ADMIN", "HOSPITAL_ADMIN"].includes(doctor.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // For MVP, if SUPER_ADMIN or HOSPITAL_ADMIN, fetch all pending hospital requests
    const pendingRequests = await prisma.hospitalMembership.findMany({
      where: { status: "PENDING" },
      include: {
        doctor: true,
        hospital: true
      },
      orderBy: { joinedAt: "asc" }
    });

    // Also get high level stats
    const stats = {
      totalHospitals: await prisma.hospital.count(),
      totalDepartments: await prisma.department.count(),
      totalEvents: await prisma.hospitalEvent.count(),
      totalAnnouncements: await prisma.hospitalAnnouncement.count()
    };

    return NextResponse.json({ pendingRequests, stats }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const doctor = await prisma.doctor.findUnique({ where: { id: userId } });
    if (!doctor || !["SUPER_ADMIN", "HOSPITAL_ADMIN"].includes(doctor.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { membershipId, action } = await req.json(); // action: "APPROVE" | "REJECT"
    if (!membershipId || !action) return NextResponse.json({ message: "Missing data" }, { status: 400 });

    const updated = await prisma.hospitalMembership.update({
      where: { id: membershipId },
      data: { status: action === "APPROVE" ? "APPROVED" : "REJECTED" }
    });

    return NextResponse.json({ message: `Request ${action}D successfully`, updated }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
