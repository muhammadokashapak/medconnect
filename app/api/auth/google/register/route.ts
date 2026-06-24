import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { hash } from "bcryptjs";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!";

export async function POST(req: Request) {
  try {
    const { email, name, picture, pmdcNumber, phoneNumber } = await req.json();

    if (!email || !name || !pmdcNumber || !phoneNumber) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { email },
    });

    if (existingDoctor) {
      return NextResponse.json({ message: "Account already exists with this email" }, { status: 400 });
    }

    // Generate a strong random password for Google-registered users
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await hash(randomPassword, 10);

    // Create the doctor
    const doctor = await prisma.doctor.create({
      data: {
        email,
        fullName: name,
        profileImage: picture,
        pmdcNumber,
        phoneNumber,
        password: hashedPassword,
        isVerified: false,
        verificationStatus: "UNVERIFIED",
        role: "DOCTOR"
      },
    });

    // Log the user in
    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, role: doctor.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Registration successful",
      doctor: { id: doctor.id, fullName: doctor.fullName, role: doctor.role },
    }, { status: 201 });

    response.cookies.set("medconnect_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Google Auth Registration Error:", error);
    return NextResponse.json({ message: "Server error during registration" }, { status: 500 });
  }
}
