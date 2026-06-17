import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!";

async function getAdminId(req: Request): Promise<string | null> {
  const tokenCookie = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("medconnect_token="));
  if (!tokenCookie) return null;
  const token = tokenCookie.split("=")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const admin = await prisma.doctor.findUnique({ where: { id: decoded.id } });
    if (admin && admin.role === "ADMIN") {
      return admin.id;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const adminId = await getAdminId(req);
    if (!adminId) {
      return NextResponse.json({ message: "Forbidden. Admin access required." }, { status: 403 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        pmdcNumber: true,
        specialization: true,
        hospital: true,
        verificationStatus: true,
        verificationNotes: true,
        licenseImage: true,
        cnicImage: true,
        selfieImage: true,
        createdAt: true,
      }
    });

    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json(doctor, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const adminId = await getAdminId(req);
    
    if (!adminId) {
      return NextResponse.json({ message: "Forbidden. Admin access required." }, { status: 403 });
    }

    const doctorToDelete = await prisma.doctor.findUnique({
      where: { id: params.id }
    });

    if (!doctorToDelete) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    // Optional: add a check to prevent deleting verified admins
    if (doctorToDelete.role === "ADMIN") {
      return NextResponse.json({ message: "Cannot delete an Admin account" }, { status: 400 });
    }

    // 1. Fetch dependent IDs that have their own nested relations
    const userPosts = await prisma.casePost.findMany({ where: { doctorId: params.id }, select: { id: true } });
    const postIds = userPosts.map(p => p.id);

    const patients = await prisma.patient.findMany({ where: { doctorId: params.id }, select: { id: true } });
    const patientIds = patients.map(p => p.id);

    const aiSessions = await prisma.aIClinicalSession.findMany({ where: { doctorId: params.id }, select: { id: true } });
    const sessionIds = aiSessions.map(s => s.id);

    // 2. Delete deeply nested records first
    if (patientIds.length > 0) {
      await prisma.$transaction([
        prisma.emergencyContact.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.medicalHistory.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.allergy.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.medication.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.diagnosis.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.vitalSigns.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.labResult.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.prescription.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.immunization.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.clinicalVisit.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.attachment.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.appointment.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.queueToken.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.followUpReminder.deleteMany({ where: { patientId: { in: patientIds } } }),
        prisma.invoice.deleteMany({ where: { patientId: { in: patientIds } } })
      ]);
    }

    if (sessionIds.length > 0) {
      await prisma.$transaction([
        prisma.aIConversation.deleteMany({ where: { sessionId: { in: sessionIds } } }),
        prisma.aIToolUsage.deleteMany({ where: { sessionId: { in: sessionIds } } })
      ]);
    }

    if (postIds.length > 0) {
      await prisma.$transaction([
        prisma.caseView.deleteMany({ where: { casePostId: { in: postIds } } }),
        prisma.caseReaction.deleteMany({ where: { casePostId: { in: postIds } } }),
        prisma.savedCase.deleteMany({ where: { casePostId: { in: postIds } } }),
        prisma.comment.deleteMany({ where: { casePostId: { in: postIds } } }),
      ]);
    }

    // 3. Delete direct associations to the Doctor
    await prisma.$transaction([
      prisma.caseView.deleteMany({ where: { doctorId: params.id } }),
      prisma.caseReaction.deleteMany({ where: { doctorId: params.id } }),
      prisma.savedCase.deleteMany({ where: { doctorId: params.id } }),
      prisma.comment.deleteMany({ where: { doctorId: params.id } }),
      prisma.message.deleteMany({ where: { senderId: params.id } }),
      prisma.conversationParticipant.deleteMany({ where: { doctorId: params.id } }),
      prisma.follow.deleteMany({ where: { OR: [{ followerId: params.id }, { followingId: params.id }] } }),
      prisma.friendRequest.deleteMany({ where: { OR: [{ senderId: params.id }, { receiverId: params.id }] } }),
      prisma.notification.deleteMany({ where: { doctorId: params.id } }),
      prisma.activity.deleteMany({ where: { doctorId: params.id } }),
      prisma.appointment.deleteMany({ where: { OR: [{ doctorId: params.id }, { consultantId: params.id }] } }),
      prisma.callHistory.deleteMany({ where: { OR: [{ callerId: params.id }, { receiverId: params.id }] } }),
      prisma.savedGuideline.deleteMany({ where: { doctorId: params.id } }),
      prisma.guideline.deleteMany({ where: { doctorId: params.id } }),
      prisma.savedResearch.deleteMany({ where: { doctorId: params.id } }),
      prisma.resourceView.deleteMany({ where: { doctorId: params.id } }),
      prisma.hospitalMembership.deleteMany({ where: { doctorId: params.id } }),
      prisma.departmentMembership.deleteMany({ where: { doctorId: params.id } }),
      prisma.orgMembership.deleteMany({ where: { doctorId: params.id } }),
      prisma.eventAttendance.deleteMany({ where: { doctorId: params.id } }),
      prisma.cMECertificate.deleteMany({ where: { doctorId: params.id } }),
      prisma.aIRequest.deleteMany({ where: { doctorId: params.id } }),
      prisma.videoPost.deleteMany({ where: { doctorId: params.id } }),
      prisma.pushSubscription.deleteMany({ where: { doctorId: params.id } }),
      prisma.prescription.deleteMany({ where: { doctorId: params.id } }),
      prisma.clinicalVisit.deleteMany({ where: { doctorId: params.id } }),
      prisma.queueToken.deleteMany({ where: { doctorId: params.id } }),
      
      // 4. Finally delete the models that had nested models (which we cleared above)
      prisma.casePost.deleteMany({ where: { doctorId: params.id } }),
      prisma.patient.deleteMany({ where: { doctorId: params.id } }),
      prisma.aIClinicalSession.deleteMany({ where: { doctorId: params.id } })
    ]);

    // 5. Now safely delete the doctor
    await prisma.doctor.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Doctor and all associated data deleted successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ message: "Server Error during deletion" }, { status: 500 });
  }
}

