import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { email },
    });

    if (!doctor) {
      // Return 200 even if not found to prevent email enumeration attacks
      return NextResponse.json({ message: "If an account with that email exists, we sent a reset code." }, { status: 200 });
    }

    // Generate 6-digit OTP
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.doctor.update({
      where: { id: doctor.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

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
      subject: "MedConnect - Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #4F46E5;">MedConnect Password Reset</h2>
          <p>Hi Dr. ${doctor.fullName},</p>
          <p>We received a request to reset your password. Use the code below to reset it:</p>
          <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f3f4f6; text-align: center; letter-spacing: 5px; border-radius: 4px; margin: 20px 0;">
            ${resetToken}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Reset code sent to your email." }, { status: 200 });

  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
