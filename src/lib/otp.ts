// In-memory OTP store (works on serverless — each instance has its own store)
// For production scale, move to Redis or database
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 60 * 1000; // 1 minute between sends

// Track last send time to prevent spam
const sendCooldown = new Map<string, number>();

export function generateOTP(): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

export function canSendOTP(email: string): { allowed: boolean; waitSeconds?: number } {
  const lastSent = sendCooldown.get(email);
  if (lastSent) {
    const elapsed = Date.now() - lastSent;
    if (elapsed < COOLDOWN_MS) {
      return { allowed: false, waitSeconds: Math.ceil((COOLDOWN_MS - elapsed) / 1000) };
    }
  }
  return { allowed: true };
}

export function storeOTP(email: string, code: string): void {
  otpStore.set(email, {
    code,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });
  sendCooldown.set(email, Date.now());
}

export function verifyOTP(email: string, code: string): { valid: boolean; error?: string } {
  const entry = otpStore.get(email);

  if (!entry) {
    return { valid: false, error: "No OTP found. Please request a new one." };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);
    return { valid: false, error: "OTP expired. Please request a new one." };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(email);
    return { valid: false, error: "Too many attempts. Please request a new OTP." };
  }

  entry.attempts++;

  if (entry.code !== code) {
    return { valid: false, error: "Incorrect OTP. Please try again." };
  }

  // Valid — remove from store
  otpStore.delete(email);
  return { valid: true };
}
