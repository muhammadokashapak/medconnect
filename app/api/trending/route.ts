import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cases = await prisma.casePost.findMany({
      include: {
        doctor: { select: { fullName: true, specialization: true, profileImage: true } },
        _count: { select: { comments: true, savedBy: true } }
      },
      orderBy: [
        { savedBy: { _count: "desc" } },
        { comments: { _count: "desc" } }
      ],
      take: 10
    });

    return NextResponse.json(cases, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
