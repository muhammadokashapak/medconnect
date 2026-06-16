import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { sendSMS } from "@/lib/sms";
import nodemailer from "nodemailer";

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
    const { phoneNumber } = body;

    if (!phoneNumber || phoneNumber.trim() === "") {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save temporarily in db
    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        otpCode,
        otpExpiry
      }
    });

    // Send SMS
    const smsResult = await sendSMS(phoneNumber, `Your MedConnect 2FA verification code is: ${otpCode}`);
    console.log(`[2FA SMS Request] Sent code ${otpCode} to ${phoneNumber}. Success: ${smsResult.success}`);

    // Send Email as Backup
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL || "muhammad.okasha2146@gmail.com",
          pass: process.env.SMTP_PASSWORD || "uzzr kdog fkte ntzd",
        },
      });

      const mailOptions = {
        from: '"MedConnect" <muhammad.okasha2146@gmail.com>',
        to: doctor.email,
        subject: "Verify your phone number for MedConnect 2FA",
        text: `Your verification code is: ${otpCode}. It will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #4F46E5;">MedConnect Security</h2>
            <p>Hi Dr. ${doctor.fullName},</p>
            <p>You requested to enable Two-Factor Authentication using the phone number: <strong>${phoneNumber}</strong>.</p>
            <p>Please enter the following 6-digit code on the settings page to verify your number:</p>
            <div style="font-size: 24px; font-weight: bold; padding: 12px; background-color: #f3f4f6; text-align: center; letter-spacing: 5px; border-radius: 4px; margin: 20px 0;">
              ${otpCode}
            </div>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error("Failed to send 2FA request email backup:", emailErr);
    }

    return NextResponse.json({ message: "Verification code sent successfully." }, { status: 200 });

  } catch (error) {
    console.error("2FA Request Code Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
