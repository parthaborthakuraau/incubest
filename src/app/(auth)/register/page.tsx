"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, CheckCircle2, Check, X, Loader2 } from "lucide-react";

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
      {/* Strength bar */}
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
      {/* Criteria list */}
      <div className="space-y-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2">
            {check.met ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-gray-300" />
            )}
            <span className={`text-xs ${check.met ? "text-emerald-600" : "text-gray-400"}`}>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: details, 2: OTP, 3: org details
  const [password, setPassword] = useState("");

  // OTP state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Store step 1 data
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  // Check for error param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "no-account") {
      setError("No account found with this email. Please register first.");
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function isPasswordStrong(pw: string): boolean {
    return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw);
  }

  async function handleStep1() {
    setError("");
    const name = (document.querySelector('input[name="name"]') as HTMLInputElement)?.value;
    const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value;

    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }
    if (!isPasswordStrong(password)) {
      setError("Password must be at least 8 characters with uppercase, lowercase, and a number");
      return;
    }

    setFormData({ name, email, password });
    setOtpEmail(email);
    setOtpSending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "verify" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setOtpSending(false);
        return;
      }
      setCooldown(60);
      setStep(2);
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
    setOtpSending(false);
  }

  async function handleVerifyOTP() {
    setError("");
    setOtpVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        setOtpVerifying(false);
        return;
      }
      setOtpVerified(true);
      setStep(3);
    } catch {
      setError("Verification failed. Please try again.");
    }
    setOtpVerifying(false);
  }

  async function handleResendOTP() {
    if (cooldown > 0) return;
    setOtpSending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, purpose: "verify" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
      } else {
        setCooldown(60);
      }
    } catch {
      setError("Failed to resend OTP");
    }
    setOtpSending(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!otpVerified) {
      setError("Please verify your email first");
      return;
    }
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const data = {
      ...formData,
      orgName: fd.get("orgName") as string,
      orgCity: fd.get("orgCity") as string,
      orgState: fd.get("orgState") as string,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Registration failed");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left - Brand Side */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-16 left-16 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl animate-float" />
        <div className="absolute bottom-16 right-16 h-56 w-56 rounded-full bg-teal-200/40 blur-3xl animate-floatSlow" />

        <div className="relative z-10 text-center px-12 animate-fadeIn">
          <div className="flex items-center justify-center mb-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-emerald-500/10 animate-float">
              <img src="/dark.svg" alt="Incubest" className="h-12 w-12" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 animate-slideUp">Join India&apos;s first</h2>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent animate-slideUp" style={{ animationDelay: "0.1s" }}>Incubator OS</h2>

          <div className="mt-10 space-y-4 max-w-xs mx-auto text-left">
            {[
              "Set up your incubator in 2 minutes",
              "Manage programs, cohorts & startups",
              "AI-powered reports & insights",
              "14-day free trial, no card required",
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-3 animate-slideUp" style={{ animationDelay: `${0.3 + i * 0.15}s` }}>
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-10 rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-lg p-5 max-w-sm mx-auto text-left animate-slideUp" style={{ animationDelay: "0.9s" }}>
            <p className="text-sm text-gray-600 italic leading-relaxed">
              &quot;Incubest replaced 5 different tools we were using. Our reporting time went from 2 weeks to 2 hours.&quot;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">A</div>
              <div>
                <p className="text-xs font-semibold text-gray-900">AIC Director</p>
                <p className="text-[10px] text-gray-500">Atal Incubation Centre</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Registration Form */}
      <div className="flex flex-1 flex-col justify-center px-8 md:px-16 lg:px-24 py-12 bg-white animate-fadeIn">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <img src="/dark.svg" alt="Incubest" className="h-9 w-9 rounded-xl" />
            <span className="text-xl font-bold text-gray-900">Incubest</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 animate-slideUp">Register your incubator</h1>
          <p className="mt-2 text-gray-500 animate-slideUp" style={{ animationDelay: "0.1s" }}>
            Get started in under 2 minutes
          </p>

          {/* Step indicator */}
          <div className="mt-6 flex items-center gap-3 animate-slideUp" style={{ animationDelay: "0.15s" }}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${step >= 1 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"}`}>
              {step > 1 ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <div className={`h-0.5 flex-1 rounded-full transition-all ${step >= 2 ? "bg-emerald-500" : "bg-gray-200"}`} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${step >= 2 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"}`}>
              {step > 2 ? <Check className="h-4 w-4" /> : "2"}
            </div>
            <div className={`h-0.5 flex-1 rounded-full transition-all ${step >= 3 ? "bg-emerald-500" : "bg-gray-200"}`} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${step >= 3 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"}`}>3</div>
          </div>
          <div className="flex justify-between mt-1.5 px-1">
            <span className="text-[10px] text-gray-400">Your details</span>
            <span className="text-[10px] text-gray-400">Verify email</span>
            <span className="text-[10px] text-gray-400">Incubator</span>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
          )}

          {/* Step 1: Your Details */}
          <div className={step === 1 ? "mt-6 space-y-4 animate-slideUp" : "hidden"} style={{ animationDelay: "0.2s" }}>
            <p className="text-sm font-semibold text-gray-900 mb-3">Your Details</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input name="name" required placeholder="Rajesh Kumar"
                className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input name="email" type="email" required placeholder="rajesh@incubator.org"
                className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>
            <button type="button" onClick={handleStep1} disabled={otpSending}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-gray-900/10 mt-2">
              {otpSending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending OTP...</> : "Continue"}
            </button>

            {/* Divider */}
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-500">or continue with</span></div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/incubator" })}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </div>

          {/* Step 2: OTP Verification */}
          <div className={step === 2 ? "mt-6 space-y-4" : "hidden"}>
            <p className="text-sm font-semibold text-gray-900 mb-1">Verify your email</p>
            <p className="text-sm text-gray-500 mb-4">
              We sent a 6-digit code to <strong className="text-gray-900">{otpEmail}</strong>
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP</label>
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

            <button type="button" onClick={handleVerifyOTP} disabled={otpVerifying || otpCode.length !== 6}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20">
              {otpVerifying ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying...</> : "Verify Email"}
            </button>

            <div className="flex items-center justify-between">
              <button type="button" onClick={() => { setStep(1); setError(""); }}
                className="text-sm text-gray-500 hover:text-gray-700">
                Change email
              </button>
              <button type="button" onClick={handleResendOTP} disabled={cooldown > 0 || otpSending}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:text-gray-400 disabled:cursor-not-allowed">
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
          </div>

          {/* Step 3: Incubator Details */}
          <form onSubmit={handleSubmit} className={step === 3 ? "mt-6 space-y-4" : "hidden"}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-600 font-medium">Email verified</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-3">Incubator Details</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Incubator Name</label>
              <input name="orgName" required placeholder="e.g. AIC-RAISE"
                className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input name="orgCity" required placeholder="e.g. Jaipur"
                  className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input name="orgState" required placeholder="e.g. Rajasthan"
                  className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => setStep(2)}
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                Back
              </button>
              <button type="submit" disabled={loading}
                className="flex h-12 flex-[2] items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating account...</> : "Create Account"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 animate-slideUp" style={{ animationDelay: "0.3s" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">Sign in</Link>
          </p>

          {/* Legal links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400 animate-slideUp" style={{ animationDelay: "0.4s" }}>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
            <span>&middot;</span>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-floatSlow { animation: floatSlow 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
