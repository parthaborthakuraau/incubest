import Link from "next/link";
import { ArrowLeft, ArrowRight, Target, CheckCircle2, Eye, Link2 } from "lucide-react";

export const metadata = {
  title: "Milestone Tracking | Incubest",
  description: "Set milestones, track progress, and show your incubator exactly where you stand. From product launches to funding rounds.",
};

export default function MilestoneTrackingPage() {
  const features = [
    {
      icon: Target,
      title: "Create custom milestones with deadlines",
      description:
        "Define milestones that matter to your startup - product launches, revenue targets, hiring goals, funding rounds - each with a clear deadline.",
    },
    {
      icon: CheckCircle2,
      title: "Track completion status and progress",
      description:
        "Update milestone progress as you go. See what is done, what is in progress, and what is coming up next - all in one view.",
    },
    {
      icon: Eye,
      title: "Visible to your incubator for transparency",
      description:
        "Your incubator can see your milestone progress in real time. No more status update meetings or manual reporting.",
    },
    {
      icon: Link2,
      title: "Link milestones to funding stages",
      description:
        "Connect milestones to funding stages - pre-seed, seed, Series A - so investors and incubators see your progress in context.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Set your milestones",
      description:
        "Create milestones with titles, descriptions, deadlines, and funding stage links from your startup dashboard.",
    },
    {
      number: "02",
      title: "Update progress as you go",
      description:
        "Mark milestones as in progress or completed. Add notes and evidence as you hit each target.",
    },
    {
      number: "03",
      title: "Incubator reviews and provides feedback",
      description:
        "Your incubator tracks your progress, provides feedback, and adjusts support based on where you stand.",
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
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 mb-6">
              <Target className="h-4 w-4" /> Milestone Tracking
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              Milestone Tracking
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Set milestones, track progress, and show your incubator exactly where you stand. From product launches to funding rounds.
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
              Track every milestone that matters
            </h2>
            <p className="text-gray-500 text-center max-w-xl mx-auto mb-14">
              A clear, shared view of startup progress for founders and incubators alike.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-2xl bg-white border border-gray-100 p-6">
                  <div className="h-11 w-11 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-amber-600" />
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
              Start tracking milestones in three simple steps.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="relative">
                  <span className="text-5xl font-bold text-amber-100">{step.number}</span>
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
              Ready to track your milestones?
            </h2>
            <p className="text-gray-500 mb-8">
              Show your incubator exactly where you stand - with clear progress and real deadlines.
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
