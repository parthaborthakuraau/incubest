import Link from "next/link";
import {
  MessageSquare, BarChart3, FileText, Users, Building2, ArrowRight,
  Shield, ShoppingBag, Target, Lightbulb, CheckCircle2, Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/dark.svg" alt="Incubest" className="h-8 w-8 rounded-xl" />
            <span className="text-lg font-bold text-gray-900">Incubest</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Login</Link>
            <Link href="/register">
              <button className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-medium text-emerald-700 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Now live — India's first incubator OS
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
            The Operating System<br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">for Incubators</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Replace spreadsheets, WhatsApp groups, and scattered emails with a single AI-powered platform.
            Manage programs, track startups, generate reports — all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <button className="rounded-xl bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all hover:shadow-xl">
                Start Free Trial <ArrowRight className="inline h-4 w-4 ml-1" />
              </button>
            </Link>
            <Link href="/login">
              <button className="rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                Sign In
              </button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">No credit card required &middot; 14-day free trial</p>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm text-gray-500 mb-6">Built for India's incubation ecosystem</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-gray-400">
            {["AIM", "RKVY", "DST-NIDHI", "DPIIT", "BIRAC", "TIDE 2.0", "State Incubators"].map(name => (
              <span key={name} className="px-4 py-2 rounded-lg bg-white border border-gray-100">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything an incubator needs</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">From onboarding to grantor reports — one platform for your entire incubation workflow.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Building2, title: "Program Management", desc: "Create AIM, RKVY, DST programs with verticals, cohorts, and custom reporting cycles.", color: "bg-violet-50 text-violet-600" },
              { icon: Users, title: "Startup Onboarding", desc: "Add startups individually or bulk CSV. Generate join links. Cross-incubator detection.", color: "bg-blue-50 text-blue-600" },
              { icon: FileText, title: "Monthly Reports", desc: "Configurable templates per program. Auto-sync metrics. Review with feedback.", color: "bg-emerald-50 text-emerald-600" },
              { icon: MessageSquare, title: "AI Chat & Insights", desc: "Ask questions about your portfolio. Generate insights. AI-powered analytics.", color: "bg-pink-50 text-pink-600" },
              { icon: Shield, title: "Startup Passport", desc: "Unique ID for every startup. Cross-incubator verification. DPIIT/CIN/PAN matching.", color: "bg-amber-50 text-amber-600" },
              { icon: ShoppingBag, title: "Marketplace", desc: "List your facilities. Startups across India can discover and request access.", color: "bg-teal-50 text-teal-600" },
              { icon: Target, title: "Impact Dashboard", desc: "ROCE, social capital, portfolio health score. All computed automatically.", color: "bg-orange-50 text-orange-600" },
              { icon: BarChart3, title: "Grantor Reports", desc: "One-click PDF reports for AIM, DST, RKVY. Auto-aggregated data.", color: "bg-indigo-50 text-indigo-600" },
              { icon: Lightbulb, title: "Form Builder", desc: "Investment forms, call for entries, due diligence. Google Forms-like builder.", color: "bg-rose-50 text-rose-600" },
            ].map(f => (
              <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-lg hover:border-gray-200 transition-all">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Get started in 3 steps</h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Register", desc: "Create your incubator account. Set up your first program in under 2 minutes." },
              { step: "2", title: "Onboard Startups", desc: "Add startups to cohorts. Share join links. They fill their profiles and start reporting." },
              { step: "3", title: "Manage & Report", desc: "Review reports, generate grantor reports, track milestones. AI handles the heavy lifting." },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gray-900 text-white text-xl font-bold">{s.step}</div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Startups */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">For Startups</span>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">Your startup, verified</h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                Get your Incubest Startup Passport — a verified digital identity across the incubation ecosystem.
                Access facilities from any incubator through the marketplace.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Unique Passport ID (IB-2026-MH-0042)",
                  "Browse services from incubators across India",
                  "AI-powered business advisor",
                  "Submit reports, track milestones",
                  "Multiple incubator support",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-8 text-center">
              <div className="inline-block rounded-xl bg-white border-2 border-emerald-200 px-6 py-4 shadow-lg">
                <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-semibold">Passport ID</p>
                <p className="text-2xl font-mono font-bold text-emerald-700">IB-2026-MH-0042</p>
              </div>
              <p className="mt-4 text-sm text-gray-600">Verified across all incubators</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Simple, transparent pricing</h2>
          <p className="mt-4 text-gray-500">Start free. Scale as you grow.</p>

          <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
            {/* Free trial */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-left">
              <p className="text-sm font-semibold text-gray-500">Free Trial</p>
              <p className="mt-2 text-4xl font-bold text-gray-900">₹0</p>
              <p className="text-sm text-gray-500">for 14 days</p>
              <ul className="mt-6 space-y-2">
                {["All features included", "Up to 10 startups", "AI chat & insights", "No credit card needed"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-gray-400" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <button className="mt-6 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Start Free Trial
                </button>
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-gray-900 bg-white p-8 text-left relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">Most Popular</span>
              </div>
              <p className="text-sm font-semibold text-gray-500">Pro</p>
              <p className="mt-2"><span className="text-4xl font-bold text-gray-900">₹199</span><span className="text-gray-500">/startup/month</span></p>
              <p className="text-sm text-gray-500">billed monthly</p>
              <ul className="mt-6 space-y-2">
                {["Unlimited startups", "All programs & verticals", "AI insights & reports", "Passport system", "Marketplace access", "Team management", "Priority support"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <button className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ready to transform your incubator?</h2>
          <p className="mt-4 text-lg text-gray-500">Join the future of incubation management in India.</p>
          <Link href="/register">
            <button className="mt-8 rounded-xl bg-gray-900 px-10 py-4 text-sm font-semibold text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all">
              Start Your Free Trial <ArrowRight className="inline h-4 w-4 ml-1" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/dark.svg" alt="Incubest" className="h-6 w-6 rounded-lg" />
            <span className="text-sm font-bold text-gray-900">Incubest</span>
            <span className="text-xs text-gray-400">— The OS for Incubators</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms of Service</Link>
            <a href="mailto:aau.incubator@gmail.com" className="hover:text-gray-700">Contact</a>
          </div>
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Incubest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
