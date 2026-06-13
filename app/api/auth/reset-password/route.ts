import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json({ message: "Email, code, and new password are required" }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { email },
    });

    if (!doctor) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    if (doctor.resetToken !== code) {
      return NextResponse.json({ message: "Invalid or incorrect reset code" }, { status: 400 });
    }

    if (!doctor.resetTokenExpiry || doctor.resetTokenExpiry < new Date()) {
      return NextResponse.json({ message: "Reset code has expired. Please request a new one." }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.doctor.update({
      where: { id: doctor.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Password has been reset successfully." }, { status: 200 });

  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: "Server error during password reset" }, { status: 500 });
  }
}
