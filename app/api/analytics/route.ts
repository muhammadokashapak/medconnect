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

    const [
      casesPosted,
      commentsMade,
      savedCases,
      followers,
      following,
      messagesSent,
      aiRequestsUsed,
      totalAppointments,
      totalVideoCalls,
      totalAudioCalls,
      consultations,
      newsViewed,
      guidelinesViewed,
      drugsViewed,
      researchDownloads,
      cmeCreditsObj
    ] = await Promise.all([
      prisma.casePost.count({ where: { doctorId: userId } }),
      prisma.comment.count({ where: { doctorId: userId } }),
      prisma.savedCase.count({ where: { doctorId: userId } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.message.count({ where: { senderId: userId } }),
      prisma.aIRequest.count({ where: { doctorId: userId } }),
      prisma.appointment.count({ where: { OR: [{ doctorId: userId }, { consultantId: userId }] } }),
      prisma.callHistory.count({ where: { OR: [{ callerId: userId }, { receiverId: userId }], type: 'VIDEO' } }),
      prisma.callHistory.count({ where: { OR: [{ callerId: userId }, { receiverId: userId }], type: 'AUDIO' } }),
      prisma.consultation.findMany({
        where: { appointment: { OR: [{ doctorId: userId }, { consultantId: userId }] } },
        select: { duration: true }
      }),
      // Phase 9 Metrics
      prisma.resourceView.count({ where: { doctorId: userId, resourceType: 'NEWS' } }),
      prisma.resourceView.count({ where: { doctorId: userId, resourceType: 'GUIDELINE' } }),
      prisma.resourceView.count({ where: { doctorId: userId, resourceType: 'DRUG' } }),
      prisma.activity.count({ where: { doctorId: userId, type: 'DOWNLOAD_RESEARCH' } }),
      // Phase 10 Metrics
      prisma.cMECertificate.findMany({
        where: { doctorId: userId },
        include: { course: true }
      })
    ]);

    const totalConsultations = consultations.length;
    const avgConsultationDuration = totalConsultations > 0 
      ? Math.round(consultations.reduce((acc: number, c: any) => acc + (c.duration || 0), 0) / totalConsultations)
      : 0;

    const totalCmeCredits = cmeCreditsObj.reduce((acc: number, cert: any) => acc + cert.course.credits, 0);

    return NextResponse.json({
      casesPosted,
      commentsMade,
      savedCases,
      followers,
      following,
      messagesSent,
      aiRequestsUsed,
      totalAppointments,
      totalVideoCalls,
      totalAudioCalls,
      totalConsultations,
      avgConsultationDuration,
      newsViewed,
      guidelinesViewed,
      drugsViewed,
      researchDownloads,
      totalCmeCredits
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
