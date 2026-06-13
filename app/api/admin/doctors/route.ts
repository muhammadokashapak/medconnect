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

export async function GET(req: Request) {
  try {
    const adminId = await getAdminId(req);
    if (!adminId) {
      return NextResponse.json({ message: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    const doctors = await prisma.doctor.findMany({
      where: { verificationStatus: status },
      select: {
        id: true,
        fullName: true,
        email: true,
        pmdcNumber: true,
        specialization: true,
        verificationStatus: true,
        licenseImage: true,
        cnicImage: true,
        selfieImage: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(doctors, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
