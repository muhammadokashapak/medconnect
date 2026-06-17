import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key")
    );
    return verified.payload.userId as string;
  } catch (err) {
    return null;
  }
}

export async function requireAuth() {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return { error: "Unauthorized", status: 401 };
  }
  return { userId, error: null };
}

export async function requireRole(requiredRole: string) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return { error: "Unauthorized", status: 401 };

  const user = await prisma.doctor.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role !== requiredRole) {
    return { error: "Forbidden", status: 403 };
  }
  
  return { userId, user, error: null };
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}
