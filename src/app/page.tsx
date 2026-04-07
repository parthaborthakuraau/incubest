import Link from "next/link";
import {
  ArrowRight, Building2, Users, FileText, MessageSquare, Shield,
  ShoppingBag, BarChart3, Target, Lightbulb, CheckCircle2, Zap,
  Globe, Lock, ChevronRight, Sparkles, Layers, PieChart,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/dark.svg" alt="Incubest" className="h-8 w-8 rounded-xl" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">Incubest</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[15px] text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#use-cases" className="hover:text-gray-900 transition-colors">Use Cases</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[15px] font-medium text-gray-700 hover:text-gray-900 transition-colors">Log in</Link>
            <Link href="/register">
              <button className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 pb-24 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold text-gray-900 leading-[1.08] tracking-tight">
            Supercharge your<br />incubator with AI
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Give your incubator a platform that manages programs, tracks startups,
            generates reports, and gets smarter the more you use it.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register">
              <button className="rounded-full bg-gray-900 px-8 py-4 text-[15px] font-semibold text-white hover:bg-gray-800 shadow-xl shadow-gray-900/15 transition-all hover:-translate-y-0.5">
                Get started
              </button>
            </Link>
            <a href="#features">
              <button className="rounded-full border border-gray-300 bg-white px-8 py-4 text-[15px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
                See how it works
              </button>
            </a>
          </div>
        </div>

        {/* Product preview */}
        <div className="mx-auto max-w-5xl mt-16">
          <div className="rounded-3xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 p-2 shadow-2xl shadow-gray-200/50">
            <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-gray-200" />
                  <div className="h-3 w-3 rounded-full bg-gray-200" />
                  <div className="h-3 w-3 rounded-full bg-gray-200" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="rounded-lg bg-gray-100 px-4 py-1 text-xs text-gray-400">incubest.com/incubator</div>
                </div>
              </div>
              {/* Dashboard mockup */}
              <div className="p-6 md:p-10">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Active Startups", value: "124", color: "from-emerald-500 to-teal-500" },
                    { label: "Reports This Month", value: "89", color: "from-violet-500 to-purple-500" },
                    { label: "Funds Deployed", value: "₹4.2Cr", color: "from-pink-500 to-rose-500" },
                    { label: "Mentor Sessions", value: "312", color: "from-amber-500 to-orange-500" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl bg-gradient-to-br p-4 text-white" style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
                      <div className={`rounded-2xl bg-gradient-to-br ${s.color} p-4 text-white`}>
                        <p className="text-2xl md:text-3xl font-bold">{s.value}</p>
                        <p className="text-xs mt-1 text-white/80">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Portfolio Growth</p>
                    <div className="flex items-end gap-2 h-24">
                      {[40, 55, 45, 70, 65, 80, 90, 85, 95].map((h, i) => (
                        <div key={i} className="flex-1 rounded-lg bg-gradient-to-t from-emerald-500 to-emerald-300 transition-all" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm font-semibold text-gray-900 mb-3">AI Insights</p>
                    <div className="space-y-2">
                      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-xs text-emerald-700">3 startups need attention</div>
                      <div className="rounded-xl bg-violet-50 border border-violet-100 p-2.5 text-xs text-violet-700">Revenue up 23% this quarter</div>
                      <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5 text-xs text-amber-700">5 reports pending review</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-14 px-6 border-y border-gray-100">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <p className="text-lg font-semibold text-gray-900 whitespace-nowrap">Built for India&apos;s top <br className="hidden md:block" />incubation programs</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {["AIM - Niti Aayog", "RKVY-RAFTAAR", "DST-NIDHI", "DPIIT", "BIRAC BioNEST", "TIDE 2.0", "State Programs"].map(name => (
                <span key={name} className="rounded-full bg-gray-50 border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-[3.25rem] font-extrabold text-gray-900 leading-tight tracking-tight">
              The platform for<br />incubator + AI<br />collaboration
            </h2>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: "Program Management", desc: "Create AIM, RKVY, DST programs with verticals, cohorts, and custom reporting cycles.", color: "bg-rose-50 text-rose-600 border-rose-100" },
              { icon: Users, title: "Startup Onboarding", desc: "Add startups individually or bulk CSV. Generate join links. Cross-incubator detection.", color: "bg-violet-50 text-violet-600 border-violet-100" },
              { icon: FileText, title: "Smart Reports", desc: "Configurable templates per program. Auto-sync metrics. Review with feedback.", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
              { icon: MessageSquare, title: "AI Chat", desc: "Ask anything about your portfolio. Get AI-powered insights and recommendations.", color: "bg-blue-50 text-blue-600 border-blue-100" },
            ].map(f => (
              <div key={f.title} className="group rounded-2xl border border-gray-100 bg-white p-7 hover:shadow-xl hover:border-gray-200 hover:-translate-y-1 transition-all duration-300">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors">
                  Learn more <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases / How it works ── */}
      <section id="use-cases" className="py-28 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-[3.25rem] font-extrabold text-gray-900 leading-tight tracking-tight">
              See how Incubest<br />streamlines every<br />workflow
            </h2>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Layers, title: "Cohort Tracking", desc: "Organize startups into cohorts within programs. Track status, milestones, and graduations.", cta: "See cohort tracking" },
              { icon: BarChart3, title: "Grantor Reporting", desc: "One-click PDF reports for AIM, DST, RKVY. Data auto-aggregated from startup reports.", cta: "See reporting" },
              { icon: Shield, title: "Startup Passport", desc: "Unique verified ID for every startup. Cross-incubator detection via DPIIT, CIN, PAN.", cta: "See passport" },
              { icon: ShoppingBag, title: "Marketplace", desc: "List lab equipment, coworking spaces. Startups across India discover and request access.", cta: "See marketplace" },
            ].map(f => (
              <div key={f.title} className="group rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 transition-all duration-300">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 mb-5">
                  <f.icon className="h-7 w-7 text-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                  {f.cta} <ArrowRight className="h-4 w-4 rounded-full bg-gray-900 text-white p-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What Sets Incubest Apart ── */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-[3.25rem] font-extrabold text-gray-900 leading-tight tracking-tight mb-16">
            What sets Incubest apart
          </h2>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 — AI */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-8 md:p-10 text-white lg:col-span-1 lg:row-span-2 flex flex-col justify-between min-h-[380px]">
              <div>
                <Sparkles className="h-8 w-8 text-emerald-300 mb-6" />
                <h3 className="text-2xl md:text-3xl font-bold leading-snug">
                  Amplify your<br />impact with AI
                </h3>
                <p className="mt-4 text-emerald-200 leading-relaxed text-[15px]">
                  Let Incubest AI analyze your portfolio, flag at-risk startups,
                  and generate insights — so you can focus on what matters.
                </p>
              </div>
              <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all w-fit">
                Try AI Chat <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Card 2 — Passport */}
            <div className="rounded-3xl bg-gradient-to-br from-violet-800 to-violet-950 p-8 md:p-10 text-white flex flex-col justify-between min-h-[280px]">
              <div>
                <Globe className="h-8 w-8 text-violet-300 mb-6" />
                <h3 className="text-2xl font-bold leading-snug">
                  Cross-incubator<br />verification
                </h3>
                <p className="mt-3 text-violet-200 text-[15px] leading-relaxed">
                  Startup Passport gives every startup a verified identity.
                  Detect overlaps. Share data across ecosystems.
                </p>
              </div>
            </div>

            {/* Card 3 — Reports */}
            <div className="rounded-3xl bg-gradient-to-br from-gray-800 to-gray-950 p-8 md:p-10 text-white flex flex-col justify-between min-h-[280px]">
              <div>
                <PieChart className="h-8 w-8 text-gray-300 mb-6" />
                <h3 className="text-2xl font-bold leading-snug">
                  One-click grantor<br />reports
                </h3>
                <p className="mt-3 text-gray-300 text-[15px] leading-relaxed">
                  AIM, DST, RKVY report formats built-in. Data flows automatically
                  from startup reports to grantor PDFs.
                </p>
              </div>
            </div>

            {/* Card 4 — Security */}
            <div className="rounded-3xl bg-gray-50 border border-gray-200 p-8 md:p-10 flex flex-col justify-between min-h-[280px]">
              <div>
                <Lock className="h-8 w-8 text-gray-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                  Enterprise-grade<br />security
                </h3>
                <p className="mt-3 text-gray-500 text-[15px] leading-relaxed">
                  Role-based access, encrypted data, rate limiting,
                  input sanitization. Your data stays yours.
                </p>
              </div>
            </div>

            {/* Card 5 — Made for India */}
            <div className="rounded-3xl bg-gray-50 border border-gray-200 p-8 md:p-10 flex flex-col justify-between min-h-[280px]">
              <div>
                <Target className="h-8 w-8 text-gray-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 leading-snug">
                  Made for the<br />Indian ecosystem
                </h3>
                <p className="mt-3 text-gray-500 text-[15px] leading-relaxed">
                  DPIIT numbers, CIN, PAN matching. State-wise tracking.
                  Rupee-first. Built by incubators, for incubators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Get Started Easily ── */}
      <section className="py-28 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-4xl md:text-[3.25rem] font-extrabold text-gray-900 leading-tight tracking-tight">
                Get started<br />easily
              </h2>
              <p className="mt-6 text-gray-500 text-lg leading-relaxed max-w-md">
                Set up your incubator, onboard startups, and start managing —
                all in under 5 minutes. No training needed.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { title: "Register your incubator", desc: "Create account, set up your first program", step: "1" },
                { title: "Onboard your startups", desc: "Bulk upload, share join links, or add individually", step: "2" },
                { title: "Let AI do the rest", desc: "Reports, insights, and analytics — automated", step: "3" },
              ].map((s) => (
                <div key={s.step} className="group flex items-center gap-5 rounded-2xl bg-white border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-default">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white text-lg font-bold">
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                  <ArrowRight className="h-10 w-10 rounded-full bg-gray-900 text-white p-2.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── For Startups ── */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-6">
                <Zap className="h-4 w-4" /> For Startups
              </div>
              <h2 className="text-4xl md:text-[3.25rem] font-extrabold text-gray-900 leading-tight tracking-tight">
                Your startup,<br />verified
              </h2>
              <p className="mt-6 text-gray-500 text-lg leading-relaxed max-w-lg">
                Get your Incubest Startup Passport — a verified digital identity
                across India&apos;s entire incubation ecosystem.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Unique Passport ID verified across all incubators",
                  "AI-powered business advisor available 24/7",
                  "Browse and access facilities from any incubator",
                  "Submit reports and track milestones from one dashboard",
                  "Connect with mentors and investors ecosystem-wide",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-sm font-semibold text-white hover:bg-gray-800 transition-all">
                Get your Passport <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Passport Card */}
            <div className="flex items-center justify-center">
              <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100 p-10 w-full max-w-md">
                <div className="rounded-2xl bg-white border border-emerald-200 shadow-xl shadow-emerald-500/10 p-8 text-center">
                  <img src="/dark.svg" alt="Incubest" className="h-10 w-10 rounded-xl mx-auto mb-4" />
                  <p className="text-[10px] text-emerald-500 uppercase tracking-[0.2em] font-bold">Startup Passport</p>
                  <p className="text-3xl font-mono font-bold text-emerald-700 mt-2">IB-2026-MH-0042</p>
                  <div className="mt-4 h-px bg-emerald-100" />
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>TechCorp Innovations</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/80 border border-emerald-100 p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">2</p>
                    <p className="text-[10px] text-gray-500">Incubators</p>
                  </div>
                  <div className="rounded-xl bg-white/80 border border-emerald-100 p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">₹1.2Cr</p>
                    <p className="text-[10px] text-gray-500">Funding Raised</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-28 px-6 bg-gray-50">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-[3.25rem] font-extrabold text-gray-900 leading-tight tracking-tight">
            Simple, transparent<br />pricing
          </h2>
          <p className="mt-4 text-gray-500 text-lg">Start free. Scale as you grow.</p>

          <div className="mt-14 grid gap-6 md:grid-cols-2 max-w-2xl mx-auto text-left">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Free Trial</p>
              <p className="mt-3 text-5xl font-extrabold text-gray-900">₹0</p>
              <p className="text-sm text-gray-500 mt-1">for 14 days</p>
              <ul className="mt-8 space-y-3">
                {["All features included", "Up to 10 startups", "AI chat & insights", "No credit card needed"].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-gray-300" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <button className="mt-8 w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
                  Start free trial
                </button>
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-gray-900 bg-white p-8 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-gray-900 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider">Most Popular</span>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pro</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-gray-900">₹199</span>
                <span className="text-gray-500 text-sm">/startup/month</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">billed monthly</p>
              <ul className="mt-8 space-y-3">
                {["Unlimited startups", "All programs & verticals", "AI insights & reports", "Startup Passport", "Marketplace access", "Team management", "Priority support"].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <button className="mt-8 w-full rounded-full bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-all">
                  Get started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-28 px-6 bg-gradient-to-b from-emerald-900 to-emerald-950">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <h2 className="text-3xl md:text-[2.75rem] font-extrabold text-white leading-tight tracking-tight">
              The only platform built<br />to run your incubator<br />at any scale
            </h2>
            <Link href="/register">
              <button className="shrink-0 rounded-full bg-white px-10 py-4 text-[15px] font-bold text-emerald-900 hover:bg-emerald-50 transition-all shadow-xl">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-emerald-950 text-white py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-5">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/light.svg" alt="Incubest" className="h-8 w-8 rounded-xl" />
                <span className="text-lg font-bold">Incubest</span>
              </div>
              <p className="text-sm text-emerald-300">The OS for Incubators</p>
            </div>

            {/* Product */}
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">Product</p>
              <ul className="space-y-2.5 text-sm text-emerald-200">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>

            {/* For Incubators */}
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">For Incubators</p>
              <ul className="space-y-2.5 text-sm text-emerald-200">
                <li><span className="hover:text-white transition-colors cursor-default">Program Management</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Grantor Reports</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Team Management</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Impact Dashboard</span></li>
              </ul>
            </div>

            {/* For Startups */}
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">For Startups</p>
              <ul className="space-y-2.5 text-sm text-emerald-200">
                <li><span className="hover:text-white transition-colors cursor-default">Startup Passport</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Marketplace</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">AI Advisor</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Milestone Tracking</span></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">Company</p>
              <ul className="space-y-2.5 text-sm text-emerald-200">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><a href="mailto:aau.incubator@gmail.com" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-emerald-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-emerald-400">&copy; {new Date().getFullYear()} Incubest. All rights reserved.</p>
            <p className="text-xs text-emerald-500">Made in India for India&apos;s incubation ecosystem</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
