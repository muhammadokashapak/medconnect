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

function getFriendIds(requests: { senderId: string; receiverId: string; status: string }[], doctorId: string): Set<string> {
  const friends = new Set<string>();
  requests.forEach((fr) => {
    if (fr.status === "ACCEPTED") {
      const otherId = fr.senderId === doctorId ? fr.receiverId : fr.senderId;
      friends.add(otherId);
    }
  });
  return friends;
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
      return NextResponse.json({ message: "doctorId is required" }, { status: 400 });
    }

    if (doctorId === userId) {
      return NextResponse.json({ mutualFriends: [], count: 0 }, { status: 200 });
    }

    // Get current user's friend requests
    const myRequests = await prisma.friendRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: { senderId: true, receiverId: true, status: true },
    });

    // Get target doctor's friend requests
    const theirRequests = await prisma.friendRequest.findMany({
      where: {
        OR: [{ senderId: doctorId }, { receiverId: doctorId }],
      },
      select: { senderId: true, receiverId: true, status: true },
    });

    const myFriends = getFriendIds(myRequests, userId);
    const theirFriends = getFriendIds(theirRequests, doctorId);

    // Find intersection
    const mutualIds = [...myFriends].filter((id) => theirFriends.has(id));

    // Fetch full details for mutual friends
    const mutualFriends = mutualIds.length > 0
      ? await prisma.doctor.findMany({
          where: { id: { in: mutualIds } },
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            specialization: true,
          },
        })
      : [];

    return NextResponse.json(
      { mutualFriends, count: mutualFriends.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mutual Friends Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
