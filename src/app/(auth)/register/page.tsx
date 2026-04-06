"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      orgName: formData.get("orgName") as string,
      orgCity: formData.get("orgCity") as string,
      orgState: formData.get("orgState") as string,
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

          <h2 className="text-3xl font-bold text-gray-900 animate-slideUp">Join India's first</h2>
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
              "Incubest replaced 5 different tools we were using. Our reporting time went from 2 weeks to 2 hours."
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
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${step >= 1 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"}`}>1</div>
            <div className={`h-0.5 flex-1 rounded-full transition-all ${step >= 2 ? "bg-emerald-500" : "bg-gray-200"}`} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${step >= 2 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"}`}>2</div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 animate-slideUp" style={{ animationDelay: "0.2s" }}>
            {/* Step 1: Your Details */}
            <div className={step === 1 ? "space-y-4" : "hidden"}>
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
                  <input name="password" type={showPassword ? "text" : "password"} required minLength={8} placeholder="Min 8 characters"
                    className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => setStep(2)}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 mt-2">
                Continue
              </button>
            </div>

            {/* Step 2: Incubator Details */}
            <div className={step === 2 ? "space-y-4" : "hidden"}>
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
                <button type="button" onClick={() => setStep(1)}
                  className="flex h-12 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex h-12 flex-[2] items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20">
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 animate-slideUp" style={{ animationDelay: "0.3s" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">Sign in</Link>
          </p>
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
