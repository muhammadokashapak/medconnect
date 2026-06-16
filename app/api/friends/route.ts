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

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    // Determine whose friends to fetch
    const targetId = doctorId || userId;
    const isOwnProfile = targetId === userId;

    // Get all friend requests involving the target doctor
    const requests = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: targetId },
          { receiverId: targetId },
        ],
      },
    });

    // Collect friend IDs (ACCEPTED) and pending IDs (only for own profile)
    const friendIds: string[] = [];
    const pendingIds: string[] = [];

    requests.forEach((fr) => {
      const otherId = fr.senderId === targetId ? fr.receiverId : fr.senderId;
      if (fr.status === "ACCEPTED") {
        friendIds.push(otherId);
      } else if (fr.status === "PENDING" && isOwnProfile) {
        pendingIds.push(otherId);
      }
    });

    // Fetch full details for friends
    const friends = await prisma.doctor.findMany({
      where: { id: { in: friendIds } },
      select: {
        id: true,
        fullName: true,
        profileImage: true,
        specialization: true,
        hospital: true,
        city: true,
      },
    });

    // Fetch full details for pending (only own profile)
    const pending = isOwnProfile
      ? await prisma.doctor.findMany({
          where: { id: { in: pendingIds } },
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            specialization: true,
            hospital: true,
            city: true,
          },
        })
      : [];

    return NextResponse.json(
      {
        friends,
        friendCount: friends.length,
        ...(isOwnProfile ? { pending } : {}),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Friends Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
