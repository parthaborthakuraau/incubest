import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, CheckCircle2, TrendingUp,
} from "lucide-react";

const features = [
  { code: "PM", idx: "01", title: "Program Management", desc: "Create AIM, RKVY, DST programs with verticals, cohorts, and custom reporting cycles." },
  { code: "SO", idx: "02", title: "Startup Onboarding", desc: "Add startups individually or bulk CSV. Generate join links. Cross-incubator detection." },
  { code: "SR", idx: "03", title: "Smart Reports", desc: "Configurable templates per program. Auto-sync metrics. Review with inline feedback." },
  { code: "AI", idx: "04", title: "AI Chat", desc: "Ask anything about your portfolio. Get AI-powered insights and recommendations instantly." },
  { code: "GR", idx: "05", title: "Grantor Reports", desc: "One-click PDF reports for AIM, DST, RKVY. Auto-aggregated data from all startups." },
  { code: "SP", idx: "06", title: "Startup Passport", desc: "Unique verified ID for every startup. Cross-incubator verification via DPIIT, CIN, PAN." },
  { code: "MP", idx: "07", title: "Marketplace", desc: "List your facilities. Startups across India can discover and request access." },
  { code: "FB", idx: "08", title: "Form Builder", desc: "Investment forms, call for entries, due diligence. Drag and drop builder." },
];

const differentiators = [
  { title: "AI-first architecture", desc: "Every feature is powered by AI. From chat to insights to report generation - your AI co-pilot understands your entire portfolio.", variant: "lime" as const },
  { title: "Cross-incubator verification", desc: "Startup Passport gives every startup a verified identity. Detect overlaps and share data across the ecosystem.", variant: "bone" as const },
  { title: "One-click grantor reports", desc: "AIM, DST, RKVY report formats built in. Data flows automatically from startup reports to grantor PDFs.", variant: "dark" as const },
  { title: "Made for the Indian ecosystem", desc: "DPIIT numbers, CIN, PAN matching. State-wise tracking. Rupee-first. Built by incubators, for incubators.", variant: "bone" as const },
  { title: "Enterprise-grade security", desc: "Role-based access, encrypted data, rate limiting, input sanitization. Your data stays yours.", variant: "dark" as const },
  { title: "Zero learning curve", desc: "If your team can use a spreadsheet, they can use Incubest. No training needed. Get started in under 5 minutes.", variant: "lime" as const },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#F4F1EA", color: "#0B0B0B" }}>
      {/* Grain texture overlay */}
      <div
        className="fixed inset-0 z-50 pointer-events-none"
        style={{
          opacity: 0.35,
          mixBlendMode: "multiply",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
        }}
      />

      {/* ===== NAV (sticky) ===== */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-xl"
        style={{ backgroundColor: "rgba(244,241,234,0.85)", borderColor: "rgba(26,26,26,0.14)" }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            {/* Brand mark: black square with lime diagonal lines */}
            <div className="relative h-[26px] w-[26px] rounded-md overflow-hidden" style={{ backgroundColor: "#0B0B0B" }}>
              <div className="absolute inset-0" style={{
                background: "repeating-linear-gradient(45deg, transparent, transparent 3px, #D4FF3A 3px, #D4FF3A 5px)",
              }} />
            </div>
            <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "'Geist', sans-serif" }}>Incubest</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[14px]" style={{ fontFamily: "'Geist', sans-serif" }}>
            <a href="#features" className="opacity-60 hover:opacity-100 transition-opacity">Features</a>
            <a href="#ai" className="opacity-60 hover:opacity-100 transition-opacity">AI</a>
            <a href="#passport" className="opacity-60 hover:opacity-100 transition-opacity">Passport</a>
            <a href="#pricing" className="opacity-60 hover:opacity-100 transition-opacity">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-[14px] font-medium px-4 py-2 rounded-full border transition-colors hover:bg-white/50"
              style={{ borderColor: "rgba(26,26,26,0.14)" }}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[14px] font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "#0B0B0B" }}
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== / 01 - HERO ===== */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left - Text */}
            <div className="pt-4 sm:pt-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] opacity-40 mb-8" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                / 01 - HERO
              </p>

              {/* Pill badge */}
              <div
                className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[12px] font-medium mb-8 border"
                style={{ borderColor: "rgba(26,26,26,0.14)", fontFamily: "'JetBrains Mono', monospace" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#D4FF3A" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#B5E300" }} />
                </span>
                India's first AI-powered incubator OS
              </div>

              <h1 style={{ fontFamily: "'Instrument Serif', serif", lineHeight: 1.05 }} className="text-[48px] sm:text-[72px] lg:text-[96px] xl:text-[116px] font-normal tracking-tight">
                The operating system for incubators that actually{" "}
                <span className="relative inline-block">
                  work.
                  <span className="absolute bottom-[0.08em] left-0 right-0 h-[0.18em] -z-10 rounded-sm" style={{ backgroundColor: "#D4FF3A" }} />
                </span>
              </h1>

              <p className="mt-6 text-[16px] sm:text-[18px] opacity-50 max-w-lg leading-relaxed" style={{ fontFamily: "'Geist', sans-serif" }}>
                Give your incubator an AI-powered platform that manages programs,
                tracks startups, generates reports, and gets smarter the more you use it.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: "#0B0B0B" }}
                >
                  Get started free <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className="rounded-full border px-8 py-4 text-[15px] font-medium transition-colors hover:bg-white/40"
                  style={{ borderColor: "rgba(26,26,26,0.14)" }}
                >
                  See how it works
                </a>
              </div>

              <p className="mt-5 text-[11px] uppercase tracking-[0.12em] opacity-35" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                // FREE FOR 2 MONTHS - NO CREDIT CARD REQUIRED
              </p>

              {/* Stats row */}
              <div className="mt-10 flex flex-wrap gap-8 sm:gap-12">
                {[
                  { value: "42+", label: "Programs supported" },
                  { value: "1.2k", label: "Startups tracked" },
                  { value: "23%", label: "Avg. revenue lift" },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-[28px] sm:text-[32px] font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>{s.value}</p>
                    <p className="text-[11px] uppercase tracking-[0.1em] opacity-40 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - AI Panel (hidden on mobile) */}
            <div className="hidden lg:block">
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#0B0B0B" }}>
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "#D4FF3A", color: "#0B0B0B", fontFamily: "'JetBrains Mono', monospace" }}>
                      IB
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white">Live Portfolio - Q1 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <span className="text-[10px] font-medium text-red-400 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>LIVE</span>
                  </div>
                </div>

                {/* Stat boxes */}
                <div className="grid grid-cols-2 gap-px p-4" style={{ gap: "8px" }}>
                  <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Revenue Growth</p>
                    <p className="text-[28px] font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>+23%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3" style={{ color: "#D4FF3A" }} />
                      <span className="text-[10px]" style={{ color: "#D4FF3A", fontFamily: "'JetBrains Mono', monospace" }}>up from 18%</span>
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Report Compliance</p>
                    <p className="text-[28px] font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>89%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3" style={{ color: "#D4FF3A" }} />
                      <span className="text-[10px]" style={{ color: "#D4FF3A", fontFamily: "'JetBrains Mono', monospace" }}>42 of 47 filed</span>
                    </div>
                  </div>
                </div>

                {/* Streaming report rows */}
                <div className="px-4 pb-2">
                  <p className="text-[10px] uppercase tracking-wider text-white/30 mb-3 px-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Recent reports</p>
                  {[
                    { name: "GreenLeaf Agri", status: "Completed", color: "#D4FF3A" },
                    { name: "NovaTech Solutions", status: "Flagged", color: "#F59E0B" },
                    { name: "HealthBridge AI", status: "Completed", color: "#D4FF3A" },
                    { name: "EduFlow Platform", status: "Pending", color: "rgba(255,255,255,0.3)" },
                  ].map(r => (
                    <div key={r.name} className="flex items-center justify-between py-2.5 px-1 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <div className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                        <span className="text-[12px] text-white/70" style={{ fontFamily: "'Geist', sans-serif" }}>{r.name}</span>
                      </div>
                      <span className="text-[10px] text-white/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.status}</span>
                    </div>
                  ))}
                </div>

                {/* AI strip */}
                <div className="mx-4 mb-4 mt-3 rounded-lg px-3 py-2.5 flex items-center gap-2" style={{ backgroundColor: "rgba(212,255,58,0.06)", border: "1px solid rgba(212,255,58,0.1)" }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#D4FF3A" }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: "#D4FF3A" }} />
                  </span>
                  <span className="text-[10px] text-white/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>AI watching - idle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROGRAMS BAR ===== */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 border-y" style={{ backgroundColor: "#ECE7DC", borderColor: "rgba(26,26,26,0.14)" }}>
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] opacity-50 whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Trusted by India's top programs
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { abbr: "AIM", name: "Atal Incubation", sub: "Niti Aayog" },
                { abbr: "RKVY", name: "RKVY RAFTAAR", sub: "Agriculture" },
                { abbr: "DST", name: "DST NIDHI", sub: "Science & Tech" },
                { abbr: "DPIIT", name: "DPIIT", sub: "Recognition" },
                { abbr: "BIRAC", name: "BIRAC BioNEST", sub: "Biotech" },
                { abbr: "TIDE", name: "TIDE 2.0", sub: "MeitY" },
              ].map(p => (
                <div key={p.abbr} className="flex items-center gap-3 rounded-lg px-4 py-2.5 border" style={{ borderColor: "rgba(26,26,26,0.14)" }}>
                  <div className="h-8 w-8 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0" style={{ backgroundColor: "#0B0B0B", color: "#D4FF3A", fontFamily: "'JetBrains Mono', monospace" }}>
                    {p.abbr.slice(0, 3)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[12px] font-medium leading-tight">{p.name}</p>
                    <p className="text-[10px] opacity-40">{p.sub}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-lg px-4 py-2.5 border" style={{ borderColor: "rgba(26,26,26,0.14)" }}>
                <div className="h-8 w-8 rounded-md flex items-center justify-center text-[9px] font-bold opacity-40 shrink-0" style={{ backgroundColor: "rgba(11,11,11,0.1)", fontFamily: "'JetBrains Mono', monospace" }}>
                  +
                </div>
                <div className="hidden sm:block">
                  <p className="text-[12px] font-medium leading-tight opacity-40">State programs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== / 02 - FEATURES (8 cards, 4-col grid) ===== */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] opacity-40 mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                / 02 - PLATFORM
              </p>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", lineHeight: 1.1 }} className="text-[36px] sm:text-[48px] lg:text-[64px] font-normal tracking-tight">
                Eight tools.<br />One incubator OS.
              </h2>
            </div>
            <p className="text-[15px] opacity-50 max-w-md leading-relaxed lg:pb-2" style={{ fontFamily: "'Geist', sans-serif" }}>
              Everything you need to run an incubator - from program creation to AI-powered insights - in a single platform.
            </p>
          </div>

          {/* Features grid */}
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(26,26,26,0.14)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <div
                  key={f.code}
                  className="group relative p-6 sm:p-7 transition-colors hover:bg-white cursor-default"
                  style={{
                    backgroundColor: "#F4F1EA",
                    borderRight: (i % 4 !== 3) ? "1px solid rgba(26,26,26,0.14)" : "none",
                    borderBottom: i < 4 ? "1px solid rgba(26,26,26,0.14)" : "none",
                  }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-[11px] font-bold"
                      style={{ backgroundColor: "#0B0B0B", color: "#D4FF3A", fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {f.code}
                    </div>
                    <span className="text-[10px] opacity-30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{f.idx}</span>
                  </div>
                  <h3 className="text-[20px] sm:text-[22px] font-normal mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>{f.title}</h3>
                  <p className="text-[13px] opacity-45 leading-relaxed" style={{ fontFamily: "'Geist', sans-serif" }}>{f.desc}</p>
                  <ArrowUpRight className="h-4 w-4 absolute top-6 right-6 opacity-0 group-hover:opacity-40 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== / 03 - AI SECTION (dark, rounded) ===== */}
      <section id="ai" className="px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl overflow-hidden relative" style={{ backgroundColor: "#0B0B0B" }}>
            {/* Radial lime glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{
              background: "radial-gradient(circle at top right, rgba(212,255,58,0.08) 0%, transparent 60%)",
            }} />

            <div className="relative px-6 sm:px-10 lg:px-16 py-16 sm:py-20">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.35)" }}>
                / 03 - INTELLIGENCE
              </p>
              <h2 className="text-white text-[36px] sm:text-[48px] lg:text-[64px] font-normal tracking-tight mb-6" style={{ fontFamily: "'Instrument Serif', serif", lineHeight: 1.1 }}>
                AI that understands your<br className="hidden sm:block" /> entire incubator
              </h2>
              <p className="text-[15px] text-white/40 max-w-lg leading-relaxed mb-12 sm:mb-16" style={{ fontFamily: "'Geist', sans-serif" }}>
                Incubest AI analyzes your entire portfolio, spots trends, flags risks,
                and generates reports - so you can focus on what matters most.
              </p>

              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
                {/* LEFT - insight cards */}
                <div className="space-y-3">
                  {[
                    { label: "AI Insight", text: "Your portfolio revenue grew 23% this quarter. 3 startups contributed 60% of that growth.", color: "#D4FF3A" },
                    { label: "Attention Needed", text: "NovaTech has not submitted reports for 2 months. Burn rate suggests 4 months runway left.", color: "#F59E0B" },
                    { label: "Opportunity", text: "GreenLeaf Agri is growing 40% MoM. Consider recommending for Series A readiness.", color: "#818CF8" },
                    { label: "Report Ready", text: "AIM Q1 Quarterly Report generated. 42 startups, all metrics aggregated. Ready to download.", color: "#38BDF8" },
                  ].map(c => (
                    <div key={c.label} className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: c.color }} />
                          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: c.color }} />
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace", color: c.color }}>{c.label}</span>
                      </div>
                      <p className="text-[13px] text-white/60 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>

                {/* RIGHT - numbered features + button */}
                <div>
                  <div className="space-y-6">
                    {[
                      { num: "01", title: "Portfolio Intelligence", desc: "AI reads every startup report and surfaces what needs your attention." },
                      { num: "02", title: "Predictive Insights", desc: "Identify high-potential startups and at-risk ventures before it's too late." },
                      { num: "03", title: "Smart Alerts", desc: "Get flagged when a startup misses reports, burns cash too fast, or stalls." },
                      { num: "04", title: "Auto Reports", desc: "Generate AIM, DST, RKVY quarterly reports in one click. AI aggregates the data." },
                    ].map(f => (
                      <div key={f.num} className="flex items-start gap-4">
                        <span className="text-[12px] font-medium shrink-0 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4FF3A" }}>{f.num}</span>
                        <div>
                          <h3 className="text-[16px] font-medium text-white mb-1">{f.title}</h3>
                          <p className="text-[13px] text-white/40 leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/register"
                    className="mt-10 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: "#D4FF3A", color: "#0B0B0B" }}
                  >
                    Try AI Chat <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== / 04 - PASSPORT SECTION ===== */}
      <section id="passport" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] opacity-40 mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            / 04 - IDENTITY
          </p>
          <h2 className="text-[36px] sm:text-[48px] lg:text-[64px] font-normal tracking-tight mb-12 sm:mb-16" style={{ fontFamily: "'Instrument Serif', serif", lineHeight: 1.1 }}>
            One identity. Every incubator.<br className="hidden sm:block" /> All of India.
          </h2>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* LEFT - Passport card */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-sm rounded-2xl overflow-hidden p-8" style={{ backgroundColor: "#0B0B0B" }}>
                {/* Gradient bg */}
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(135deg, rgba(212,255,58,0.05) 0%, transparent 50%, rgba(212,255,58,0.03) 100%)",
                }} />
                {/* Diagonal line overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  background: "repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)",
                }} />

                <div className="relative">
                  {/* Gold chip */}
                  <div className="h-8 w-10 rounded-md mb-6" style={{
                    background: "linear-gradient(135deg, #C9A84C 0%, #F2D675 50%, #C9A84C 100%)",
                    border: "1px solid rgba(201,168,76,0.3)",
                  }}>
                    <div className="h-full w-full rounded-md" style={{
                      background: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)",
                    }} />
                  </div>

                  <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/30 mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Startup Passport</p>
                  <p className="text-[22px] sm:text-[26px] font-medium text-white/80 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>IB-2026-MH-0042</p>
                  <p className="text-[18px] text-white mt-4 mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>TechCorp Innovations</p>
                  <p className="text-[12px] text-white/40" style={{ fontFamily: "'Geist', sans-serif" }}>SaaS - B2B - Mumbai</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {[
                      { val: "2", label: "Incubators" },
                      { val: "1.2Cr", label: "Raised" },
                      { val: "12", label: "Team" },
                    ].map(s => (
                      <div key={s.label} className="rounded-lg p-2.5 text-center" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                        <p className="text-[14px] font-medium text-white">{s.val}</p>
                        <p className="text-[9px] text-white/30 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Verified badge */}
                  <div className="mt-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ backgroundColor: "rgba(212,255,58,0.1)", border: "1px solid rgba(212,255,58,0.15)" }}>
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#D4FF3A" }} />
                    <span className="text-[11px] font-medium" style={{ color: "#D4FF3A", fontFamily: "'JetBrains Mono', monospace" }}>Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT - 4 benefit columns in 2x2 grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "For Incubators", items: ["Verify if a startup is incubated elsewhere", "Detect duplicate applications via DPIIT, CIN, PAN", "View complete incubation history", "Reduce fraud and overlap"] },
                { title: "For Startups", items: ["Get a verified identity across all incubators", "Carry your track record wherever you go", "Access the AI business advisor 24/7", "Submit reports from one dashboard"] },
                { title: "Pan-India Visibility", items: ["Browse labs, coworking, and services", "Request access to facilities nationwide", "List services on the marketplace", "Connect with mentors ecosystem-wide"] },
                { title: "Trusted Ecosystem", items: ["DPIIT number matching for verification", "CIN and PAN cross-checking", "Founder email matching across incubators", "Build trust across the network"] },
              ].map(col => (
                <div key={col.title}>
                  <h3 className="text-[18px] font-normal mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>{col.title}</h3>
                  <ul className="space-y-2.5">
                    {col.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-[13px] opacity-50 leading-relaxed" style={{ fontFamily: "'Geist', sans-serif" }}>
                        <span className="shrink-0 mt-0.5 opacity-70">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== / 05 - DIFFERENTIATORS (6 cards, 3-col grid) ===== */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] opacity-40 mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            / 05 - WHAT MAKES US DIFFERENT
          </p>
          <h2 className="text-[36px] sm:text-[48px] lg:text-[64px] font-normal tracking-tight mb-12 sm:mb-16" style={{ fontFamily: "'Instrument Serif', serif", lineHeight: 1.1 }}>
            Six reasons incubators switch.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(26,26,26,0.14)" }}>
            {differentiators.map((d, i) => {
              const bgColor = d.variant === "lime" ? "#D4FF3A" : d.variant === "dark" ? "#0B0B0B" : "#F4F1EA";
              const textColor = d.variant === "dark" ? "#ffffff" : "#0B0B0B";
              const subColor = d.variant === "dark" ? "rgba(255,255,255,0.5)" : d.variant === "lime" ? "rgba(11,11,11,0.6)" : "rgba(11,11,11,0.45)";
              return (
                <div
                  key={d.title}
                  className="p-7 sm:p-8 min-h-[240px] flex flex-col justify-between"
                  style={{ backgroundColor: bgColor, color: textColor }}
                >
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider mb-4 opacity-40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>0{i + 1}</p>
                    <h3 className="text-[22px] sm:text-[24px] font-normal mb-3" style={{ fontFamily: "'Instrument Serif', serif" }}>{d.title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: subColor, fontFamily: "'Geist', sans-serif" }}>{d.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== / 06 - HOW IT WORKS (3 steps) ===== */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] opacity-40 mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            / 06 - GETTING STARTED
          </p>
          <h2 className="text-[36px] sm:text-[48px] lg:text-[64px] font-normal tracking-tight mb-12 sm:mb-16" style={{ fontFamily: "'Instrument Serif', serif", lineHeight: 1.1 }}>
            From zero to AI-powered<br className="hidden sm:block" /> in under 5 minutes.
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
            {/* Dashed connector line (desktop only) */}
            <div className="hidden lg:block absolute top-[60px] left-[16.7%] right-[16.7%] border-t-2 border-dashed pointer-events-none" style={{ borderColor: "rgba(26,26,26,0.12)" }} />

            {[
              { num: "1", title: "Register your incubator", desc: "Create your account, set up your first program, configure your reporting cycles. Takes about 2 minutes." },
              { num: "2", title: "Onboard your startups", desc: "Bulk upload via CSV, share join links, or add individually. Passport IDs are generated automatically." },
              { num: "3", title: "Let AI do the rest", desc: "Reports, insights, portfolio intelligence, and smart alerts - all automated from day one." },
            ].map(s => (
              <div key={s.num} className="relative rounded-2xl border p-7 sm:p-8" style={{ borderColor: "rgba(26,26,26,0.14)", backgroundColor: "#F4F1EA" }}>
                <div className="relative inline-block mb-5">
                  <span className="text-[56px] sm:text-[64px] font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>{s.num}</span>
                  <span className="absolute bottom-[0.12em] left-0 right-0 h-[0.15em] rounded-sm" style={{ backgroundColor: "#D4FF3A" }} />
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-normal mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>{s.title}</h3>
                <p className="text-[13px] opacity-45 leading-relaxed" style={{ fontFamily: "'Geist', sans-serif" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== / 07 - PRICING (dark, rounded) ===== */}
      <section id="pricing" className="px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "#0B0B0B" }}>
            <div className="px-6 sm:px-10 lg:px-16 py-16 sm:py-20">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.35)" }}>
                / 07 - PRICING
              </p>
              <h2 className="text-white text-[36px] sm:text-[48px] lg:text-[64px] font-normal tracking-tight mb-4" style={{ fontFamily: "'Instrument Serif', serif", lineHeight: 1.1 }}>
                Start free. Scale when<br className="hidden sm:block" /> you're ready.
              </h2>
              <p className="text-[15px] text-white/40 max-w-md leading-relaxed mb-12 sm:mb-16" style={{ fontFamily: "'Geist', sans-serif" }}>
                No credit card required. Full access for 2 months. Then choose the plan that works for you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
                {/* Free Trial */}
                <div className="rounded-2xl p-7 sm:p-8" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-white/40 mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Free Trial</p>
                  <p className="text-[48px] font-normal text-white mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>Rs 0</p>
                  <p className="text-[12px] text-white/30 mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>for 2 months</p>
                  <ul className="space-y-3">
                    {["All features included", "Unlimited startups", "AI chat and insights", "No credit card needed"].map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/60" style={{ fontFamily: "'Geist', sans-serif" }}>
                        <ArrowRight className="h-3 w-3 text-white/30 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className="mt-8 w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-medium text-white transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    Start free trial
                  </Link>
                </div>

                {/* Pro */}
                <div className="rounded-2xl p-7 sm:p-8 relative" style={{ backgroundColor: "#D4FF3A", color: "#0B0B0B" }}>
                  <div className="absolute -top-0 right-6 -translate-y-1/2">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: "#0B0B0B", color: "#D4FF3A", fontFamily: "'JetBrains Mono', monospace" }}>Recommended</span>
                  </div>
                  <p className="text-[11px] font-medium uppercase tracking-wider opacity-50 mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Pro</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-[48px] font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>Rs 4,999</p>
                    <span className="text-[13px] opacity-50">/month</span>
                  </div>
                  <p className="text-[12px] opacity-40 mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>after free trial</p>
                  <ul className="space-y-3">
                    {["Everything in Free", "Unlimited programs", "Startup Passport system", "Marketplace access", "Team management", "Grantor report PDFs", "Priority support"].map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px] opacity-70" style={{ fontFamily: "'Geist', sans-serif" }}>
                        <ArrowRight className="h-3 w-3 opacity-40 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className="mt-8 w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-medium text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: "#0B0B0B" }}
                  >
                    Get started <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-[36px] sm:text-[56px] lg:text-[80px] xl:text-[96px] font-normal tracking-tight max-w-5xl mx-auto" style={{ fontFamily: "'Instrument Serif', serif", lineHeight: 1.08 }}>
            The only platform built to run your incubator at any{" "}
            <span className="relative inline-block">
              scale.
              <span className="absolute bottom-[0.06em] left-0 right-0 h-[0.12em] rounded-sm" style={{ backgroundColor: "#D4FF3A" }} />
            </span>
          </h2>

          <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#0B0B0B" }}
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:aau.incubator@gmail.com"
              className="rounded-full border px-8 py-4 text-[15px] font-medium transition-colors hover:bg-white/40"
              style={{ borderColor: "rgba(26,26,26,0.14)" }}
            >
              Book a demo
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER (dark, rounded top) ===== */}
      <footer className="mx-4 sm:mx-6 mb-0">
        <div className="rounded-t-3xl overflow-hidden" style={{ backgroundColor: "#0B0B0B" }}>
          <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 py-16 sm:py-20">
            <div className="grid gap-10 sm:gap-12 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              {/* Brand */}
              <div className="col-span-2 sm:col-span-3 md:col-span-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="relative h-[22px] w-[22px] rounded-sm overflow-hidden" style={{ backgroundColor: "#D4FF3A" }}>
                    <div className="absolute inset-0" style={{
                      background: "repeating-linear-gradient(45deg, transparent, transparent 2px, #0B0B0B 2px, #0B0B0B 3.5px)",
                    }} />
                  </div>
                  <span className="text-[16px] font-semibold text-white">Incubest</span>
                </div>
                <p className="text-[13px] text-white/35" style={{ fontFamily: "'Geist', sans-serif" }}>The OS for Indian startup incubators</p>
              </div>

              {/* Product */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.35)" }}>Product</p>
                <ul className="space-y-2.5 text-[13px] text-white/50">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#ai" className="hover:text-white transition-colors">AI Insights</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                </ul>
              </div>

              {/* For Incubators */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.35)" }}>For Incubators</p>
                <ul className="space-y-2.5 text-[13px] text-white/50">
                  <li><Link href="/features/program-management" className="hover:text-white transition-colors">Program Management</Link></li>
                  <li><Link href="/features/grantor-reports" className="hover:text-white transition-colors">Grantor Reports</Link></li>
                  <li><Link href="/features/team-management" className="hover:text-white transition-colors">Team Management</Link></li>
                  <li><Link href="/features/impact-dashboard" className="hover:text-white transition-colors">Impact Dashboard</Link></li>
                </ul>
              </div>

              {/* For Startups */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.35)" }}>For Startups</p>
                <ul className="space-y-2.5 text-[13px] text-white/50">
                  <li><Link href="/features/startup-passport" className="hover:text-white transition-colors">Startup Passport</Link></li>
                  <li><Link href="/features/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                  <li><Link href="/features/ai-advisor" className="hover:text-white transition-colors">AI Advisor</Link></li>
                  <li><Link href="/features/milestone-tracking" className="hover:text-white transition-colors">Milestone Tracking</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.35)" }}>Company</p>
                <ul className="space-y-2.5 text-[13px] text-white/50">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><a href="mailto:aau.incubator@gmail.com" className="hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-14 sm:mt-16 pt-8 border-t flex flex-col items-center gap-3 text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-[11px] text-white/30" style={{ fontFamily: "'Geist', sans-serif" }}>&copy; {new Date().getFullYear()} Incubest. All rights reserved.</p>
              <p className="text-[10px] uppercase tracking-[0.1em] text-white/20" style={{ fontFamily: "'JetBrains Mono', monospace" }}>PROUDLY POWERED BY FOUNDATION OF AIC-AAU INCUBATOR (NEATEHUB)</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
