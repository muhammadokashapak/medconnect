import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (prisma.comment) await prisma.comment.deleteMany({});
  if (prisma.caseReaction) await prisma.caseReaction.deleteMany({});
  if (prisma.caseView) await prisma.caseView.deleteMany({});
  if (prisma.savedCase) await prisma.savedCase.deleteMany({});
  if (prisma.casePost) await prisma.casePost.deleteMany({});
  if (prisma.videoPost) await prisma.videoPost.deleteMany({});
  if (prisma.notification) await prisma.notification.deleteMany({});
  if (prisma.message) await prisma.message.deleteMany({});
  if (prisma.conversationParticipant) await prisma.conversationParticipant.deleteMany({});
  if (prisma.conversation) await prisma.conversation.deleteMany({});
  console.log("Database cleared successfully for posts, videos, comments, and notifications.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
