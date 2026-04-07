"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Check, X, Loader2, CheckCircle2, Mail } from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
    { label: "One special character (!@#$...)", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];
  const score = checks.filter((c) => c.met).length;
  const strength = score <= 2 ? "Weak" : score <= 3 ? "Fair" : score <= 4 ? "Good" : "Strong";
  const color = score <= 2 ? "bg-red-500" : score <= 3 ? "bg-yellow-500" : score <= 4 ? "bg-emerald-400" : "bg-emerald-600";

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= score ? color : "bg-gray-200"}`} />
          ))}
        </div>
        <span className={`text-xs font-medium ${score <= 2 ? "text-red-600" : score <= 3 ? "text-yellow-600" : "text-emerald-600"}`}>
          {strength}
        </span>
      </div>
      <div className="space-y-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2">
            {check.met ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <X className="h-3.5 w-3.5 text-gray-300" />}
            <span className={`text-xs ${check.met ? "text-emerald-600" : "text-gray-400"}`}>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleSendOTP() {
    if (!email) { setError("Please enter your email"); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "reset" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }
      setCooldown(60);
      setStep(2);
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  }

  async function handleVerifyOTP() {
    if (otpCode.length !== 6) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return;
      }
      setStep(3);
    } catch {
      setError("Verification failed. Please try again.");
    }
    setLoading(false);
  }

  async function handleResetPassword() {
    setError("");
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError("Password must be at least 8 characters with uppercase, lowercase, and a number");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError("Failed to reset password. Please try again.");
    }
    setLoading(false);
  }

  async function handleResendOTP() {
    if (cooldown > 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "reset" }),
      });
      if (res.ok) setCooldown(60);
      else {
        const data = await res.json();
        setError(data.error || "Failed to resend");
      }
    } catch {
      setError("Failed to resend OTP");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center max-w-sm animate-fadeIn">
          <div className="flex items-center justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Password Reset</h1>
          <p className="mt-2 text-gray-500">Your password has been reset successfully.</p>
          <Link href="/login">
            <button className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 transition-all">
              Back to Login
            </button>
          </Link>
        </div>
        <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Back link */}
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <img src="/dark.svg" alt="Incubest" className="h-9 w-9 rounded-xl" />
          <span className="text-xl font-bold text-gray-900">Incubest</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">Reset password</h1>
        <p className="mt-2 text-gray-500">
          {step === 1 && "Enter your email to receive a verification code."}
          {step === 2 && "Enter the 6-digit code we sent to your email."}
          {step === 3 && "Choose a new password for your account."}
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* Step 1: Email */}
        <div className={step === 1 ? "mt-8 space-y-5" : "hidden"}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pl-11 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                autoFocus
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <button onClick={handleSendOTP} disabled={loading || !email}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-gray-900/10">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</> : "Send Verification Code"}
          </button>
        </div>

        {/* Step 2: OTP */}
        <div className={step === 2 ? "mt-8 space-y-5" : "hidden"}>
          <p className="text-sm text-gray-500">
            Code sent to <strong className="text-gray-900">{email}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="flex h-14 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-gray-900 placeholder:text-gray-300 placeholder:tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              autoFocus
            />
          </div>
          <button onClick={handleVerifyOTP} disabled={loading || otpCode.length !== 6}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying...</> : "Verify Code"}
          </button>
          <div className="flex items-center justify-between">
            <button onClick={() => { setStep(1); setError(""); setOtpCode(""); }}
              className="text-sm text-gray-500 hover:text-gray-700">Change email</button>
            <button onClick={handleResendOTP} disabled={cooldown > 0 || loading}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:text-gray-400 disabled:cursor-not-allowed">
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </div>

        {/* Step 3: New Password */}
        <div className={step === 3 ? "mt-8 space-y-5" : "hidden"}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-emerald-600 font-medium">Email verified</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className={`flex h-12 w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                confirmPassword && confirmPassword !== password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-emerald-500"
              }`}
            />
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
            )}
          </div>
          <button onClick={handleResetPassword} disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Resetting...</> : "Reset Password"}
          </button>
        </div>

        {/* Legal links */}
        <div className="mt-10 flex items-center justify-center gap-4 text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
