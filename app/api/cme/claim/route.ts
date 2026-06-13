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

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ message: "Missing course ID" }, { status: 400 });

    const course = await prisma.cMECourse.findUnique({ where: { id: courseId } });
    if (!course) return NextResponse.json({ message: "Course not found" }, { status: 404 });

    const existing = await prisma.cMECertificate.findUnique({
      where: {
        doctorId_courseId: {
          doctorId: userId,
          courseId: courseId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ message: "Certificate already claimed" }, { status: 400 });
    }

    const cert = await prisma.cMECertificate.create({
      data: {
        doctorId: userId,
        courseId: courseId
      }
    });

    await prisma.activity.create({
      data: {
        doctorId: userId,
        type: "CME_CLAIM",
        description: `Earned ${course.credits} CME Credits for: ${course.title}`
      }
    });

    return NextResponse.json({ message: "Certificate claimed successfully", certificate: cert }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
