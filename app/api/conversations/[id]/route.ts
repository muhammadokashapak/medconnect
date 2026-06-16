import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
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

export async function DELETE(req: Request, props: { params: any }) {
  try {
    const params = await props.params;
    const conversationId = params?.id || (props.params as any)?.id;
    
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Check if user is part of the conversation
    const participation = await prisma.conversationParticipant.findUnique({
      where: { conversationId_doctorId: { conversationId, doctorId: userId } }
    });
    
    if (!participation) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Delete all messages first
    await prisma.message.deleteMany({
      where: { conversationId }
    });

    // Delete participants
    await prisma.conversationParticipant.deleteMany({
      where: { conversationId }
    });

    // Finally delete the conversation
    await prisma.conversation.delete({
      where: { id: conversationId }
    });

    return NextResponse.json({ message: "Conversation deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete Conversation Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
