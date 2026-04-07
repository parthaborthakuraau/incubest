import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { success } = rateLimit(`verify-otp:${ip}`, 20, 3600000);
  if (!success) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const result = verifyOTP(email, otp);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
