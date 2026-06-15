import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { email, otpCode } = body;

    if (email) {
      email = email.trim().toLowerCase();
    }

    const doctor = await prisma.doctor.findUnique({
      where: { email },
    });

    if (!doctor) {
      return NextResponse.json({ message: "Account not found." }, { status: 404 });
    }

    if (doctor.otpCode !== otpCode) {
      return NextResponse.json({ message: "Invalid 2FA code." }, { status: 401 });
    }

    if (doctor.otpExpiry && new Date() > doctor.otpExpiry) {
      return NextResponse.json({ message: "2FA code expired." }, { status: 401 });
    }

    // Clear OTP after successful use
    await prisma.doctor.update({
      where: { id: doctor.id },
      data: { otpCode: null, otpExpiry: null },
    });

    // Create JWT Token
    const isLegacyUser = new Date(doctor.createdAt) < new Date("2026-06-16T00:00:00Z");
    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, role: doctor.role, verificationStatus: doctor.verificationStatus, isLegacyUser },
      process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!",
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        doctor: {
          id: doctor.id,
          fullName: doctor.fullName,
          email: doctor.email,
          pmdcNumber: doctor.pmdcNumber,
          isVerified: doctor.isVerified,
          role: doctor.role,
        },
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set({
      name: "medconnect_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("2FA Verify Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
