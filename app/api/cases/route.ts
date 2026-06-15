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

export async function POST(req: Request) {
  try {
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor || doctor.verificationStatus !== "VERIFIED") {
      return NextResponse.json({ message: "You must be fully verified by PMDC to post a case" }, { status: 403 });
    }

    const body = await req.json();
    const { title, specialty, description, imageUrl, isAnonymous, privacy } = body;

    if (!title || !specialty || !description) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newCase = await prisma.casePost.create({
      data: {
        title,
        specialty,
        description,
        imageUrl,
        isAnonymous: Boolean(isAnonymous),
        privacy: privacy || "PUBLIC",
        doctorId,
      },
    });

    return NextResponse.json({ message: "Case created successfully", casePost: newCase }, { status: 201 });
  } catch (error) {
    console.error("Create Case Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find friends (bi-directional follows)
    const myFollowers = await prisma.follow.findMany({ where: { followingId: doctorId }, select: { followerId: true } });
    const myFollowing = await prisma.follow.findMany({ where: { followerId: doctorId }, select: { followingId: true } });
    
    const followerIds = new Set(myFollowers.map(f => f.followerId));
    const friendsIds = myFollowing.filter(f => followerIds.has(f.followingId)).map(f => f.followingId);

    const url = new URL(req.url);
    const requestedDoctorId = url.searchParams.get("doctorId");

    let whereClause: any = {
      OR: [
        { doctorId: doctorId },
        { privacy: "PUBLIC" },
        { privacy: "FRIENDS", doctorId: { in: friendsIds } }
      ]
    };

    if (requestedDoctorId) {
      whereClause = { doctorId: requestedDoctorId };
    }

    const cases = await prisma.casePost.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            isVerified: true,
          }
        },
        _count: {
          select: { 
            comments: true,
            views: true,
            reactions: true
          }
        }
      }
    });

    const sanitizedCases = cases.map(c => {
      if (c.isAnonymous) {
        return {
          ...c,
          doctor: {
            id: c.doctor.id,
            fullName: "Anonymous Doctor",
            profileImage: null,
            isVerified: c.doctor.isVerified,
          }
        };
      }
      return c;
    });

    return NextResponse.json(sanitizedCases, { status: 200 });
  } catch (error) {
    console.error("Get Cases Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
