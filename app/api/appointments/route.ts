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
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { doctorId: userId },
          { consultantId: userId }
        ]
      },
      include: {
        doctor: { select: { fullName: true, specialization: true, profileImage: true } },
        consultant: { select: { fullName: true, specialization: true, profileImage: true } },
      },
      orderBy: { scheduledAt: "desc" }
    });

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { consultantId, scheduledAt, notes } = await req.json();

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: userId,
        consultantId,
        scheduledAt: new Date(scheduledAt),
        notes
      },
      include: { doctor: { select: { fullName: true } } }
    });

    if (consultantId) {
      await prisma.notification.create({
        data: {
          title: "New Appointment Request",
          message: `You have received a new appointment request from Dr. ${appointment.doctor.fullName}. Kindly review and confirm the schedule.`,
          type: "SYSTEM",
          actionUrl: "/appointments",
          doctorId: consultantId
        }
      });
      
      await sendPushNotification(consultantId, {
        title: "New Appointment Request",
        body: `Dr. ${appointment.doctor.fullName} has requested an appointment. Kindly confirm it.`,
        url: "/appointments"
      });
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { appointmentId, status, scheduledAt } = await req.json();

    const data: any = { status };
    if (scheduledAt) {
      data.scheduledAt = new Date(scheduledAt);
    }

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data,
      include: { doctor: true, consultant: true }
    });

    if (scheduledAt && status === "POSTPONED") {
      const isDoctor = appointment.doctorId === userId;
      
      // Update status to reflect who postponed
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: isDoctor ? "POSTPONED_BY_DOCTOR" : "POSTPONED_BY_CONSULTANT" }
      });

      const otherUserId = isDoctor ? appointment.consultantId : appointment.doctorId;
      const currentUser = isDoctor ? appointment.doctor : appointment.consultant;
      const formattedDate = new Date(scheduledAt).toLocaleString();

      if (otherUserId) {
        await prisma.notification.create({
          data: {
            title: "Meeting Rescheduled",
            message: `Your appointment has been rescheduled to ${formattedDate}. Kindly confirm or delete it from the appointments page.`,
            type: "SYSTEM",
            actionUrl: "/appointments",
            doctorId: otherUserId
          }
        });
        
        await sendPushNotification(otherUserId, {
          title: "Meeting Rescheduled",
          body: `Dr. ${currentUser?.fullName} has rescheduled your meeting to ${formattedDate}. Kindly confirm it.`,
          url: "/appointments"
        });
      }
    }

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    // Fetch the appointment with doctor and consultant info before deleting
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: { select: { id: true, fullName: true } },
        consultant: { select: { id: true, fullName: true } }
      }
    });

    if (!appointment) return NextResponse.json({ message: "Appointment not found" }, { status: 404 });

    // Authorization: only allow doctor or consultant to delete
    if (appointment.doctorId !== userId && appointment.consultantId !== userId) {
      return NextResponse.json({ message: "You are not authorized to cancel this appointment" }, { status: 403 });
    }

    // Determine who cancelled and who to notify
    const isDoctor = appointment.doctorId === userId;
    const cancellerName = isDoctor ? appointment.doctor?.fullName : appointment.consultant?.fullName;
    const otherUserId = isDoctor ? appointment.consultantId : appointment.doctorId;
    const scheduledDate = new Date(appointment.scheduledAt).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    // Delete any linked consultation first (cascade safety)
    await prisma.consultation.deleteMany({ where: { appointmentId: id } });

    // Delete the appointment
    await prisma.appointment.delete({ where: { id } });

    // Notify the other party
    if (otherUserId && cancellerName) {
      await prisma.notification.create({
        data: {
          title: "Meeting Cancelled",
          message: `Dr. ${cancellerName} has cancelled the meeting scheduled for ${scheduledDate}. It has been removed from your schedule.`,
          type: "SYSTEM",
          actionUrl: "/appointments",
          doctorId: otherUserId
        }
      });

      await sendPushNotification(otherUserId, {
        title: "Meeting Cancelled",
        body: `Dr. ${cancellerName} has cancelled the meeting scheduled for ${scheduledDate}. It has been removed from your schedule.`,
        url: "/appointments"
      });
    }

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
