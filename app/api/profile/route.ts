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
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const doctorPromise = prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        cmeCertificates: {
          include: {
            course: true
          }
        }
      }
    });

    const updateMessagesPromise = prisma.message.updateMany({
      where: {
        conversation: {
          participants: {
            some: { doctorId: doctorId }
          }
        },
        senderId: { not: doctorId },
        isDelivered: false
      },
      data: { isDelivered: true }
    });

    const [doctor] = await Promise.all([doctorPromise, updateMessagesPromise]);

    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    let tokenStatus = null;
    const tokenCookie = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("medconnect_token="));
    if (tokenCookie) {
      const token = tokenCookie.split("=")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        tokenStatus = decoded.verificationStatus;
      } catch(e) {}
    }

    const { password, ...safeDoctor } = doctor;
    const response = NextResponse.json(safeDoctor, { status: 200 });

    if (doctor.verificationStatus === 'VERIFIED' && tokenStatus !== 'VERIFIED') {
      const isLegacyUser = new Date(doctor.createdAt) < new Date("2026-06-16T00:00:00Z");
      const newToken = jwt.sign(
        { id: doctor.id, email: doctor.email, role: doctor.role, verificationStatus: "VERIFIED", isLegacyUser },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      response.cookies.set("medconnect_token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      specialization,
      hospital,
      city,
      bio,
      profileImage,
      coverImage,
      experienceYears,
      qualification,
      medicalCollege,
      linkedinUrl,
      websiteUrl,
    } = body;

    // Basic Validation
    if (fullName && fullName.length < 3) {
      return NextResponse.json({ message: "Full Name must be at least 3 characters long." }, { status: 400 });
    }
    if (bio && bio.length > 500) {
      return NextResponse.json({ message: "Bio cannot exceed 500 characters." }, { status: 400 });
    }
    if (experienceYears !== undefined && experienceYears !== null && experienceYears < 0) {
      return NextResponse.json({ message: "Experience must be a positive integer." }, { status: 400 });
    }
    if (linkedinUrl && !/^https?:\/\/.*/.test(linkedinUrl)) {
      return NextResponse.json({ message: "LinkedIn URL must be a valid URL starting with http/https." }, { status: 400 });
    }
    if (websiteUrl && !/^https?:\/\/.*/.test(websiteUrl)) {
      return NextResponse.json({ message: "Website URL must be a valid URL starting with http/https." }, { status: 400 });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        fullName,
        specialization,
        hospital,
        city,
        bio,
        profileImage,
        coverImage,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
        qualification,
        medicalCollege,
        linkedinUrl,
        websiteUrl,
        isProfilePrivate: body.isProfilePrivate ?? false,
      },
    });

    const { password, ...safeDoctor } = updatedDoctor;
    return NextResponse.json({ message: "Profile updated successfully", doctor: safeDoctor }, { status: 200 });
  } catch (error) {
    console.error("Profile PUT Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const doctorToDelete = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctorToDelete) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    if (doctorToDelete.role === "ADMIN") {
      return NextResponse.json({ message: "Cannot delete an Admin account from settings. Contact support." }, { status: 400 });
    }

    // 1. Fetch dependent IDs that have their own nested relations
    const userPosts = await prisma.casePost.findMany({ where: { doctorId }, select: { id: true } });
    const postIds = userPosts.map(p => p.id);

    const patients = await prisma.patient.findMany({ where: { doctorId }, select: { id: true } });
    const patientIds = patients.map(p => p.id);

    const aiSessions = await prisma.aIClinicalSession.findMany({ where: { doctorId }, select: { id: true } });
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
      prisma.caseView.deleteMany({ where: { doctorId } }),
      prisma.caseReaction.deleteMany({ where: { doctorId } }),
      prisma.savedCase.deleteMany({ where: { doctorId } }),
      prisma.comment.deleteMany({ where: { doctorId } }),
      prisma.message.deleteMany({ where: { senderId: doctorId } }),
      prisma.conversationParticipant.deleteMany({ where: { doctorId } }),
      prisma.follow.deleteMany({ where: { OR: [{ followerId: doctorId }, { followingId: doctorId }] } }),
      prisma.friendRequest.deleteMany({ where: { OR: [{ senderId: doctorId }, { receiverId: doctorId }] } }),
      prisma.notification.deleteMany({ where: { doctorId } }),
      prisma.activity.deleteMany({ where: { doctorId } }),
      prisma.appointment.deleteMany({ where: { OR: [{ doctorId }, { consultantId: doctorId }] } }),
      prisma.callHistory.deleteMany({ where: { OR: [{ callerId: doctorId }, { receiverId: doctorId }] } }),
      prisma.savedGuideline.deleteMany({ where: { doctorId } }),
      prisma.guideline.deleteMany({ where: { doctorId } }),
      prisma.savedResearch.deleteMany({ where: { doctorId } }),
      prisma.resourceView.deleteMany({ where: { doctorId } }),
      prisma.hospitalMembership.deleteMany({ where: { doctorId } }),
      prisma.departmentMembership.deleteMany({ where: { doctorId } }),
      prisma.orgMembership.deleteMany({ where: { doctorId } }),
      prisma.eventAttendance.deleteMany({ where: { doctorId } }),
      prisma.cMECertificate.deleteMany({ where: { doctorId } }),
      prisma.aIRequest.deleteMany({ where: { doctorId } }),
      prisma.videoPost.deleteMany({ where: { doctorId } }),
      prisma.pushSubscription.deleteMany({ where: { doctorId } }),
      prisma.prescription.deleteMany({ where: { doctorId } }),
      prisma.clinicalVisit.deleteMany({ where: { doctorId } }),
      prisma.queueToken.deleteMany({ where: { doctorId } }),
      
      // 4. Finally delete the models that had nested models (which we cleared above)
      prisma.casePost.deleteMany({ where: { doctorId } }),
      prisma.patient.deleteMany({ where: { doctorId } }),
      prisma.aIClinicalSession.deleteMany({ where: { doctorId } })
    ]);

    // 5. Now safely delete the doctor
    await prisma.doctor.delete({
      where: { id: doctorId }
    });

    const response = NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });

    // Clear token cookie
    response.cookies.set({
      name: "medconnect_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    return response;

  } catch (error: any) {
    console.error("Profile Delete Error:", error);
    return NextResponse.json({ message: "Server Error during account deletion" }, { status: 500 });
  }
}
