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
    const currentUser = getUserIdFromToken(req);
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const casePost = await prisma.casePost.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialization: true,
            profileImage: true,
            isVerified: true,
          }
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            doctor: {
              select: {
                id: true,
                fullName: true,
                profileImage: true,
                isVerified: true,
              }
            }
          }
        },
        _count: {
          select: {
            views: true,
            reactions: true
          }
        }
      }
    });

    if (!casePost) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }

    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser,
          followingId: casePost.doctorId,
        },
      },
    });

    const authorFollowsMe = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: casePost.doctorId,
          followingId: currentUser,
        },
      },
    });

    const isFriend = Boolean(isFollowing && authorFollowsMe);

    if (casePost.privacy === "FRIENDS" && casePost.doctorId !== currentUser && !isFriend) {
      return NextResponse.json({ message: "This post is private" }, { status: 403 });
    }

    if (casePost.isAnonymous) {
      casePost.doctor = {
        id: "",
        fullName: "Anonymous Doctor",
        specialization: "",
        profileImage: null,
        isVerified: casePost.doctor.isVerified,
      } as any;
    }

    return NextResponse.json(casePost, { status: 200 });
  } catch (error) {
    console.error("Get Case Details Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const currentUser = getUserIdFromToken(req);
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const casePost = await prisma.casePost.findUnique({ where: { id } });
    if (!casePost) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }
    if (casePost.doctorId !== currentUser) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, specialty, description, imageUrl, isAnonymous, privacy } = body;

    const updatedPost = await prisma.casePost.update({
      where: { id },
      data: {
        title: title ?? casePost.title,
        specialty: specialty ?? casePost.specialty,
        description: description ?? casePost.description,
        imageUrl: imageUrl ?? casePost.imageUrl,
        isAnonymous: isAnonymous ?? casePost.isAnonymous,
        privacy: privacy ?? casePost.privacy,
      },
    });

    return NextResponse.json({ message: "Post updated successfully", casePost: updatedPost }, { status: 200 });
  } catch (error) {
    console.error("Update Case Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const currentUser = getUserIdFromToken(req);
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const casePost = await prisma.casePost.findUnique({ where: { id } });
    if (!casePost) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }
    if (casePost.doctorId !== currentUser) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.comment.deleteMany({ where: { casePostId: id } });
    await prisma.caseView.deleteMany({ where: { casePostId: id } });
    await prisma.caseReaction.deleteMany({ where: { casePostId: id } });
    await prisma.savedCase.deleteMany({ where: { casePostId: id } });
    await prisma.casePost.delete({ where: { id } });

    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Case Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
