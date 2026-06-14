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

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        fullName: true,
        specialization: true,
        hospital: true,
        city: true,
        bio: true,
        profileImage: true,
        experienceYears: true,
        qualification: true,
        medicalCollege: true,
        linkedinUrl: true,
        websiteUrl: true,
        verificationStatus: true,
        isProfilePrivate: true,
      }
    });

    if (!doctor || doctor.verificationStatus !== "VERIFIED") {
      return NextResponse.json({ message: "Doctor not found or not verified" }, { status: 404 });
    }

    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: params.id,
        },
      },
    });

    const targetFollowsMe = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: params.id,
          followingId: userId,
        },
      },
    });

    const isFriend = Boolean(isFollowing && targetFollowsMe);

    const canViewPosts = !doctor.isProfilePrivate || isFriend || userId === params.id;

    const posts = canViewPosts
      ? await prisma.casePost.findMany({
          where: {
            doctorId: params.id,
            ...(userId !== params.id
              ? {
                  OR: [
                    { privacy: "PUBLIC" },
                    ...(isFriend ? [{ privacy: "FRIENDS" }] : []),
                  ],
                }
              : {}),
          },
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: {
                comments: true,
                reactions: true,
                views: true,
              },
            },
          },
        })
      : [];

    return NextResponse.json({
      ...doctor,
      isFollowing: Boolean(isFollowing),
      isFriend,
      posts,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
