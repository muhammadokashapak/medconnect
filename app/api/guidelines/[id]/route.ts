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

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const id = params?.id;
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    const guideline = await prisma.guideline.findUnique({
      where: { id }
    });

    if (!guideline) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Check if saved
    const isSaved = await prisma.savedGuideline.findUnique({
      where: {
        doctorId_guidelineId: {
          doctorId: userId,
          guidelineId: id
        }
      }
    });

    // Record view
    await prisma.resourceView.create({
      data: {
        resourceType: 'GUIDELINE',
        resourceId: id,
        resourceTitle: guideline.title,
        doctorId: userId
      }
    });

    return NextResponse.json({ ...guideline, isSaved: !!isSaved }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const id = params?.id;
    if (!id) return NextResponse.json({ message: "Missing ID" }, { status: 400 });

    const { action } = await req.json();

    if (action === 'save') {
      await prisma.savedGuideline.create({
        data: {
          doctorId: userId,
          guidelineId: id
        }
      });
      return NextResponse.json({ message: "Saved" }, { status: 200 });
    } else if (action === 'unsave') {
      await prisma.savedGuideline.delete({
        where: {
          doctorId_guidelineId: {
            doctorId: userId,
            guidelineId: id
          }
        }
      });
      return NextResponse.json({ message: "Unsaved" }, { status: 200 });
    }
    
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
