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
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, fullName: true, specialization: true, profileImage: true } } }
    });

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, fullName: true, specialization: true, profileImage: true } } }
    });

    return NextResponse.json({ followers, following }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { followingId } = await req.json();
    if (!followingId) return NextResponse.json({ message: "followingId required" }, { status: 400 });
    if (userId === followingId) return NextResponse.json({ message: "Cannot follow yourself" }, { status: 400 });

    const existing = await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userId, followingId } } });
    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return NextResponse.json({ following: false }, { status: 200 });
    }

    await prisma.follow.create({ data: { followerId: userId, followingId } });
    await prisma.notification.create({ data: { doctorId: followingId, title: "New Follower", message: `Dr. started following you.`, type: "FOLLOW" } });

    return NextResponse.json({ following: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const followingId = searchParams.get("followingId");
    if (!followingId) return NextResponse.json({ message: "Missing followingId" }, { status: 400 });

    await prisma.follow.deleteMany({ where: { followerId: userId, followingId } });
    return NextResponse.json({ message: "Successfully unfollowed" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
