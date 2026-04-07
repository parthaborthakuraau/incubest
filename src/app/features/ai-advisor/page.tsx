import Link from "next/link";
import { ArrowLeft, ArrowRight, BrainCircuit, TrendingUp, FileText, Clock } from "lucide-react";

export const metadata = {
  title: "AI Advisor | Incubest",
  description: "Chat with an AI that understands your startup's data - revenue, burn rate, milestones, funding. Get actionable advice, not generic tips.",
};

export default function AIAdvisorPage() {
  const features = [
    {
      icon: BrainCircuit,
      title: "Context-aware AI that reads your startup data",
      description:
        "The AI advisor pulls in your revenue, burn rate, milestones, and funding data to give advice grounded in your actual numbers.",
    },
    {
      icon: TrendingUp,
      title: "Business strategy and growth recommendations",
      description:
        "Get tailored recommendations on growth strategy, fundraising timing, market expansion, and operational efficiency based on your data.",
    },
    {
      icon: FileText,
      title: "Report generation assistance",
      description:
        "Generate investor updates, monthly reports, and progress summaries in seconds - pre-filled with your latest startup metrics.",
    },
    {
      icon: Clock,
      title: "Available 24/7 - no scheduling needed",
      description:
        "No waiting for mentor availability or office hours. Get instant, data-backed answers to your business questions any time of day.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Connect your startup data",
      description:
        "Your revenue, burn rate, milestones, and funding data are automatically available to the AI from your Incubest dashboard.",
    },
    {
      number: "02",
      title: "Ask any business question",
      description:
        "Ask about fundraising strategy, growth tactics, market positioning, or any business challenge you are facing.",
    },
    {
      number: "03",
      title: "Get personalized, data-backed advice",
      description:
        "Receive actionable recommendations grounded in your actual startup data - not generic tips from the internet.",
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
              <BrainCircuit className="h-4 w-4" /> AI Advisor
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              AI Advisor
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Chat with an AI that understands your startup's data - revenue, burn rate, milestones, funding. Get actionable advice, not generic tips.
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
              AI that actually knows your business
            </h2>
            <p className="text-gray-500 text-center max-w-xl mx-auto mb-14">
              Not another chatbot - an advisor that reads your data and gives specific, actionable guidance.
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
              Get personalized advice in three simple steps.
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
              Ready to talk to your AI advisor?
            </h2>
            <p className="text-gray-500 mb-8">
              Get data-driven business advice tailored to your startup - available around the clock.
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
