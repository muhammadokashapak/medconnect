import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.doctor.findMany({ select: { id: true, email: true, fullName: true, role: true, pmdcNumber: true } });
  return NextResponse.json(users);
}
