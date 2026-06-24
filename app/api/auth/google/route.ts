import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!";
const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ message: "No credential provided" }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ message: "Invalid Google token" }, { status: 400 });
    }

    const { email, name, picture } = payload;

    // Check if user exists
    const doctor = await prisma.doctor.findUnique({
      where: { email },
    });

    if (!doctor) {
      // User doesn't exist. Tell frontend to redirect to complete registration.
      return NextResponse.json({
        requiresRegistration: true,
        email,
        name,
        picture
      }, { status: 206 }); // 206 Partial Content
    }

    // User exists, log them in
    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, role: doctor.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Login successful",
      doctor: { id: doctor.id, fullName: doctor.fullName, role: doctor.role },
    }, { status: 200 });

    response.cookies.set("medconnect_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.json({ message: "Server error during Google auth" }, { status: 500 });
  }
}
