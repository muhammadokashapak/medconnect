import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("STEP 1: Request received");

    const body = await req.json();
    console.log("STEP 2: Body:", body);

    const {
      fullName,
      email,
      phoneNumber,
      pmdcNumber,
      password,
    } = body;

    console.log("STEP 3: Checking existing doctor");

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
      let duplicateField = "Doctor";
      if (existingDoctor.email === email) duplicateField = "Email";
      else if (existingDoctor.phoneNumber === phoneNumber) duplicateField = "Phone number";
      else if (existingDoctor.pmdcNumber === pmdcNumber) duplicateField = "PMDC number";

      return Response.json(
        { message: `${duplicateField} is already registered` },
        { status: 400 }
      );
    }

    console.log("STEP 5: Hashing password");

    const hashedPassword = await hash(password, 10);

    console.log("STEP 6: Creating doctor");

    const doctor = await prisma.doctor.create({
      data: {
        fullName,
        email,
        phoneNumber,
        pmdcNumber,
        password: hashedPassword,
      },
    });

    console.log("STEP 7: Doctor created successfully");

    return Response.json({
      message: "Doctor registered",
      doctor,
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