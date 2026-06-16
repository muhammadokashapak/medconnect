import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push-helper";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // In production, enforce cron secret
      // return new NextResponse('Unauthorized', { status: 401 });
    }

    const now = new Date();
    // Find appointments between now and 30 minutes from now
    const upcomingTime = new Date(now.getTime() + 30 * 60000);

    const appointments = await prisma.appointment.findMany({
      where: {
        status: "ACCEPTED",
        scheduledAt: {
          gte: now,
          lte: upcomingTime
        }
      },
      include: {
        doctor: { select: { fullName: true } },
        consultant: { select: { fullName: true } }
      }
    });

    for (const app of appointments) {
      // Notify Doctor
      if (app.doctorId) {
        await sendPushNotification(app.doctorId, {
          title: "Upcoming Appointment Reminder",
          body: `You have an appointment with Dr. ${app.consultant?.fullName || "Consultant"} shortly. Please make time.`,
          url: "/appointments"
        });
      }
      
      // Notify Consultant
      if (app.consultantId) {
        await sendPushNotification(app.consultantId, {
          title: "Upcoming Appointment Reminder",
          body: `You have an appointment with Dr. ${app.doctor.fullName} shortly. Please make time.`,
          url: "/appointments"
        });
      }
    }

    return NextResponse.json({ success: true, count: appointments.length });
  } catch (err) {
    console.error("Cron Reminder Error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
