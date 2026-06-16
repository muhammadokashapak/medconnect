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
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { isTwoFactorEnabled: true, twoFactorPhone: true }
    });

    if (!doctor) return NextResponse.json({ message: "Doctor not found" }, { status: 404 });

    return NextResponse.json(doctor, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { isTwoFactorEnabled } = body;

    const dataToUpdate: any = { isTwoFactorEnabled };
    if (isTwoFactorEnabled === false) {
      dataToUpdate.twoFactorPhone = null;
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: dataToUpdate,
      select: { isTwoFactorEnabled: true, twoFactorPhone: true }
    });

    return NextResponse.json({ message: "Settings updated successfully", doctor: updatedDoctor }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
