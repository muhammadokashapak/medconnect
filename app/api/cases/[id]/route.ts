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

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const casePost = await prisma.casePost.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialization: true,
            profileImage: true,
            isVerified: true,
          }
        },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            doctor: {
              select: {
                id: true,
                fullName: true,
                profileImage: true,
                isVerified: true,
              }
            }
          }
        },
        _count: {
          select: {
            views: true,
            reactions: true
          }
        }
      }
    });

    if (!casePost) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }

    if (casePost.isAnonymous) {
      casePost.doctor = {
        id: "",
        fullName: "Anonymous Doctor",
        specialization: "",
        profileImage: null,
        isVerified: casePost.doctor.isVerified,
      } as any;
    }

    return NextResponse.json(casePost, { status: 200 });
  } catch (error) {
    console.error("Get Case Details Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
