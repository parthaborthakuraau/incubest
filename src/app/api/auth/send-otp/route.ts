import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP, canSendOTP } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { success } = rateLimit(`otp:${ip}`, 10, 3600000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const { email, purpose } = await req.json();

    if (!email || !purpose) {
      return NextResponse.json({ error: "Email and purpose are required" }, { status: 400 });
    }

    if (purpose === "verify") {
      // Check if email is already registered
      const existing = await db.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }
    }

    if (purpose === "reset") {
      // Check if email exists
      const existing = await db.user.findUnique({ where: { email } });
      if (!existing) {
        // Don't reveal whether email exists — still return success
        return NextResponse.json({ message: "If this email is registered, you will receive an OTP." });
      }
    }

    // Check cooldown
    const cooldown = canSendOTP(email);
    if (!cooldown.allowed) {
      return NextResponse.json(
        { error: `Please wait ${cooldown.waitSeconds}s before requesting another OTP.` },
        { status: 429 }
      );
    }

    const otp = generateOTP();
    storeOTP(email, otp);
    await sendOTPEmail(email, otp, purpose);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
