import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password } = body;

    const doctor = await prisma.doctor.findUnique({
      where: {
        email,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        {
          message: "Account not found. Please register first.",
        },
        {
          status: 404,
        }
      );
    }

    const isPasswordValid = await compare(
      password,
      doctor.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          message: "Invalid password",
        },
        {
          status: 401,
        }
      );
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, role: doctor.role },
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
      {
        status: 200,
      }
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
    console.error("Login Error:", error);

    return Response.json(
      {
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
