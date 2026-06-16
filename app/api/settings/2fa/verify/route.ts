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

export async function POST(req: Request) {
  try {
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { phoneNumber, otpCode } = body;

    if (!phoneNumber || !otpCode) {
      return NextResponse.json({ message: "Phone number and OTP code are required" }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    if (doctor.otpCode !== otpCode) {
      return NextResponse.json({ message: "Invalid verification code." }, { status: 400 });
    }

    if (doctor.otpExpiry && new Date() > doctor.otpExpiry) {
      return NextResponse.json({ message: "Verification code has expired." }, { status: 400 });
    }

    // Update 2FA status
    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        isTwoFactorEnabled: true,
        twoFactorPhone: phoneNumber,
        otpCode: null,
        otpExpiry: null
      }
    });

    return NextResponse.json({ message: "Two-Factor Authentication enabled successfully." }, { status: 200 });

  } catch (error) {
    console.error("2FA Verify Code Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
