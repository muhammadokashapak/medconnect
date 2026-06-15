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

    const requests = await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        sender: {
          select: { id: true, fullName: true, profileImage: true, specialization: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { action, targetId, requestId } = await req.json();

    if (action === "send") {
      if (!targetId || targetId === userId) return NextResponse.json({ message: "Invalid target" }, { status: 400 });
      
      const existing = await prisma.friendRequest.findUnique({
        where: { senderId_receiverId: { senderId: userId, receiverId: targetId } }
      });

      if (existing) {
        return NextResponse.json({ message: "Request already sent" }, { status: 400 });
      }

      await prisma.friendRequest.create({
        data: { senderId: userId, receiverId: targetId, status: "PENDING" }
      });

      const sender = await prisma.doctor.findUnique({ where: { id: userId } });

      await prisma.notification.create({
        data: {
          doctorId: targetId,
          title: "New Friend Request",
          message: `Dr. ${sender?.fullName} sent you a friend request.`,
          type: "SYSTEM",
          actionUrl: "/notifications"
        }
      });

      return NextResponse.json({ message: "Request sent" }, { status: 200 });
    }

    if (action === "accept" || action === "decline") {
      if (!requestId) return NextResponse.json({ message: "Request ID missing" }, { status: 400 });

      const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
      if (!request || request.receiverId !== userId) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      if (action === "accept") {
        await prisma.friendRequest.update({
          where: { id: requestId },
          data: { status: "ACCEPTED" }
        });

        // Add to Follow bi-directionally
        await prisma.follow.upsert({
          where: { followerId_followingId: { followerId: request.senderId, followingId: userId } },
          update: {},
          create: { followerId: request.senderId, followingId: userId }
        });

        await prisma.follow.upsert({
          where: { followerId_followingId: { followerId: userId, followingId: request.senderId } },
          update: {},
          create: { followerId: userId, followingId: request.senderId }
        });

        const receiver = await prisma.doctor.findUnique({ where: { id: userId } });
        await prisma.notification.create({
          data: {
            doctorId: request.senderId,
            title: "Friend Request Accepted",
            message: `Dr. ${receiver?.fullName} accepted your friend request.`,
            type: "SYSTEM",
            actionUrl: `/doctor/${userId}`
          }
        });
      } else if (action === "decline") {
        await prisma.friendRequest.update({
          where: { id: requestId },
          data: { status: "DECLINED" }
        });
      }

      return NextResponse.json({ message: `Request ${action}ed` }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Friend Request Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
