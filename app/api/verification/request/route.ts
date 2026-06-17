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
    const { documents, pmdcNumber, hospital, qualification, specialization } = body;

    const dataToUpdate: any = {
      verificationStatus: "PENDING_REVIEW",
      isVerified: false,
      verificationRequestedAt: new Date(),
    };

    if (documents && Array.isArray(documents)) {
      dataToUpdate.verificationDocuments = JSON.stringify(documents);
    }
    
    // Optional updates
    if (pmdcNumber) dataToUpdate.pmdcNumber = pmdcNumber;
    if (hospital) dataToUpdate.hospital = hospital;
    if (qualification) dataToUpdate.qualification = qualification;
    if (specialization) dataToUpdate.specialization = specialization;

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: dataToUpdate,
    });

    return NextResponse.json({ message: "Verification request submitted successfully", doctor: updatedDoctor }, { status: 200 });
  } catch (error) {
    console.error("Verification Request Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
