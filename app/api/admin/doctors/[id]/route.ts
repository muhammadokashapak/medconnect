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

    // Begin Cascade Deletion of all related data
    await prisma.$transaction([
      prisma.caseView.deleteMany({ where: { doctorId: params.id } }),
      prisma.caseReaction.deleteMany({ where: { doctorId: params.id } }),
      prisma.savedCase.deleteMany({ where: { doctorId: params.id } }),
      prisma.comment.deleteMany({ where: { doctorId: params.id } }),
      prisma.message.deleteMany({ where: { senderId: params.id } }),
      prisma.conversationParticipant.deleteMany({ where: { doctorId: params.id } }),
      prisma.follow.deleteMany({ where: { OR: [{ followerId: params.id }, { followingId: params.id }] } }),
      prisma.notification.deleteMany({ where: { doctorId: params.id } }),
      prisma.activity.deleteMany({ where: { doctorId: params.id } }),
      prisma.savedGuideline.deleteMany({ where: { doctorId: params.id } }),
      prisma.savedResearch.deleteMany({ where: { doctorId: params.id } }),
      prisma.resourceView.deleteMany({ where: { doctorId: params.id } }),
      prisma.hospitalMembership.deleteMany({ where: { doctorId: params.id } }),
      prisma.departmentMembership.deleteMany({ where: { doctorId: params.id } }),
      prisma.orgMembership.deleteMany({ where: { doctorId: params.id } }),
      prisma.eventAttendance.deleteMany({ where: { doctorId: params.id } }),
      prisma.cMECertificate.deleteMany({ where: { doctorId: params.id } }),
      prisma.aIRequest.deleteMany({ where: { doctorId: params.id } }),
      prisma.videoPost.deleteMany({ where: { doctorId: params.id } }),
      // For CasePosts, we also need to delete views/reactions/comments tied to those posts
      // but prisma deleteMany on casePosts doesn't cascade if there are foreign keys.
      // Easiest is to find all their case posts, delete related data, then delete the case posts.
    ]);

    // Handle CasePosts specifically because they have incoming relations (comments, views, reactions)
    const userPosts = await prisma.casePost.findMany({ where: { doctorId: params.id }, select: { id: true } });
    const postIds = userPosts.map(p => p.id);
    
    if (postIds.length > 0) {
      await prisma.$transaction([
        prisma.caseView.deleteMany({ where: { casePostId: { in: postIds } } }),
        prisma.caseReaction.deleteMany({ where: { casePostId: { in: postIds } } }),
        prisma.savedCase.deleteMany({ where: { casePostId: { in: postIds } } }),
        prisma.comment.deleteMany({ where: { casePostId: { in: postIds } } }),
        prisma.casePost.deleteMany({ where: { doctorId: params.id } })
      ]);
    }

    // Now delete the doctor
    await prisma.doctor.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Doctor and all associated data deleted successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ message: "Server Error during deletion" }, { status: 500 });
  }
}

