import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

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

export async function GET(req: Request) {
  try {
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    // Mark pending messages as delivered
    await prisma.message.updateMany({
      where: {
        conversation: {
          participants: {
            some: { doctorId: doctorId }
          }
        },
        senderId: { not: doctorId },
        isDelivered: false
      },
      data: { isDelivered: true }
    });

    const { password, ...safeDoctor } = doctor;
    return NextResponse.json(safeDoctor, { status: 200 });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      specialization,
      hospital,
      city,
      bio,
      profileImage,
      coverImage,
      experienceYears,
      qualification,
      medicalCollege,
      linkedinUrl,
      websiteUrl,
    } = body;

    // Basic Validation
    if (fullName && fullName.length < 3) {
      return NextResponse.json({ message: "Full Name must be at least 3 characters long." }, { status: 400 });
    }
    if (bio && bio.length > 500) {
      return NextResponse.json({ message: "Bio cannot exceed 500 characters." }, { status: 400 });
    }
    if (experienceYears !== undefined && experienceYears !== null && experienceYears < 0) {
      return NextResponse.json({ message: "Experience must be a positive integer." }, { status: 400 });
    }
    if (linkedinUrl && !/^https?:\/\/.*/.test(linkedinUrl)) {
      return NextResponse.json({ message: "LinkedIn URL must be a valid URL starting with http/https." }, { status: 400 });
    }
    if (websiteUrl && !/^https?:\/\/.*/.test(websiteUrl)) {
      return NextResponse.json({ message: "Website URL must be a valid URL starting with http/https." }, { status: 400 });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        fullName,
        specialization,
        hospital,
        city,
        bio,
        profileImage,
        coverImage,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
        qualification,
        medicalCollege,
        linkedinUrl,
        websiteUrl,
        isProfilePrivate: body.isProfilePrivate ?? false,
      },
    });

    const { password, ...safeDoctor } = updatedDoctor;
    return NextResponse.json({ message: "Profile updated successfully", doctor: safeDoctor }, { status: 200 });
  } catch (error) {
    console.error("Profile PUT Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
