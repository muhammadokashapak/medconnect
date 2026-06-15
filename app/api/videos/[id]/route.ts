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

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const video = await prisma.videoPost.findUnique({ where: { id: params.id } });
    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    if (video.doctorId !== doctorId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { title, description } = await req.json();

    const updatedVideo = await prisma.videoPost.update({
      where: { id: params.id },
      data: { title, description },
    });

    return NextResponse.json(updatedVideo, { status: 200 });
  } catch (error) {
    console.error("Update Video Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const video = await prisma.videoPost.findUnique({ where: { id: params.id } });
    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    if (video.doctorId !== doctorId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.videoPost.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Video deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Video Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
