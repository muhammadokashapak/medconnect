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
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const courses = await prisma.cMECourse.findMany({
      include: {
        certificates: {
          where: { doctorId: userId }
        }
      },
      orderBy: { date: "desc" }
    });

    const userCertificates = await prisma.cMECertificate.findMany({
      where: { doctorId: userId },
      include: { course: true }
    });

    const totalCredits = userCertificates.reduce((acc, cert) => {
      const courseCredits = cert.course?.credits || 0;
      const customCredits = cert.customCredits || 0;
      return acc + courseCredits + customCredits;
    }, 0);

    return NextResponse.json({ courses, totalCredits, userCertificates }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { customTitle, customProvider, customCredits, certificateUrl } = await req.json();

    if (!customTitle || !customProvider || !certificateUrl) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const certificate = await prisma.cMECertificate.create({
      data: {
        doctorId: userId,
        customTitle,
        customProvider,
        customCredits: parseInt(customCredits) || 0,
        certificateUrl,
      }
    });

    return NextResponse.json({ message: "Certificate uploaded successfully", certificate }, { status: 201 });
  } catch (error) {
    console.error("Error creating custom certificate:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
