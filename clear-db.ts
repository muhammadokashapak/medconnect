import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany({});
  await prisma.caseReaction.deleteMany({});
  await prisma.caseView.deleteMany({});
  await prisma.savedCase.deleteMany({});
  await prisma.casePost.deleteMany({});
  await prisma.videoPost.deleteMany({});
  await prisma.notification.deleteMany({});
  console.log("Database cleared successfully for posts, videos, comments, and notifications.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
