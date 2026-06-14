import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { email, otp } = body;
    if (email) email = email.trim().toLowerCase();

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { email },
    });

    if (!doctor) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 });
    }

    // Check if OTP matches
    if (doctor.otpCode !== otp) {
      return NextResponse.json({ message: "Invalid OTP code" }, { status: 400 });
    }

    // Check if OTP has expired
    if (!doctor.otpExpiry || doctor.otpExpiry < new Date()) {
      return NextResponse.json({ message: "OTP has expired. Please register again or request a new code." }, { status: 400 });
    }

    // OTP is valid, mark as verified and clear OTP
    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctor.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiry: null,
      },
    });

    const response = NextResponse.json(
      {
        message: "Email verified successfully! Please log in.",
        doctor: {
          id: updatedDoctor.id,
          fullName: updatedDoctor.fullName,
          role: updatedDoctor.role,
        },
      },
      { status: 200 }
    );

    return response;

  } catch (error: any) {
    console.error("OTP Verify Error:", error);
    return NextResponse.json({ message: "Server error during verification" }, { status: 500 });
  }
}
