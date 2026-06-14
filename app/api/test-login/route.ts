import { NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { password, email } = body;
  
  const doctor = await prisma.doctor.findUnique({ where: { email } });
  if (!doctor) return NextResponse.json({ error: "No doc" });
  
  const isMatch = await compare(password, doctor.password);
  const testHash = await hash(password, 10);
  const testMatch = await compare(password, testHash);
  
  return NextResponse.json({ 
    storedHash: doctor.password, 
    inputLength: password.length,
    isMatch,
    testHash,
    testMatch
  });
}
