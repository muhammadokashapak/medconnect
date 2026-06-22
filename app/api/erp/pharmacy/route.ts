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

    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ items });
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
    const { action, itemId, amount, name, category, unitPrice, minStock } = body;

    if (action === "create") {
      const item = await prisma.inventoryItem.create({
        data: { name, category, unitPrice, minStock, quantity: amount || 0 }
      });
      return NextResponse.json(item, { status: 201 });
    } else if (action === "adjust") {
      const item = await prisma.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: { increment: amount } }
      });
      // create stock movement
      await prisma.stockMovement.create({
        data: {
          itemId,
          type: amount > 0 ? "IN" : "OUT",
          quantity: Math.abs(amount)
        }
      });
      return NextResponse.json(item, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
