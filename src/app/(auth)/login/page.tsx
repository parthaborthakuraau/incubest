"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/incubator");
      router.refresh();
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8" style={{ background: "#0A0A0A" }}>
      {/* Grid overlay */}
      <div className="login-grid-overlay" />

      {/* Floating glow orbs */}
      <div className="login-glow-lime" />
      <div className="login-glow-mint" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/dark.svg" alt="Incubest" className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-bold" style={{ color: "#F4F1EA", fontFamily: "'Geist', sans-serif" }}>Incubest</span>
        </Link>
        <Link
          href="/register"
          className="hidden sm:flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "#8A8A82", fontFamily: "'Geist', sans-serif" }}
        >
          New here?{" "}
          <span className="font-semibold" style={{ color: "#D4FF3A" }}>Create an account</span>
        </Link>
      </div>

      {/* Center card */}
      <div
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border"
        style={{ background: "#0F0F0F", borderColor: "#ffffff22", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
      >
        <div className="flex flex-col md:flex-row">
          {/* LEFT - Visual panel (hidden on mobile) */}
          <div
            className="hidden md:flex md:w-[45%] flex-col justify-between p-10"
            style={{ background: "linear-gradient(135deg, #0F0F0F 0%, #141414 50%, #0F0F0F 100%)" }}
          >
            <div>
              <h2 className="login-heading text-3xl leading-tight" style={{ color: "#F4F1EA", fontFamily: "'Instrument Serif', serif" }}>
                Welcome back to your{" "}
                <span style={{ color: "#D4FF3A" }}>portfolio.</span>
              </h2>
              <p className="mt-3 text-sm" style={{ color: "#8A8A82", fontFamily: "'Geist', sans-serif" }}>
                Track performance, manage startups, and generate insights - all in one place.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {[
                { label: "Revenue Growth", value: "+23%", delay: "0.2s" },
                { label: "Report Compliance", value: "89%", delay: "0.4s" },
                { label: "Flagged Startups", value: "3", delay: "0.6s" },
                { label: "Series A Ready", value: "5", delay: "0.8s" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="login-metric-row flex items-center justify-between rounded-xl border px-4 py-3"
                  style={{
                    borderColor: "#ffffff11",
                    background: "#0A0A0A",
                    animationDelay: metric.delay,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="login-pulse-dot" />
                    <span className="text-sm" style={{ color: "#8A8A82", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}>
                      {metric.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "#F4F1EA", fontFamily: "'JetBrains Mono', monospace" }}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#10B981" }} />
              <span className="text-xs" style={{ color: "#8A8A82", fontFamily: "'JetBrains Mono', monospace" }}>
                All systems operational
              </span>
            </div>
          </div>

          {/* RIGHT - Form */}
          <div className="flex flex-1 flex-col justify-center p-8 md:p-10">
            {/* Eyebrow */}
            <p className="text-xs font-semibold tracking-widest" style={{ color: "#D4FF3A", fontFamily: "'JetBrains Mono', monospace" }}>
              SIGN IN
            </p>

            <h1 className="mt-3 text-3xl" style={{ color: "#F4F1EA", fontFamily: "'Instrument Serif', serif" }}>
              Welcome back.
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#8A8A82", fontFamily: "'Geist', sans-serif" }}>
              Sign in to continue managing your incubator
            </p>

            {/* Error */}
            {error && (
              <div
                className="mt-5 rounded-xl border p-3 text-sm"
                style={{ background: "#1a0505", borderColor: "#ff4d4f33", color: "#ff6b6b" }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-2"
                  style={{ color: "#8A8A82", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="login-input flex h-12 w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none"
                  style={{
                    background: "#0A0A0A",
                    borderColor: "#ffffff22",
                    color: "#F4F1EA",
                    fontFamily: "'Geist', sans-serif",
                  }}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block text-xs font-medium uppercase tracking-wider"
                    style={{ color: "#8A8A82", fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium transition-colors"
                    style={{ color: "#D4FF3A", fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="login-input flex h-12 w-full rounded-xl border px-4 py-3 pr-12 text-sm transition-all focus:outline-none"
                    style={{
                      background: "#0A0A0A",
                      borderColor: "#ffffff22",
                      color: "#F4F1EA",
                      fontFamily: "'Geist', sans-serif",
                    }}
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
              </div>
              <button
                type="submit"
                disabled={loading}
                className="login-primary-btn flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={{
                  background: "#D4FF3A",
                  color: "#0A0A0A",
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                {loading ? "Signing in..." : "Sign in to dashboard"}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: "1px solid #ffffff11" }} />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3" style={{ background: "#0F0F0F", color: "#8A8A82", fontFamily: "'Geist', sans-serif" }}>
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google button */}
              <div className="mt-4">
                <button
                  onClick={() => signIn("google", { callbackUrl: "/incubator" })}
                  className="login-google-btn flex w-full h-12 items-center justify-center gap-2.5 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    background: "#0A0A0A",
                    borderColor: "#ffffff22",
                    color: "#F4F1EA",
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>

            {/* Register link */}
            <p className="mt-7 text-center text-sm" style={{ color: "#8A8A82", fontFamily: "'Geist', sans-serif" }}>
              New to Incubest?{" "}
              <Link href="/register" className="font-semibold transition-colors" style={{ color: "#D4FF3A" }}>
                Create your account
              </Link>
            </p>

            {/* Legal links */}
            <div className="mt-5 flex items-center justify-center gap-4 text-xs" style={{ color: "#8A8A8266" }}>
              <Link href="/privacy" className="transition-colors hover:opacity-80" style={{ color: "#8A8A82" }}>
                Privacy Policy
              </Link>
              <span style={{ color: "#ffffff22" }}>&middot;</span>
              <Link href="/terms" className="transition-colors hover:opacity-80" style={{ color: "#8A8A82" }}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        .login-grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(#ffffff08 1px, transparent 1px),
            linear-gradient(90deg, #ffffff08 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 0;
        }
        .login-glow-lime {
          position: absolute;
          top: 15%;
          left: 20%;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, #D4FF3A10 0%, transparent 70%);
          animation: loginFloat 12s ease-in-out infinite;
          z-index: 0;
          pointer-events: none;
        }
        .login-glow-mint {
          position: absolute;
          bottom: 10%;
          right: 15%;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          background: radial-gradient(circle, #10B98110 0%, transparent 70%);
          animation: loginFloat 16s ease-in-out infinite reverse;
          z-index: 0;
          pointer-events: none;
        }
        @keyframes loginFloat {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -20px); }
          50% { transform: translate(-20px, 20px); }
          75% { transform: translate(15px, 10px); }
        }
        .login-metric-row {
          animation: loginSlideUp 0.6s ease-out forwards;
          opacity: 0;
        }
        @keyframes loginSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #D4FF3A;
          animation: loginPulse 2s ease-in-out infinite;
        }
        @keyframes loginPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 #D4FF3A44; }
          50% { opacity: 0.7; box-shadow: 0 0 0 6px #D4FF3A00; }
        }
        .login-input::placeholder {
          color: #8A8A8244;
        }
        .login-input:focus {
          border-color: #D4FF3A44;
          box-shadow: 0 0 0 3px #D4FF3A11;
        }
        .login-primary-btn:hover:not(:disabled) {
          background: #ffffff !important;
          box-shadow: 0 0 20px #D4FF3A22;
        }
        .login-google-btn:hover {
          background: #141414 !important;
          border-color: #ffffff33 !important;
        }
      `}</style>
    </div>
  );
}
