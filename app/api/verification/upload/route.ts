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
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { licenseImage, cnicImage, selfieImage } = body;

    if (!licenseImage || !cnicImage || !selfieImage) {
      return NextResponse.json({ message: "All verification documents are required" }, { status: 400 });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        licenseImage,
        cnicImage,
        selfieImage,
        verificationStatus: "PENDING",
      },
    });

    return NextResponse.json({ 
      message: "Verification documents submitted successfully",
      status: updatedDoctor.verificationStatus 
    }, { status: 200 });
  } catch (error) {
    console.error("Verification Upload Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
