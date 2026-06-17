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

    if (!isAnonymous) {
      // Find friends to notify
      const myFollowers = await prisma.follow.findMany({ where: { followingId: doctorId }, select: { followerId: true } });
      const myFollowing = await prisma.follow.findMany({ where: { followerId: doctorId }, select: { followingId: true } });
      
      const followerIds = new Set(myFollowers.map(f => f.followerId));
      const friendsIds = myFollowing.filter(f => followerIds.has(f.followingId)).map(f => f.followingId);

      if (friendsIds.length > 0) {
        await prisma.notification.createMany({
          data: friendsIds.map(friendId => ({
            doctorId: friendId,
            title: "New Post from a Friend",
            message: `Dr. ${doctor.fullName} just posted a new case: "${title}".`,
            type: "SYSTEM",
            actionUrl: `/case/${newCase.id}`
          }))
        });
      }
    }

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
    const searchParams = url.searchParams;
    const requestedDoctorId = searchParams.get("doctorId");
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

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
      skip,
      take: limit,
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            isVerified: true,
            specialization: true,
            verificationStatus: true
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

    const total = await prisma.casePost.count({ where: whereClause });

    const sanitizedCases = cases.map((c) => {
      const _count = c._count || { comments: 0, views: 0, reactions: 0 };
      if (c.isAnonymous) {
        return {
          ...c,
          _count,
          doctor: {
            id: c.doctor.id,
            fullName: "Anonymous Doctor",
            specialization: null,
            profileImage: null,
            isVerified: c.doctor.isVerified,
            verificationStatus: null
          }
        };
      }
      return {
        ...c,
        _count,
        doctor: {
          id: c.doctor.id,
          fullName: c.doctor.fullName,
          specialization: c.doctor.specialization,
          profileImage: c.doctor.profileImage,
          isVerified: c.doctor.isVerified,
          verificationStatus: c.doctor.verificationStatus,
        }
      };
    });

    return NextResponse.json({
      data: sanitizedCases,
      meta: {
        total,
        page,
        limit,
        hasMore: skip + sanitizedCases.length < total
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Get Cases Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
