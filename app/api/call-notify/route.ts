import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { sendPushNotification } from "@/lib/push-helper";

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
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { targetDoctorId, callType, roomId } = await req.json();

    if (!targetDoctorId || !callType || !roomId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (callType !== "VIDEO" && callType !== "AUDIO") {
      return NextResponse.json({ message: "Invalid call type" }, { status: 400 });
    }

    // Get caller's name
    const caller = await prisma.doctor.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });

    if (!caller) {
      return NextResponse.json({ message: "Caller not found" }, { status: 404 });
    }

    const title = callType === "VIDEO" ? "Incoming Video Call" : "Incoming Voice Call";
    const message = `Dr. ${caller.fullName} is calling you`;

    // Create in-app notification
    await prisma.notification.create({
      data: {
        doctorId: targetDoctorId,
        title,
        message,
        type: "SYSTEM",
        actionUrl: `/video/${roomId}`,
      },
    });

    // Try to send push notification
    try {
      await sendPushNotification(targetDoctorId, {
        title,
        body: message,
        data: {
          type: "CALL",
          callType,
          roomId,
          callerId: userId,
          actionUrl: `/video/${roomId}`,
        },
      });
    } catch (pushError) {
      // Push notification failed silently — in-app notification still created
      console.error("Push notification failed:", pushError);
    }

    return NextResponse.json({ success: true, roomId }, { status: 200 });
  } catch (error) {
    console.error("Call Notify Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
