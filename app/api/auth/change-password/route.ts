import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { getUserIdFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return Response.json(
        { message: "Current password and new password are required." },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: userId },
    });

    if (!doctor) {
      return Response.json({ message: "User not found." }, { status: 404 });
    }

    const isMatch = await compare(currentPassword, doctor.password);

    if (!isMatch) {
      return Response.json(
        { message: "Incorrect current password." },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(newPassword, 10);

    await prisma.doctor.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return Response.json({ message: "Password updated successfully." });
  } catch (error: any) {
    console.error("Change password error:", error);
    return Response.json(
      { message: "An error occurred while updating the password." },
      { status: 500 }
    );
  }
}
