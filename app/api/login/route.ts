import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let { email, password } = body;
    
    // Normalize email
    if (email) {
      email = email.trim().toLowerCase();
    }

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
      console.log(`Login failed for ${email}. Provided password length: ${password?.length}. Hash length: ${doctor.password?.length}`);
      return NextResponse.json(
        {
          message: "Invalid password",
        },
        {
          status: 401,
        }
      );
    }

    if (doctor.isTwoFactorEnabled) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.doctor.update({
        where: { id: doctor.id },
        data: { otpCode, otpExpiry },
      });

      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL || "muhammad.okasha2146@gmail.com",
          pass: process.env.SMTP_PASSWORD || "uzzr kdog fkte ntzd",
        },
      });

      const mailOptions = {
        from: '"MedConnect" <muhammad.okasha2146@gmail.com>',
        to: email,
        subject: "Your MedConnect 2FA Code",
        text: `Your MedConnect login code is: ${otpCode}. It will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #4F46E5;">MedConnect 2FA</h2>
            <p>Hi Dr. ${doctor.fullName},</p>
            <p>Please use the following 6-digit code to securely log in to your account:</p>
            <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f3f4f6; text-align: center; letter-spacing: 5px; border-radius: 4px;">
              ${otpCode}
            </div>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      return NextResponse.json({
        message: "2FA required",
        requires2FA: true,
        email: doctor.email
      }, { status: 200 });
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
