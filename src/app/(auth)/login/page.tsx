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
    <div className="flex min-h-screen">
      {/* Left — Login Form */}
      <div className="flex flex-1 flex-col justify-center px-8 md:px-16 lg:px-24 py-12 bg-white animate-fadeIn">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-12">
            <img src="/dark.svg" alt="Incubest" className="h-9 w-9 rounded-xl" />
            <span className="text-xl font-bold text-gray-900">Incubest</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 animate-slideUp">Welcome back!</h1>
          <p className="mt-2 text-gray-500 animate-slideUp" style={{ animationDelay: "0.1s" }}>
            Sign in to manage your incubator or startup
          </p>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5 animate-slideUp" style={{ animationDelay: "0.2s" }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-gray-900/10"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 animate-slideUp" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-500">or continue with</span></div>
            </div>

            {/* Social buttons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => signIn("google", { callbackUrl: "/incubator" })}
                className="flex flex-1 h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
            </div>
          </div>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-gray-500 animate-slideUp" style={{ animationDelay: "0.4s" }}>
            Not a member?{" "}
            <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Register now
            </Link>
          </p>

          {/* Legal links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400 animate-slideUp" style={{ animationDelay: "0.5s" }}>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
            <span>&middot;</span>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Right — Illustration / Brand */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 h-48 w-48 rounded-full bg-teal-200/40 blur-3xl animate-floatSlow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-cyan-100/30 blur-3xl" />

        <div className="relative z-10 text-center px-12 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
          {/* Logo large */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-xl shadow-emerald-500/10 animate-float">
              <img src="/dark.svg" alt="Incubest" className="h-14 w-14" />
            </div>
          </div>

          {/* Stats cards */}
          <div className="space-y-4 max-w-sm mx-auto">
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-lg p-5 text-left animate-slideUp" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Incubator Management</p>
                  <p className="text-xs text-gray-500">Programs, cohorts, reports - unified</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-lg p-5 text-left animate-slideUp" style={{ animationDelay: "0.7s" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                  <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">AI-Powered Insights</p>
                  <p className="text-xs text-gray-500">Chat with your data, generate reports</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-lg p-5 text-left animate-slideUp" style={{ animationDelay: "0.9s" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Startup Passport</p>
                  <p className="text-xs text-gray-500">Verified identity across incubators</p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-lg font-bold text-gray-900 animate-slideUp" style={{ animationDelay: "1.1s" }}>
            The OS for Incubators
          </p>
          <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
            Manage your entire incubation ecosystem from one platform
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-floatSlow { animation: floatSlow 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
