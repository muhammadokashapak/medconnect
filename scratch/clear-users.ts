import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to clear non-admin users...");

  // Find all non-admin users
  const nonAdminDoctors = await prisma.doctor.findMany({
    where: {
      role: { not: 'ADMIN' },
    },
    select: { id: true, email: true },
  });

  const doctorIds = nonAdminDoctors.map(d => d.id);
  console.log(`Found ${doctorIds.length} non-admin users to delete.`);

  if (doctorIds.length === 0) {
    console.log("No non-admin users found. Exiting.");
    return;
  }

  // Delete child records manually since there is no Cascade delete defined in schema
  
  // 1. Delete EHR related
  await prisma.followUpReminder.deleteMany({ where: { patient: { doctorId: { in: doctorIds } } } });
  await prisma.queueToken.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.attachment.deleteMany({ where: { patient: { doctorId: { in: doctorIds } } } });
  await prisma.clinicalVisit.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.immunization.deleteMany({ where: { patient: { doctorId: { in: doctorIds } } } });
  await prisma.prescription.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.labResult.deleteMany({ where: { patient: { doctorId: { in: doctorIds } } } });
  await prisma.vitalSigns.deleteMany({ where: { patient: { doctorId: { in: doctorIds } } } });
  await prisma.diagnosis.deleteMany({ where: { patient: { doctorId: { in: doctorIds } } } });
  await prisma.medication.deleteMany({ where: { patient: { doctorId: { in: doctorIds } } } });
  await prisma.allergy.deleteMany({ where: { patient: { doctorId: { in: doctorIds } } } });
  await prisma.medicalHistory.deleteMany({ where: { patient: { doctorId: { in: doctorIds } } } });
  await prisma.emergencyContact.deleteMany({ where: { patient: { doctorId: { in: doctorIds } } } });
  await prisma.patient.deleteMany({ where: { doctorId: { in: doctorIds } } });

  // 2. Delete Memberships & Appointments
  await prisma.cMECertificate.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.eventAttendance.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.orgMembership.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.departmentMembership.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.hospitalMembership.deleteMany({ where: { doctorId: { in: doctorIds } } });
  
  await prisma.consultation.deleteMany({ where: { appointment: { doctorId: { in: doctorIds } } } });
  await prisma.appointment.deleteMany({ where: { OR: [{ doctorId: { in: doctorIds } }, { consultantId: { in: doctorIds } }] } });
  await prisma.callHistory.deleteMany({ where: { OR: [{ callerId: { in: doctorIds } }, { receiverId: { in: doctorIds } }] } });

  // 3. Delete Social & Content
  await prisma.resourceView.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.savedResearch.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.savedGuideline.deleteMany({ where: { doctorId: { in: doctorIds } } });
  
  await prisma.activity.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.savedCase.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.friendRequest.deleteMany({ where: { OR: [{ senderId: { in: doctorIds } }, { receiverId: { in: doctorIds } }] } });
  await prisma.follow.deleteMany({ where: { OR: [{ followerId: { in: doctorIds } }, { followingId: { in: doctorIds } }] } });
  await prisma.notification.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.aIRequest.deleteMany({ where: { doctorId: { in: doctorIds } } });
  
  await prisma.message.deleteMany({ where: { senderId: { in: doctorIds } } });
  await prisma.conversationParticipant.deleteMany({ where: { doctorId: { in: doctorIds } } });
  // Optionally clean up empty conversations
  
  await prisma.comment.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.videoPost.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.caseReaction.deleteMany({ where: { doctorId: { in: doctorIds } } });
  await prisma.caseView.deleteMany({ where: { doctorId: { in: doctorIds } } });
  
  // Clean comments on their cases before deleting cases
  await prisma.comment.deleteMany({ where: { casePost: { doctorId: { in: doctorIds } } } });
  await prisma.caseReaction.deleteMany({ where: { casePost: { doctorId: { in: doctorIds } } } });
  await prisma.caseView.deleteMany({ where: { casePost: { doctorId: { in: doctorIds } } } });
  await prisma.savedCase.deleteMany({ where: { casePost: { doctorId: { in: doctorIds } } } });
  await prisma.casePost.deleteMany({ where: { doctorId: { in: doctorIds } } });

  // Finally, delete the doctors
  const deletedDoctors = await prisma.doctor.deleteMany({
    where: { id: { in: doctorIds } },
  });

  console.log(`Successfully deleted ${deletedDoctors.count} non-admin users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
