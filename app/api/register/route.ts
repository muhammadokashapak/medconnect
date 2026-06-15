import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("STEP 1: Request received");

    const body = await req.json();
    console.log("STEP 2: Body:", body);

    let {
      fullName,
      email,
      phoneNumber,
      pmdcNumber,
      password,
    } = body;

    // Normalize email
    if (email) {
      email = email.trim().toLowerCase();
    }

    console.log("STEP 3: Validating PMDC and checking existing doctor");

    // PMDC Validation
    if (pmdcNumber) {
      const pmdcRegex = /^\d{6}-[mM]$/;
      if (!pmdcRegex.test(pmdcNumber)) {
        return Response.json(
          { message: "Invalid PMDC License Format." },
          { status: 400 }
        );
      }
    }

    const orConditions: any[] = [{ email }];
    if (phoneNumber && phoneNumber.trim() !== "") {
      orConditions.push({ phoneNumber });
    }
    if (pmdcNumber && pmdcNumber.trim() !== "") {
      orConditions.push({ pmdcNumber });
    }

    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        OR: orConditions,
      },
    });

    console.log("STEP 4: Existing doctor result:", existingDoctor);

    if (existingDoctor) {
      if (existingDoctor.email === email) {
        return Response.json(
          { message: "aap k gmail se account bana hoa ha already, aap login kr lein." },
          { status: 400 }
        );
      } else if (existingDoctor.pmdcNumber === pmdcNumber) {
        return Response.json(
          { message: "This PMDC number is already registered." },
          { status: 400 }
        );
      } else {
        return Response.json(
          { message: "Phone number is already registered." },
          { status: 400 }
        );
      }
    }

    console.log("STEP 5: Hashing password");

    const hashedPassword = await hash(password, 10);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("STEP 6: Creating doctor with OTP");

    const doctor = await prisma.doctor.create({
      data: {
        fullName,
        email,
        phoneNumber,
        pmdcNumber,
        password: hashedPassword,
        otpCode,
        otpExpiry,
        isVerified: false,
      },
    });

    console.log("STEP 7: Sending Email");

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
      subject: "Your MedConnect Verification Code",
      text: `Your MedConnect verification code is: ${otpCode}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #4F46E5;">MedConnect</h2>
          <p>Hi Dr. ${fullName},</p>
          <p>Thank you for registering. Please use the following 6-digit code to verify your email address:</p>
          <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f3f4f6; text-align: center; letter-spacing: 5px; border-radius: 4px;">
            ${otpCode}
          </div>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("STEP 8: Email sent successfully");
    
    // Also send SMS if phone number is available
    if (phoneNumber) {
      const { sendSMS } = require("@/lib/sms");
      await sendSMS(phoneNumber, `Your MedConnect verification code is: ${otpCode}`);
    }

    return Response.json({
      message: "Doctor registered. OTP sent.",
      email: doctor.email,
    });

  } catch (error: any) {
    console.error("FULL ERROR:");
    console.error(error);

    return Response.json(
      {
        error: error?.message,
        stack: error?.stack,
      },
      { status: 500 }
    );
  }
}