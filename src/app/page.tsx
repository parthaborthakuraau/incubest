import Link from "next/link";
import {
  ArrowRight, Building2, Users, FileText, MessageSquare, Shield,
  ShoppingBag, BarChart3, Target, Lightbulb, CheckCircle2, Zap,
  Globe, Lock, ChevronRight, Sparkles, Layers, PieChart, Brain,
  TrendingUp, AlertTriangle, Search, MapPin, Award, Fingerprint,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/dark.svg" alt="Incubest" className="h-8 w-8 rounded-xl" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">Incubest</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[15px] text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#ai" className="hover:text-gray-900 transition-colors">AI</a>
            <a href="#passport" className="hover:text-gray-900 transition-colors">Passport</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-[15px] font-medium text-gray-700 hover:text-gray-900 transition-colors">Log in</Link>
            <Link href="/register">
              <button className="rounded-full bg-gray-900 px-5 sm:px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Text Left, Chat Mockup Right */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left - Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-medium text-emerald-700 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                India's first AI-powered incubator OS
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                Supercharge your incubator with AI
              </h1>
              <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-lg leading-relaxed">
                Give your incubator an AI-powered platform that manages programs,
                tracks startups, generates reports, and gets smarter the more you use it.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link href="/register">
                  <button className="rounded-full bg-gray-900 px-8 py-4 text-[15px] font-semibold text-white hover:bg-gray-800 shadow-xl shadow-gray-900/15 transition-all hover:-translate-y-0.5">
                    Get started free
                  </button>
                </Link>
                <a href="#features">
                  <button className="rounded-full border border-gray-300 bg-white px-8 py-4 text-[15px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
                    See how it works
                  </button>
                </a>
              </div>
              <p className="mt-4 text-xs text-gray-400">Free for 2 months. No credit card required.</p>
            </div>

            {/* Right - Chat First Mockup */}
            <div className="rounded-3xl bg-[#e8e8e3] border border-gray-200 p-3 shadow-2xl shadow-gray-200/60">
              <div className="rounded-2xl bg-white overflow-hidden">
                {/* Topbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gray-900 flex items-center justify-center">
                      <img src="/light.svg" alt="" className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Incubest AI</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                  </div>
                </div>
                {/* Chat messages */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-md bg-gray-900 text-white px-4 py-2.5 text-sm max-w-[80%]">
                      How are my startups performing this quarter?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-md bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-700 max-w-[85%] space-y-2">
                      <p className="font-medium text-gray-900">Here's your Q1 portfolio summary:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-center">
                          <p className="text-lg font-bold text-emerald-700">23%</p>
                          <p className="text-[10px] text-emerald-600">Revenue Growth</p>
                        </div>
                        <div className="rounded-xl bg-violet-50 border border-violet-100 p-2.5 text-center">
                          <p className="text-lg font-bold text-violet-700">89%</p>
                          <p className="text-[10px] text-violet-600">Report Compliance</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">3 startups flagged for attention. 5 ready for next funding round.</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-md bg-gray-900 text-white px-4 py-2.5 text-sm max-w-[80%]">
                      Generate the AIM quarterly report
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-md bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-sm text-emerald-700 max-w-[80%]">
                      Generating AIM Q1 report for 42 startups...
                    </div>
                  </div>
                </div>
                {/* Input */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-400">
                    Ask anything about your portfolio...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Program Logos */}
      <section className="py-12 sm:py-14 px-4 sm:px-6 border-y border-gray-100">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <p className="text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap">Built for India's top programs</p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {[
                { name: "AIM", sub: "Niti Aayog", color: "bg-blue-50 border-blue-100 text-blue-700" },
                { name: "RKVY", sub: "RAFTAAR", color: "bg-green-50 border-green-100 text-green-700" },
                { name: "DST", sub: "NIDHI", color: "bg-purple-50 border-purple-100 text-purple-700" },
                { name: "DPIIT", sub: "Recognized", color: "bg-orange-50 border-orange-100 text-orange-700" },
                { name: "BIRAC", sub: "BioNEST", color: "bg-pink-50 border-pink-100 text-pink-700" },
                { name: "TIDE", sub: "2.0", color: "bg-cyan-50 border-cyan-100 text-cyan-700" },
              ].map(p => (
                <div key={p.name} className={`rounded-xl border px-4 py-2.5 text-center ${p.color}`}>
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-[10px] opacity-70">{p.sub}</p>
                </div>
              ))}
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-center">
                <p className="text-sm font-bold text-gray-500">+ others</p>
                <p className="text-[10px] text-gray-400">State programs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Colorful Cards */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight max-w-xl">
            The platform for incubator + AI collaboration
          </h2>

          <div className="mt-12 sm:mt-16 grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: "Program Management", desc: "Create AIM, RKVY, DST programs with verticals, cohorts, and custom reporting cycles.", bg: "bg-rose-50", border: "border-rose-100", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
              { icon: Users, title: "Startup Onboarding", desc: "Add startups individually or bulk CSV. Generate join links. Cross-incubator detection.", bg: "bg-violet-50", border: "border-violet-100", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
              { icon: FileText, title: "Smart Reports", desc: "Configurable templates per program. Auto-sync metrics. Review with feedback.", bg: "bg-emerald-50", border: "border-emerald-100", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
              { icon: MessageSquare, title: "AI Chat", desc: "Ask anything about your portfolio. Get AI-powered insights and recommendations.", bg: "bg-blue-50", border: "border-blue-100", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
              { icon: BarChart3, title: "Grantor Reports", desc: "One-click PDF reports for AIM, DST, RKVY. Auto-aggregated data from all startups.", bg: "bg-amber-50", border: "border-amber-100", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
              { icon: Shield, title: "Startup Passport", desc: "Unique verified ID for every startup. Cross-incubator verification via DPIIT, CIN, PAN.", bg: "bg-teal-50", border: "border-teal-100", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
              { icon: ShoppingBag, title: "Marketplace", desc: "List your facilities. Startups across India can discover and request access.", bg: "bg-pink-50", border: "border-pink-100", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
              { icon: Lightbulb, title: "Form Builder", desc: "Investment forms, call for entries, due diligence. Google Forms-like builder.", bg: "bg-orange-50", border: "border-orange-100", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
            ].map(f => (
              <div key={f.title} className={`group rounded-2xl border ${f.border} ${f.bg} p-6 sm:p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.iconBg}`}>
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>
                <h3 className="mt-5 text-base sm:text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-medium text-emerald-400 mb-6">
                <Sparkles className="h-3.5 w-3.5" /> Powered by AI
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
                AI that understands your incubator
              </h2>
              <p className="mt-5 text-base sm:text-lg text-gray-400 leading-relaxed max-w-lg">
                Incubest AI analyzes your entire portfolio, spots trends, flags risks,
                and generates reports - so you can focus on what matters most: your startups.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  { icon: Brain, title: "Portfolio Intelligence", desc: "AI reads every startup report and surfaces what needs your attention." },
                  { icon: TrendingUp, title: "Predictive Insights", desc: "Identify high-potential startups and at-risk ventures before it's too late." },
                  { icon: AlertTriangle, title: "Smart Alerts", desc: "Get flagged when a startup misses reports, burns cash too fast, or stalls." },
                  { icon: FileText, title: "Auto Reports", desc: "Generate AIM, DST, RKVY quarterly reports in one click. AI aggregates the data." },
                ].map(f => (
                  <div key={f.title} className="flex items-start gap-4 rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                      <f.icon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{f.title}</h3>
                      <p className="text-sm text-gray-400 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Demo Card */}
            <div className="rounded-3xl bg-white/5 border border-white/10 p-6 sm:p-8">
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI Insight</span>
                  </div>
                  <p className="text-sm text-emerald-200">Your portfolio revenue grew 23% this quarter. 3 startups contributed 60% of that growth.</p>
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Attention Needed</span>
                  </div>
                  <p className="text-sm text-amber-200">NovaTech has not submitted reports for 2 months. Burn rate suggests 4 months runway left.</p>
                </div>
                <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-violet-400" />
                    <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Opportunity</span>
                  </div>
                  <p className="text-sm text-violet-200">GreenLeaf Agri is growing 40% MoM. Consider recommending for Series A readiness.</p>
                </div>
                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Report Ready</span>
                  </div>
                  <p className="text-sm text-blue-200">AIM Q1 Quarterly Report generated. 42 startups, all metrics aggregated. Ready to download.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Passport Section - Expanded */}
      <section id="passport" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-200 px-4 py-1.5 text-xs font-medium text-violet-700 mb-6">
              <Fingerprint className="h-3.5 w-3.5" /> Startup Passport
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              One identity across the<br className="hidden sm:block" /> entire ecosystem
            </h2>
            <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Every startup gets a unique verified Passport ID. Incubators can verify history.
              Startups get pan-India visibility on services and facilities.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Passport Preview */}
            <div className="lg:row-span-2 rounded-3xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border border-violet-100 p-6 sm:p-8 flex flex-col items-center justify-center">
              <p className="text-sm font-bold text-violet-600 mb-4 uppercase tracking-wider">How it looks</p>
              <div className="rounded-2xl bg-white border-2 border-violet-200 shadow-xl shadow-violet-500/10 p-6 sm:p-8 text-center w-full max-w-xs">
                <img src="/dark.svg" alt="Incubest" className="h-10 w-10 rounded-xl mx-auto mb-3" />
                <p className="text-[10px] text-violet-500 uppercase tracking-[0.2em] font-bold">Startup Passport</p>
                <p className="text-2xl sm:text-3xl font-mono font-bold text-violet-700 mt-2">IB-2026-MH-0042</p>
                <div className="mt-4 h-px bg-violet-100" />
                <p className="mt-3 text-sm font-semibold text-gray-900">TechCorp Innovations</p>
                <p className="text-xs text-gray-500">SaaS - B2B - Mumbai</p>
                <div className="mt-3 flex items-center justify-center gap-1 text-emerald-600 text-xs font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-violet-50 p-2">
                    <p className="text-sm font-bold text-gray-900">2</p>
                    <p className="text-[9px] text-gray-500">Incubators</p>
                  </div>
                  <div className="rounded-lg bg-violet-50 p-2">
                    <p className="text-sm font-bold text-gray-900">₹1.2Cr</p>
                    <p className="text-[9px] text-gray-500">Raised</p>
                  </div>
                  <div className="rounded-lg bg-violet-50 p-2">
                    <p className="text-sm font-bold text-gray-900">12</p>
                    <p className="text-[9px] text-gray-500">Team</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-violet-500 text-center">Public passport page for each startup</p>
            </div>

            {/* For Incubators */}
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6 sm:p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 mb-4">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">For Incubators</h3>
              <ul className="mt-3 space-y-2">
                {[
                  "Verify if a startup is incubated elsewhere",
                  "Detect duplicate applications via DPIIT, CIN, PAN",
                  "View complete incubation history of any startup",
                  "Reduce fraud and overlap in your programs",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>

            {/* For Startups */}
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 sm:p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 mb-4">
                <Globe className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">For Startups</h3>
              <ul className="mt-3 space-y-2">
                {[
                  "Get a verified identity across all incubators",
                  "Carry your track record wherever you go",
                  "Access the AI business advisor 24/7",
                  "Submit reports from one dashboard",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pan India Visibility */}
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-6 sm:p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 mb-4">
                <MapPin className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Pan-India Visibility</h3>
              <ul className="mt-3 space-y-2">
                {[
                  "Browse labs, coworking, and services from any incubator",
                  "Request access to facilities across the country",
                  "Incubators list their services on the marketplace",
                  "Connect with mentors and investors ecosystem-wide",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Verified Ecosystem */}
            <div className="rounded-2xl bg-pink-50 border border-pink-100 p-6 sm:p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 mb-4">
                <Award className="h-5 w-5 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Trusted Ecosystem</h3>
              <ul className="mt-3 space-y-2">
                {[
                  "DPIIT number matching for instant verification",
                  "CIN and PAN cross-checking",
                  "Founder email matching across incubators",
                  "Build trust across the incubation network",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-pink-500 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Incubest Apart - Colorful Cards */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight max-w-xl mb-12 sm:mb-16">
            What sets Incubest apart
          </h2>

          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* AI First */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-7 sm:p-9 text-white sm:col-span-2 lg:col-span-1 lg:row-span-2 flex flex-col justify-between min-h-[320px] sm:min-h-[380px]">
              <div>
                <Sparkles className="h-8 w-8 text-emerald-200 mb-5" />
                <h3 className="text-2xl sm:text-3xl font-bold leading-snug">AI-first,<br />not an afterthought</h3>
                <p className="mt-4 text-emerald-100 leading-relaxed text-[15px]">
                  Every feature is powered by AI. From chat to insights to report generation.
                  Your AI co-pilot understands your entire portfolio.
                </p>
              </div>
              <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-all w-fit">
                Try AI Chat <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Cross Incubator */}
            <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-7 sm:p-9 text-white flex flex-col justify-between min-h-[250px] sm:min-h-[280px]">
              <div>
                <Globe className="h-8 w-8 text-violet-200 mb-5" />
                <h3 className="text-xl sm:text-2xl font-bold leading-snug">Cross-incubator<br />verification</h3>
                <p className="mt-3 text-violet-200 text-[15px] leading-relaxed">
                  Startup Passport gives every startup a verified identity.
                  Detect overlaps. Share data across ecosystems.
                </p>
              </div>
            </div>

            {/* Reports */}
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-7 sm:p-9 text-white flex flex-col justify-between min-h-[250px] sm:min-h-[280px]">
              <div>
                <PieChart className="h-8 w-8 text-blue-200 mb-5" />
                <h3 className="text-xl sm:text-2xl font-bold leading-snug">One-click<br />grantor reports</h3>
                <p className="mt-3 text-blue-200 text-[15px] leading-relaxed">
                  AIM, DST, RKVY report formats built-in. Data flows automatically
                  from startup reports to grantor PDFs.
                </p>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-7 sm:p-9 text-white flex flex-col justify-between min-h-[250px] sm:min-h-[280px]">
              <div>
                <Lock className="h-8 w-8 text-rose-200 mb-5" />
                <h3 className="text-xl sm:text-2xl font-bold leading-snug">Enterprise-grade<br />security</h3>
                <p className="mt-3 text-rose-100 text-[15px] leading-relaxed">
                  Role-based access, encrypted data, rate limiting,
                  input sanitization. Your data stays yours.
                </p>
              </div>
            </div>

            {/* Made for India */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-7 sm:p-9 text-white flex flex-col justify-between min-h-[250px] sm:min-h-[280px]">
              <div>
                <Target className="h-8 w-8 text-amber-200 mb-5" />
                <h3 className="text-xl sm:text-2xl font-bold leading-snug">Made for the<br />Indian ecosystem</h3>
                <p className="mt-3 text-amber-100 text-[15px] leading-relaxed">
                  DPIIT numbers, CIN, PAN matching. State-wise tracking.
                  Rupee-first. Built by incubators, for incubators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Easily */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Get started easily
              </h2>
              <p className="mt-5 text-gray-500 text-base sm:text-lg leading-relaxed max-w-md">
                Set up your incubator, onboard startups, and start managing -
                all in under 5 minutes. No training needed.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { title: "Register your incubator", desc: "Create account, set up your first program", step: "1", color: "bg-emerald-50 border-emerald-100" },
                { title: "Onboard your startups", desc: "Bulk upload, share join links, or add individually", step: "2", color: "bg-violet-50 border-violet-100" },
                { title: "Let AI do the rest", desc: "Reports, insights, and analytics - automated", step: "3", color: "bg-blue-50 border-blue-100" },
              ].map((s) => (
                <div key={s.step} className={`group flex items-center gap-4 sm:gap-5 rounded-2xl border ${s.color} p-5 sm:p-6 hover:shadow-lg transition-all cursor-default`}>
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white text-lg font-bold">
                    {s.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">{s.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                  <ArrowRight className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gray-900 text-white p-2 sm:p-2.5 shrink-0 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-gray-50">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg">Start free. Scale when you're ready.</p>

          <div className="mt-10 sm:mt-14 grid gap-6 grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto text-left">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Free Trial</p>
              <p className="mt-3 text-4xl sm:text-5xl font-extrabold text-gray-900">₹0</p>
              <p className="text-sm text-gray-500 mt-1">for 2 months</p>
              <ul className="mt-6 sm:mt-8 space-y-3">
                {["All features included", "Unlimited startups", "AI chat and insights", "No credit card needed"].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-gray-300" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <button className="mt-6 sm:mt-8 w-full rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
                  Start free trial
                </button>
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-gray-900 bg-white p-6 sm:p-8 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-gray-900 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider">Recommended</span>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pro</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">₹4,999</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">after free trial</p>
              <ul className="mt-6 sm:mt-8 space-y-3">
                {["Everything in Free", "Unlimited programs", "Startup Passport system", "Marketplace access", "Team management", "Grantor report PDFs", "Priority support"].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <button className="mt-6 sm:mt-8 w-full rounded-full bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-all">
                  Get started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-emerald-900 to-emerald-950">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-10">
            <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-extrabold text-white leading-tight tracking-tight text-center md:text-left">
              The only platform built to run your incubator at any scale
            </h2>
            <Link href="/register">
              <button className="shrink-0 rounded-full bg-white px-10 py-4 text-[15px] font-bold text-emerald-900 hover:bg-emerald-50 transition-all shadow-xl">
                Get started
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-950 text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:gap-12 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            <div className="col-span-2 sm:col-span-3 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/light.svg" alt="Incubest" className="h-8 w-8 rounded-xl" />
                <span className="text-lg font-bold">Incubest</span>
              </div>
              <p className="text-sm text-emerald-300">The OS for Indian startup incubators</p>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">Product</p>
              <ul className="space-y-2.5 text-sm text-emerald-200">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#ai" className="hover:text-white transition-colors">AI Insights</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">For Incubators</p>
              <ul className="space-y-2.5 text-sm text-emerald-200">
                <li><Link href="/features/program-management" className="hover:text-white transition-colors">Program Management</Link></li>
                <li><Link href="/features/grantor-reports" className="hover:text-white transition-colors">Grantor Reports</Link></li>
                <li><Link href="/features/team-management" className="hover:text-white transition-colors">Team Management</Link></li>
                <li><Link href="/features/impact-dashboard" className="hover:text-white transition-colors">Impact Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">For Startups</p>
              <ul className="space-y-2.5 text-sm text-emerald-200">
                <li><Link href="/features/startup-passport" className="hover:text-white transition-colors">Startup Passport</Link></li>
                <li><Link href="/features/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                <li><Link href="/features/ai-advisor" className="hover:text-white transition-colors">AI Advisor</Link></li>
                <li><Link href="/features/milestone-tracking" className="hover:text-white transition-colors">Milestone Tracking</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4">Company</p>
              <ul className="space-y-2.5 text-sm text-emerald-200">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><a href="mailto:aau.incubator@gmail.com" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 pt-8 border-t border-emerald-800 flex flex-col items-center gap-3 text-center">
            <p className="text-xs text-emerald-400">&copy; {new Date().getFullYear()} Incubest. All rights reserved.</p>
            <p className="text-xs text-emerald-500">Proudly powered by Foundation of AIC-AAU Incubator (NEATEHUB)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
