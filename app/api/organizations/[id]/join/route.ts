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

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const id = params?.id;
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    const organization = await prisma.organization.findUnique({ where: { id } });
    if (!organization) return NextResponse.json({ message: "Organization not found" }, { status: 404 });

    const existing = await prisma.orgMembership.findUnique({
      where: {
        doctorId_organizationId: {
          doctorId: userId,
          organizationId: id
        }
      }
    });

    if (existing) {
      return NextResponse.json({ message: "Already joined" }, { status: 400 });
    }

    await prisma.orgMembership.create({
      data: {
        doctorId: userId,
        organizationId: id,
        role: "MEMBER"
      }
    });

    // Activity log
    await prisma.activity.create({
      data: {
        doctorId: userId,
        type: "ORG_JOIN",
        description: `Joined ${organization.name}`
      }
    });

    return NextResponse.json({ message: "Joined organization successfully" }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
