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

export async function DELETE(req: Request, props: { params: Promise<{ messageId: string }> }) {
  try {
    const params = await props.params;
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const message = await prisma.message.findUnique({ where: { id: params.messageId } });
    if (!message || message.senderId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.message.delete({ where: { id: params.messageId } });

    return NextResponse.json({ message: "Message deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete Message Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ messageId: string }> }) {
  try {
    const params = await props.params;
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { content } = await req.json();
    if (!content) return NextResponse.json({ message: "Content is required" }, { status: 400 });

    const message = await prisma.message.findUnique({ where: { id: params.messageId } });
    if (!message || message.senderId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: params.messageId },
      data: { content, isEdited: true }
    });

    return NextResponse.json(updatedMessage, { status: 200 });
  } catch (error) {
    console.error("Edit Message Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
