import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Incubest <noreply@incubest.com>";

export async function sendOTPEmail(email: string, otp: string, purpose: "verify" | "reset") {
  const subject = purpose === "verify" ? "Verify your email — Incubest" : "Reset your password — Incubest";
  const heading = purpose === "verify" ? "Verify your email" : "Reset your password";
  const message =
    purpose === "verify"
      ? "Use the code below to verify your email address and complete your registration."
      : "Use the code below to reset your password. If you didn't request this, you can safely ignore this email.";

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0;">${heading}</h1>
          <p style="font-size: 14px; color: #6b7280; margin-top: 8px;">${message}</p>
        </div>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #059669;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">This code expires in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">Incubest — The OS for Incubators</p>
      </div>
    `,
  });

  if (error) {
    console.error("Email send error:", error);
    throw new Error("Failed to send email");
  }
}
