import Link from "next/link";
import { ArrowLeft, ArrowRight, Fingerprint, ShieldCheck, Globe, History } from "lucide-react";

export const metadata = {
  title: "Startup Passport | Incubest",
  description: "Every startup gets a unique verified Passport ID - a digital identity that travels across India's entire incubation ecosystem.",
};

export default function StartupPassportPage() {
  const features = [
    {
      icon: Fingerprint,
      title: "Unique Passport ID",
      description:
        "Every startup receives a unique Passport ID in the IB-2026-MH-0042 format - a permanent digital identity across the incubation ecosystem.",
    },
    {
      icon: ShieldCheck,
      title: "Cross-incubator verification",
      description:
        "Verify startups instantly via DPIIT, CIN, or PAN. No more manual background checks or redundant paperwork across incubators.",
    },
    {
      icon: Globe,
      title: "Public passport page with verified badge",
      description:
        "Each startup gets a public-facing passport page displaying their verified status, making credibility visible to partners and investors.",
    },
    {
      icon: History,
      title: "Incubation history visible to all incubators",
      description:
        "A startup's full incubation journey - past programs, cohorts, and milestones - is visible to any incubator on the platform.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Startup joins an incubator",
      description:
        "A startup gets onboarded into any incubator on the Incubest platform through the standard intake process.",
    },
    {
      number: "02",
      title: "Passport ID auto-generated",
      description:
        "A unique Passport ID is automatically created and linked to the startup's profile with all verified credentials.",
    },
    {
      number: "03",
      title: "Verified across all incubators",
      description:
        "The Passport ID travels with the startup - any incubator on the platform can instantly verify their identity and history.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/dark.svg" alt="Incubest" className="h-8 w-8 rounded-xl" />
            <span className="text-lg font-bold text-gray-900">Incubest</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700 mb-6">
              <Fingerprint className="h-4 w-4" /> Startup Passport
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              Startup Passport
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Every startup gets a unique verified Passport ID - a digital identity that travels across India's entire incubation ecosystem.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
              One identity across every incubator
            </h2>
            <p className="text-gray-500 text-center max-w-xl mx-auto mb-14">
              A portable, verified digital identity built for India's incubation ecosystem.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-2xl bg-white border border-gray-100 p-6">
                  <div className="h-11 w-11 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-violet-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
              How it works
            </h2>
            <p className="text-gray-500 text-center max-w-xl mx-auto mb-14">
              Get your Passport ID in three simple steps.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="relative">
                  <span className="text-5xl font-bold text-violet-100">{step.number}</span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Ready to get your Startup Passport?
            </h2>
            <p className="text-gray-500 mb-8">
              Join the ecosystem where your startup identity is verified once and trusted everywhere.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Get started for free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/dark.svg" alt="Incubest" className="h-6 w-6 rounded-lg" />
            <span className="text-sm font-bold text-gray-900">Incubest</span>
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
