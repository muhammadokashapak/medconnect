import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== "medconnect_clear_123") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
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
    
    return NextResponse.json({ message: "Database cleared successfully for posts, videos, comments, and notifications." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
