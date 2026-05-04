"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";

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

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2.5">
      {/* Strength bar */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: i <= score ? "#D4FF3A" : "#ffffff15" }}
            />
          ))}
        </div>
        <span
          className="text-[10px] font-medium tracking-wider uppercase"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: score <= 2 ? "#ef4444" : score <= 3 ? "#eab308" : "#D4FF3A" }}
        >
          {strength}
        </span>
      </div>
      {/* Criteria list */}
      <div className="space-y-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2">
            {check.met ? (
              <Check className="h-3 w-3" style={{ color: "#D4FF3A" }} />
            ) : (
              <X className="h-3 w-3" style={{ color: "#ffffff30" }} />
            )}
            <span
              className="text-[11px]"
              style={{ color: check.met ? "#D4FF3A" : "#8A8A82" }}
            >
              {check.label}
            </span>
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

  const stepLabels = ["Your details", "Verify email", "Incubator"];
  const stepEyebrow = step === 1 ? "STEP 1 OF 3 - YOUR DETAILS" : step === 2 ? "STEP 2 OF 3 - VERIFY EMAIL" : "STEP 3 OF 3 - INCUBATOR";

  const inputClass =
    "flex h-12 w-full rounded-xl px-4 py-3 text-sm transition-all outline-none placeholder:text-[#8A8A82]";
  const inputStyle = {
    backgroundColor: "#0A0A0A",
    border: "1px solid #ffffff22",
    color: "#F4F1EA",
    fontFamily: "'Geist', sans-serif",
  };

  return (
    <div className="relative flex min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Background grid pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      {/* Floating glows */}
      <div className="fixed top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full pointer-events-none animate-glowFloat" style={{ background: "radial-gradient(circle, #D4FF3A08 0%, transparent 70%)" }} />
      <div className="fixed bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full pointer-events-none animate-glowFloatSlow" style={{ background: "radial-gradient(circle, #10B98108 0%, transparent 70%)" }} />

      {/* LEFT PANEL - Visual/Benefits */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        {/* Accent glow behind content */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[300px] w-[300px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, #D4FF3A06 0%, transparent 70%)" }} />

        <div className="relative z-10 px-16 max-w-lg animate-fadeIn">
          {/* Eyebrow */}
          <div className="flex items-center gap-2.5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#D4FF3A" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#D4FF3A" }} />
            </span>
            <span
              className="text-xs font-medium tracking-[0.2em] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4FF3A" }}
            >
              FREE 14-DAY TRIAL
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-4xl leading-tight animate-slideUp"
            style={{ fontFamily: "'Instrument Serif', serif", color: "#F4F1EA" }}
          >
            Run your incubator on{" "}
            <span className="italic" style={{ color: "#D4FF3A" }}>autopilot.</span>
          </h2>

          {/* Subtitle */}
          <p className="mt-4 text-base leading-relaxed animate-slideUp" style={{ color: "#8A8A82", animationDelay: "0.1s" }}>
            Join hundreds of Indian incubators using Incubest to manage programs, track startups, and generate reports automatically.
          </p>

          {/* Benefit rows */}
          <div className="mt-10 space-y-4">
            {[
              "Set up in 2 minutes",
              "Programs, cohorts & startups",
              "AI reports & insights",
              "No card required",
            ].map((item, i) => (
              <div
                key={item}
                className="flex items-center gap-3.5 animate-slideUp"
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full shrink-0"
                  style={{ backgroundColor: "#D4FF3A15", border: "1px solid #D4FF3A30" }}
                >
                  <Check className="h-3 w-3" style={{ color: "#D4FF3A" }} />
                </div>
                <span className="text-sm" style={{ color: "#F4F1EA", fontFamily: "'Geist', sans-serif" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div
            className="mt-12 rounded-2xl p-5 animate-slideUp"
            style={{
              backgroundColor: "#ffffff06",
              border: "1px solid #ffffff10",
              backdropFilter: "blur(12px)",
              animationDelay: "0.7s",
            }}
          >
            <p className="text-sm italic leading-relaxed" style={{ color: "#8A8A82" }}>
              &quot;Incubest replaced 5 different tools we were using. Our reporting time went from 2 weeks to 2 hours.&quot;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "#D4FF3A15", color: "#D4FF3A", fontFamily: "'JetBrains Mono', monospace" }}
              >
                A
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "#F4F1EA" }}>AIC Director</p>
                <p className="text-[10px]" style={{ color: "#8A8A82" }}>Atal Incubation Centre</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="flex flex-1 flex-col justify-center px-8 md:px-16 lg:px-20 py-12 animate-fadeIn">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <img src="/light.svg" alt="Incubest" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-semibold" style={{ color: "#F4F1EA" }}>Incubest</span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-2 animate-slideUp" style={{ animationDelay: "0.05s" }}>
            {[1, 2, 3].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300"
                  style={{
                    backgroundColor: step >= s ? "#D4FF3A" : "#ffffff10",
                    color: step >= s ? "#0A0A0A" : "#8A8A82",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {step > s ? <Check className="h-3.5 w-3.5" /> : s}
                </div>
                {i < 2 && (
                  <div
                    className="h-[1px] w-8 rounded-full transition-all duration-300"
                    style={{ backgroundColor: step > s ? "#D4FF3A" : "#ffffff15" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-[26px] mb-6 pl-0.5">
            {stepLabels.map((label, i) => (
              <span
                key={label}
                className="text-[9px] tracking-wider uppercase"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: step === i + 1 ? "#D4FF3A" : "#8A8A82",
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Step eyebrow */}
          <p
            className="text-[10px] tracking-[0.2em] uppercase mb-2 animate-slideUp"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A8A82", animationDelay: "0.1s" }}
          >
            {stepEyebrow}
          </p>

          {/* Title */}
          <h1
            className="text-3xl mb-1 animate-slideUp"
            style={{ fontFamily: "'Instrument Serif', serif", color: "#F4F1EA", animationDelay: "0.12s" }}
          >
            {step === 1 ? "Create your account" : step === 2 ? "Verify your email" : "Incubator details"}
          </h1>
          <p className="text-sm mb-6 animate-slideUp" style={{ color: "#8A8A82", animationDelay: "0.15s" }}>
            {step === 1
              ? "Get started in under 2 minutes"
              : step === 2
              ? <>We sent a 6-digit code to <strong style={{ color: "#F4F1EA" }}>{otpEmail}</strong></>
              : "Almost there - tell us about your incubator"}
          </p>

          {/* Error */}
          {error && (
            <div
              className="mb-4 rounded-xl p-3 text-sm"
              style={{ backgroundColor: "#ef444415", border: "1px solid #ef444430", color: "#ef4444" }}
            >
              {error}
            </div>
          )}

          {/* Step 1: Your Details */}
          <div className={step === 1 ? "space-y-4 animate-slideUp" : "hidden"} style={{ animationDelay: "0.2s" }}>
            <div>
              <label
                className="block text-[11px] font-medium tracking-wider uppercase mb-1.5"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A8A82" }}
              >
                Full Name
              </label>
              <input
                name="name"
                required
                placeholder="Rajesh Kumar"
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #D4FF3A22")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>
            <div>
              <label
                className="block text-[11px] font-medium tracking-wider uppercase mb-1.5"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A8A82" }}
              >
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="rajesh@incubator.org"
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #D4FF3A22")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>
            <div>
              <label
                className="block text-[11px] font-medium tracking-wider uppercase mb-1.5"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A8A82" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className={inputClass + " pr-12"}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #D4FF3A22")}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#8A8A82" }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <button
              type="button"
              onClick={handleStep1}
              disabled={otpSending}
              className="flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold disabled:opacity-50 transition-all duration-200 mt-2"
              style={{ backgroundColor: "#D4FF3A", color: "#0A0A0A" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#D4FF3A"; }}
            >
              {otpSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending OTP...
                </>
              ) : (
                "Continue"
              )}
            </button>

            {/* Divider */}
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: "1px solid #ffffff15" }} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3" style={{ backgroundColor: "#0A0A0A", color: "#8A8A82" }}>
                  or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/incubator" })}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ backgroundColor: "#0A0A0A", border: "1px solid #ffffff22", color: "#F4F1EA" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ffffff44")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ffffff22")}
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>

          {/* Step 2: OTP Verification */}
          <div className={step === 2 ? "space-y-4" : "hidden"}>
            <div>
              <label
                className="block text-[11px] font-medium tracking-wider uppercase mb-1.5"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A8A82" }}
              >
                Enter OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="flex h-14 w-full rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] placeholder:tracking-[0.5em] transition-all outline-none"
                style={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid #ffffff22",
                  color: "#F4F1EA",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #D4FF3A22")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={otpVerifying || otpCode.length !== 6}
              className="flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold disabled:opacity-50 transition-all duration-200"
              style={{ backgroundColor: "#D4FF3A", color: "#0A0A0A" }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#ffffff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#D4FF3A"; }}
            >
              {otpVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setStep(1); setError(""); }}
                className="text-sm transition-colors"
                style={{ color: "#8A8A82" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F4F1EA")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8A82")}
              >
                Change email
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={cooldown > 0 || otpSending}
                className="text-sm font-medium disabled:cursor-not-allowed transition-colors"
                style={{ color: cooldown > 0 || otpSending ? "#8A8A82" : "#D4FF3A" }}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
          </div>

          {/* Step 3: Incubator Details */}
          <form onSubmit={handleSubmit} className={step === 3 ? "space-y-4" : "hidden"}>
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4" style={{ color: "#10B981" }} />
              <span className="text-sm font-medium" style={{ color: "#10B981" }}>Email verified</span>
            </div>

            <div>
              <label
                className="block text-[11px] font-medium tracking-wider uppercase mb-1.5"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A8A82" }}
              >
                Incubator Name
              </label>
              <input
                name="orgName"
                required
                placeholder="e.g. AIC-RAISE"
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #D4FF3A22")}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-[11px] font-medium tracking-wider uppercase mb-1.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A8A82" }}
                >
                  City
                </label>
                <input
                  name="orgCity"
                  required
                  placeholder="e.g. Jaipur"
                  className={inputClass}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #D4FF3A22")}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>
              <div>
                <label
                  className="block text-[11px] font-medium tracking-wider uppercase mb-1.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8A8A82" }}
                >
                  State
                </label>
                <input
                  name="orgState"
                  required
                  placeholder="e.g. Rajasthan"
                  className={inputClass}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #D4FF3A22")}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex h-12 flex-1 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ backgroundColor: "transparent", border: "1px solid #ffffff22", color: "#F4F1EA" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ffffff44")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#ffffff22")}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 flex-[2] items-center justify-center rounded-xl text-sm font-semibold disabled:opacity-50 transition-all duration-200"
                style={{ backgroundColor: "#D4FF3A", color: "#0A0A0A" }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#D4FF3A"; }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          {/* Sign in link */}
          <p className="mt-8 text-center text-sm animate-slideUp" style={{ color: "#8A8A82", animationDelay: "0.3s" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold transition-colors"
              style={{ color: "#D4FF3A" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#D4FF3A")}
            >
              Sign in
            </Link>
          </p>

          {/* Legal links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs animate-slideUp" style={{ color: "#8A8A82", animationDelay: "0.4s" }}>
            <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy Policy</Link>
            <span style={{ color: "#ffffff20" }}>&middot;</span>
            <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms of Service</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -20px); }
        }
        @keyframes glowFloatSlow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 15px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-glowFloat {
          animation: glowFloat 12s ease-in-out infinite;
        }
        .animate-glowFloatSlow {
          animation: glowFloatSlow 15s ease-in-out infinite;
        }
        input::placeholder {
          color: #8A8A82 !important;
        }
      `}</style>
    </div>
  );
}
