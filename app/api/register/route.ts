import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerRateLimiter } from "@/lib/rate-limit";
import { validateLicenseNumber } from "@/lib/license-validation";

export async function POST(req: Request) {
  try {
    // Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    if (!registerRateLimiter.check(ip)) {
      return Response.json({ message: "Too many registration attempts. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    console.log("STEP 2: Body:", body);

    let {
      fullName,
      email,
      phoneNumber,
      pmdcNumber,
      password,
      degree,
      hospital,
      specialization,
    } = body;

    // Normalize email
    if (email) {
      email = email.trim().toLowerCase();
    }

    console.log("STEP 3: Validating PMDC and checking existing doctor");

    // PMDC Validation
    let finalPmdc = pmdcNumber;
    if (pmdcNumber) {
      const validation = validateLicenseNumber(pmdcNumber);
      if (!validation.valid) {
        return Response.json(
          { message: validation.error || "Invalid PMDC License Format." },
          { status: 400 }
        );
      }
      finalPmdc = validation.sanitized;
    }

    const orConditions: any[] = [{ email }];
    if (phoneNumber && phoneNumber.trim() !== "") {
      orConditions.push({ phoneNumber });
    }
    if (finalPmdc && finalPmdc.trim() !== "") {
      orConditions.push({ pmdcNumber: finalPmdc });
    }

    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        OR: orConditions,
      },
    });

    console.log("STEP 4: Existing doctor result:", existingDoctor);

    if (existingDoctor) {
      if (existingDoctor.email === email) {
        if (existingDoctor.isVerified) {
          return Response.json(
            { message: "aap k gmail se account bana hoa ha already, aap login kr lein." },
            { status: 400 }
          );
        }
        // If not verified, we will update the existing record with a new OTP.
      } else if (existingDoctor.pmdcNumber === finalPmdc) {
        return Response.json(
          { message: "This PMDC/License number is already registered." },
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

    let doctor;

    if (existingDoctor && !existingDoctor.isVerified && existingDoctor.email === email) {
      console.log("STEP 6: Updating existing unverified doctor with new OTP");
      doctor = await prisma.doctor.update({
        where: { id: existingDoctor.id },
        data: {
          fullName,
          phoneNumber,
          pmdcNumber: finalPmdc,
          password: hashedPassword,
          otpCode,
          otpExpiry,
          qualification: degree,
          hospital,
          specialization,
          verificationStatus: "VERIFIED",
        },
      });
    } else {
      console.log("STEP 6: Creating new doctor with OTP");
      doctor = await prisma.doctor.create({
        data: {
          fullName,
          email,
          phoneNumber,
          pmdcNumber: finalPmdc,
          password: hashedPassword,
          otpCode,
          otpExpiry,
          isVerified: true,
          verificationStatus: "VERIFIED",
          qualification: degree,
          hospital,
          specialization,
        },
      });
    }

    console.log("STEP 7: Sending Email");

    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
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
    console.error("Registration error:", error);

    return Response.json(
      {
        error: "An error occurred during registration. Please try again.",
      },
      { status: 500 }
    );
  }
}