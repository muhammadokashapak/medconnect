import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_medconnect_123!";
const VAPID_PUBLIC_KEY = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "").trim().replace(/=/g, '');
const VAPID_PRIVATE_KEY = (process.env.VAPID_PRIVATE_KEY || "").trim().replace(/=/g, '');

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@medconnect.com",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.warn("VAPID keys are not set. Web push notifications will be disabled.");
}

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

// Save subscription
export async function POST(req: Request) {
  try {
    const doctorId = getUserIdFromToken(req);
    if (!doctorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ message: "Invalid subscription" }, { status: 400 });
    }

    // Upsert the subscription using the endpoint as a unique identifier
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        doctorId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        doctorId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return NextResponse.json({ message: "Subscription saved successfully." }, { status: 200 });
  } catch (error) {
    console.error("WebPush POST Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
