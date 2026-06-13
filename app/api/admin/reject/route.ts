import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!";

async function getAdminId(req: Request): Promise<string | null> {
  const tokenCookie = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("medconnect_token="));
  if (!tokenCookie) return null;
  const token = tokenCookie.split("=")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const admin = await prisma.doctor.findUnique({ where: { id: decoded.id } });
    if (admin && admin.role === "ADMIN") {
      return admin.id;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function PUT(req: Request) {
  try {
    const adminId = await getAdminId(req);
    if (!adminId) {
      return NextResponse.json({ message: "Forbidden. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { doctorId, notes } = body;

    if (!doctorId || !notes) {
      return NextResponse.json({ message: "Doctor ID and rejection notes are required" }, { status: 400 });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        verificationStatus: "REJECTED",
        isVerified: false,
        verificationNotes: notes,
      },
    });

    return NextResponse.json({ message: "Doctor rejected successfully", doctor: updatedDoctor }, { status: 200 });
  } catch (error) {
    console.error("Reject Doctor Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
