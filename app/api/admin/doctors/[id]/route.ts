import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!";

async function getAdminId(req: Request): Promise<string | null> {
  const tokenCookie = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("medconnect_token="));
  if (!tokenCookie) return null;
  const token = tokenCookie.split("=")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const admin = await prisma.doctor.findUnique({ where: { id: decoded.id } });
    if (admin && admin.role === "ADMIN") {
      return admin.id;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const adminId = await getAdminId(req);
    if (!adminId) {
      return NextResponse.json({ message: "Forbidden. Admin access required." }, { status: 403 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        pmdcNumber: true,
        specialization: true,
        hospital: true,
        verificationStatus: true,
        verificationNotes: true,
        licenseImage: true,
        cnicImage: true,
        selfieImage: true,
        createdAt: true,
      }
    });

    if (!doctor) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json(doctor, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const adminId = await getAdminId(req);
    
    if (!adminId) {
      return NextResponse.json({ message: "Forbidden. Admin access required." }, { status: 403 });
    }

    const doctorToDelete = await prisma.doctor.findUnique({
      where: { id: params.id }
    });

    if (!doctorToDelete) {
      return NextResponse.json({ message: "Doctor not found" }, { status: 404 });
    }

    // Optional: add a check to prevent deleting verified admins
    if (doctorToDelete.role === "ADMIN") {
      return NextResponse.json({ message: "Cannot delete an Admin account" }, { status: 400 });
    }

    // Delete the doctor
    await prisma.doctor.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Doctor deleted successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ message: "Server Error during deletion" }, { status: 500 });
  }
}

