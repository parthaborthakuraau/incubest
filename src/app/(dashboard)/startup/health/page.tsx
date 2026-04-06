import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Target,
  TrendingUp,
  Users,
  Users2,
  Banknote,
  FolderCheck,
} from "lucide-react";

interface HealthBreakdown {
  reporting: number;
  milestones: number;
  revenue: number;
  mentoring: number;
  team: number;
  funding: number;
  documents: number;
}

interface HealthScore {
  startupId: string;
  startupName: string;
  totalScore: number;
  breakdown: HealthBreakdown;
}

const METRICS = [
  {
    key: "reporting" as const,
    label: "Reporting Compliance",
    max: 25,
    icon: FileText,
    tip: "Submit monthly reports consistently to improve this score.",
  },
  {
    key: "milestones" as const,
    label: "Milestone Completion",
    max: 20,
    icon: Target,
    tip: "Complete your assigned milestones to boost this metric.",
  },
  {
    key: "revenue" as const,
    label: "Revenue Growth",
    max: 15,
    icon: TrendingUp,
    tip: "Update your revenue figures in your profile and monthly reports.",
  },
  {
    key: "mentoring" as const,
    label: "Mentor Engagement",
    max: 15,
    icon: Users2,
    tip: "Schedule at least 3 mentor sessions every 6 months.",
  },
  {
    key: "team" as const,
    label: "Team Size",
    max: 10,
    icon: Users,
    tip: "Grow your team to more than 3 employees for full points.",
  },
  {
    key: "funding" as const,
    label: "Funding",
    max: 10,
    icon: Banknote,
    tip: "Secure and utilize disbursed funds to earn these points.",
  },
  {
    key: "documents" as const,
    label: "Document Compliance",
    max: 5,
    icon: FolderCheck,
    tip: "Upload your pitch deck and DPIIT certificate.",
  },
];

function getScoreColor(score: number): string {
  if (score > 70) return "text-green-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

function getScoreBg(score: number): string {
  if (score > 70) return "border-green-500";
  if (score >= 40) return "border-yellow-500";
  return "border-red-500";
}

function getBarColor(score: number, max: number): string {
  const pct = (score / max) * 100;
  if (pct > 70) return "bg-green-500";
  if (pct >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

export default async function HealthScorePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    redirect("/login");
  }

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/health-score`, {
    headers: {
      cookie: `next-auth.session-token=${session.user.id}`,
    },
    cache: "no-store",
  });

  let score: HealthScore | null = null;

  // Fallback: try internal fetch, otherwise show empty state
  try {
    if (res.ok) {
      score = await res.json();
    }
  } catch {
    // Will show empty state
  }

  if (!score) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Unable to load health score. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Health Score</h1>
        <p className="text-gray-500">Track your startup&apos;s overall health and find areas to improve</p>
      </div>

      {/* Circular Score Display */}
      <div className="flex justify-center">
        <div
          className={`flex h-48 w-48 items-center justify-center rounded-full border-8 ${getScoreBg(score.totalScore)}`}
        >
          <div className="text-center">
            <p className={`text-5xl font-bold ${getScoreColor(score.totalScore)}`}>
              {score.totalScore}
            </p>
            <p className="text-sm text-gray-500">out of 100</p>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {METRICS.map((metric) => {
          const value = score!.breakdown[metric.key];
          const pct = Math.round((value / metric.max) * 100);
          const Icon = metric.icon;
          const showTip = pct < 70;

          return (
            <Card key={metric.key}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-gray-500" />
                    <CardTitle className="text-base">{metric.label}</CardTitle>
                  </div>
                  <span className="text-sm font-semibold">
                    {value} / {metric.max}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Bar */}
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(value, metric.max)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {/* Improvement Tip */}
                {showTip && (
                  <p className="mt-2 text-xs text-gray-500">{metric.tip}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
