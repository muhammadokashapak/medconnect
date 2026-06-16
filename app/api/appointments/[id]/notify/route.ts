import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { sendPushNotification } from "@/lib/push-helper";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!";

export const dynamic = "force-dynamic";

function getUserIdFromToken(req: Request): string | null {
  const tokenCookie = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("medconnect_token="));
  if (!tokenCookie) return null;
  const token = tokenCookie.split("=")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const params = await props.params;
    const appointmentId = params.id;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { select: { id: true, fullName: true } },
        consultant: { select: { id: true, fullName: true } }
      }
    });

    if (!appointment) return NextResponse.json({ message: "Appointment not found" }, { status: 404 });

    // Determine the other user
    const isConsultant = appointment.consultantId === userId;
    const otherUserId = isConsultant ? appointment.doctorId : appointment.consultantId;
    const currentUserFullName = isConsultant ? appointment.consultant?.fullName : appointment.doctor?.fullName;

    if (otherUserId && currentUserFullName) {
      // Create in-app notification
      await prisma.notification.create({
        data: {
          title: "Meeting Started",
          message: `Dr. ${currentUserFullName} has started the conference for your appointment. Please join now.`,
          type: "SYSTEM",
          actionUrl: `/video/${appointmentId}`,
          doctorId: otherUserId
        }
      });

      // Send push notification
      await sendPushNotification(otherUserId, {
        title: "Meeting Started",
        body: `Dr. ${currentUserFullName} has started the conference. Tap to join.`,
        url: `/video/${appointmentId}`
      });
    }

    return NextResponse.json({ message: "Notification sent" }, { status: 200 });
  } catch (error) {
    console.error("Notify error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
