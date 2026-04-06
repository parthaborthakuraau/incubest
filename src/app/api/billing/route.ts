import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — subscription status for the org
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgId = (session.user as any).organizationId;
  if (!orgId) return NextResponse.json({ error: "No org" }, { status: 400 });

  let subscription = await db.subscription.findUnique({ where: { organizationId: orgId } });

  // Auto-create trial subscription if none exists
  if (!subscription) {
    subscription = await db.subscription.create({
      data: {
        organizationId: orgId,
        status: "TRIAL",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    });
  }

  const startupCount = await db.startup.count({
    where: { cohort: { organizationId: orgId } },
  });

  return NextResponse.json({
    ...subscription,
    startupCount,
    pricePerStartup: 199,
    estimatedMonthly: startupCount * 199,
  });
}

// POST — create Razorpay checkout (stub — wire with real Razorpay keys)
export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Wire with Razorpay when keys are available
  // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  // const subscription = await razorpay.subscriptions.create({ ... });

  return NextResponse.json({
    message: "Razorpay integration pending. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env",
    checkoutUrl: null,
  });
}
