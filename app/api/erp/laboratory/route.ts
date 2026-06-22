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

    const orders = await prisma.labOrder.findMany({
      include: { report: true },
      orderBy: { orderedAt: "desc" }
    });

    return NextResponse.json({ orders });
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
    const { action, orderId, findings, testName, patientId } = body;

    if (action === "create") {
      const order = await prisma.labOrder.create({
        data: {
          testName,
          patientId,
          status: "PENDING"
        }
      });
      return NextResponse.json(order, { status: 201 });
    } else if (action === "complete") {
      const report = await prisma.labReport.create({
        data: {
          findings,
          orderId
        }
      });
      const order = await prisma.labOrder.update({
        where: { id: orderId },
        data: { status: "COMPLETED" },
        include: { report: true }
      });
      return NextResponse.json(order, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
