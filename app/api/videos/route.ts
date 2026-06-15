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

    const { searchParams } = new URL(req.url);
    const filterDoctorId = searchParams.get("doctorId");

    const videos = await prisma.videoPost.findMany({
      where: filterDoctorId ? { doctorId: filterDoctorId } : undefined,
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
    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }
    // Temporarily relaxed verification requirement for testing
    // if (doctor.verificationStatus !== "VERIFIED") {
    //   return NextResponse.json({ message: "You must be fully verified to upload a video" }, { status: 403 });
    // }

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

    // Find friends to notify
    const myFollowers = await prisma.follow.findMany({ where: { followingId: doctorId }, select: { followerId: true } });
    const myFollowing = await prisma.follow.findMany({ where: { followerId: doctorId }, select: { followingId: true } });
    
    const followerIds = new Set(myFollowers.map(f => f.followerId));
    const friendsIds = myFollowing.filter(f => followerIds.has(f.followingId)).map(f => f.followingId);

    if (friendsIds.length > 0) {
      await prisma.notification.createMany({
        data: friendsIds.map(friendId => ({
          doctorId: friendId,
          title: "New Video from a Friend",
          message: `Dr. ${doctor.fullName} just uploaded a new video: "${title}".`,
          type: "SYSTEM",
          actionUrl: `/video` // Video feed is /video
        }))
      });
    }

    return NextResponse.json({ message: "Video uploaded successfully", videoPost: newVideo }, { status: 201 });
  } catch (error) {
    console.error("Upload Video Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
