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

    const videos = await prisma.videoPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: {
          select: {
            fullName: true,
            profileImage: true,
            isVerified: true,
            specialization: true,
          }
        }
      }
    });

    return NextResponse.json(videos, { status: 200 });
  } catch (error) {
    console.error("Get Videos Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor || doctor.verificationStatus !== "VERIFIED") {
      return NextResponse.json({ message: "You must be fully verified to upload a video" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, videoUrl, thumbnailUrl } = body;

    if (!title || !videoUrl) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newVideo = await prisma.videoPost.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        doctorId,
      },
    });

    return NextResponse.json({ message: "Video uploaded successfully", videoPost: newVideo }, { status: 201 });
  } catch (error) {
    console.error("Upload Video Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
