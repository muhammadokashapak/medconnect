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

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    const patients = await prisma.patient.findMany({
      where: {
        doctorId: userId,
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { mrn: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } }
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        clinicalVisits: {
          orderBy: { visitedAt: "desc" },
          take: 1
        }
      }
    });

    return NextResponse.json(patients, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { mrn, fullName, gender, dob, bloodGroup, cnic, phone, address } = body;

    const patient = await prisma.patient.create({
      data: {
        mrn: mrn || `MRN-${Math.floor(Math.random() * 1000000)}`,
        fullName,
        gender,
        dob: new Date(dob),
        bloodGroup,
        cnic,
        phone,
        address,
        doctorId: userId
      }
    });

    await prisma.activity.create({
      data: {
        doctorId: userId,
        type: "NEW_PATIENT",
        description: `Registered new patient: ${fullName} (${patient.mrn})`
      }
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error", error: String(error) }, { status: 500 });
  }
}
