import Link from "next/link";
import { ArrowLeft, ArrowRight, HeartPulse, Users, TrendingUp, Sparkles } from "lucide-react";

export const metadata = {
  title: "Impact Dashboard | Incubest",
  description: "Track ROCE, social capital, jobs created, revenue generated, and portfolio health - all computed automatically from startup data.",
};

export default function ImpactDashboardPage() {
  const features = [
    {
      icon: HeartPulse,
      title: "Real-time portfolio health score",
      description:
        "Get a single score that reflects the overall health of your portfolio based on startup activity, reporting compliance, and growth metrics.",
    },
    {
      icon: Users,
      title: "Jobs created (direct + indirect)",
      description:
        "Track total employment impact across your portfolio including direct hires at startups and indirect jobs generated in the ecosystem.",
    },
    {
      icon: TrendingUp,
      title: "Revenue and funding tracking",
      description:
        "Monitor total revenue generated, funding raised, and ROCE across all startups in your portfolio with auto-updated charts.",
    },
    {
      icon: Sparkles,
      title: "Social impact metrics (women-led, rural, SC/ST)",
      description:
        "Track diversity and inclusion metrics including women-led startups, rural enterprises, and SC/ST founder representation.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Startups report monthly data",
      description:
        "Startups submit monthly updates on revenue, jobs, funding, and milestones through a simple reporting form.",
    },
    {
      number: "02",
      title: "Metrics auto-compute",
      description:
        "The platform automatically calculates portfolio-level metrics like ROCE, total jobs, revenue growth, and social impact scores.",
    },
    {
      number: "03",
      title: "View impact dashboard with charts",
      description:
        "Access a visual dashboard with charts, trends, and breakdowns that update in real time as new data flows in.",
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
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-6">
              <HeartPulse className="h-4 w-4" /> Impact Dashboard
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              Impact Dashboard
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Track ROCE, social capital, jobs created, revenue generated, and portfolio health - all computed automatically from startup data.
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
              Measure what matters
            </h2>
            <p className="text-gray-500 text-center max-w-xl mx-auto mb-14">
              Automatically computed metrics that tell the real story of your incubator's impact.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-2xl bg-white border border-gray-100 p-6">
                  <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-emerald-600" />
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
              From raw startup data to actionable impact metrics.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="relative">
                  <span className="text-5xl font-bold text-emerald-100">{step.number}</span>
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
              Show your impact with real data
            </h2>
            <p className="text-gray-500 mb-8">
              Let your numbers speak for themselves with auto-computed impact metrics.
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
