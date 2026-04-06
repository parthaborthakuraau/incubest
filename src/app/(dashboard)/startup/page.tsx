"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2, TrendingUp, FileText, Target, MessageSquare,
  ArrowRight, Users, IndianRupee, Shield,
  Bell, CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Task {
  type: string; title: string; description: string; deadline?: string; link: string; priority: string;
}

interface DashboardData {
  user: { name: string; passportId: string | null };
  activeStartup: {
    name: string; slug: string; passportId: string | null;
    revenue: number; funding: number; employeesCount: number; customersCount: number;
    organization: { name: string }; program: { name: string } | null; cohort: string;
    _count: { reports: number };
  };
  incubators: { startupId: string; organization: { name: string } }[];
  tasks: Task[];
  passportComplete: boolean;
  passportProgress: number;
}

export default function StartupDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/startup/dashboard")
      .then((res) => res.json())
      .then((d) => { if (!d.error) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading dashboard...</p></div>;

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Card><CardContent className="py-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No startup found</h3>
          <p className="mt-2 text-sm text-gray-500">Join an incubator through an invite link to get started.</p>
        </CardContent></Card>
      </div>
    );
  }

  const { user, activeStartup: s, tasks, passportComplete, passportProgress } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{s.name}</h1>
          <p className="text-sm text-gray-500">{s.organization.name} &middot; {s.cohort}{s.program ? ` &middot; ${s.program.name}` : ""}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/chat">
            <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <MessageSquare className="mr-2 h-4 w-4" /> AI Advisor
            </Button>
          </Link>
          {tasks.some(t => t.type === "report") && (
            <Link href="/startup/reporting">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <FileText className="mr-2 h-4 w-4" /> Submit Report
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Report reminders */}
      {tasks.filter(t => t.type === "report").map((t, i) => (
        <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>{t.title}</strong> — {t.description}{" "}
            <Link href="/startup/reporting" className="font-medium underline hover:text-amber-900">Submit now</Link>
          </p>
        </div>
      ))}

      {/* Passport CTA */}
      {!passportComplete && (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Complete your Startup Passport</p>
                <p className="text-xs text-gray-500 mt-0.5">{passportProgress}/8 fields completed</p>
                <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-emerald-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(passportProgress / 8) * 100}%` }} />
                </div>
              </div>
            </div>
            <Link href="/startup/profile">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Complete Profile</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats — colorful gradient cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg shadow-emerald-500/20">
          <TrendingUp className="h-5 w-5 opacity-80" />
          <p className="mt-3 text-2xl font-bold">{formatCurrency(s.revenue)}</p>
          <p className="text-sm opacity-80">Revenue</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-5 text-white shadow-lg shadow-violet-500/20">
          <IndianRupee className="h-5 w-5 opacity-80" />
          <p className="mt-3 text-2xl font-bold">{formatCurrency(s.funding)}</p>
          <p className="text-sm opacity-80">Funding</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-5 text-white shadow-lg shadow-pink-500/20">
          <Users className="h-5 w-5 opacity-80" />
          <p className="mt-3 text-2xl font-bold">{s.employeesCount}</p>
          <p className="text-sm opacity-80">Employees</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg shadow-amber-500/20">
          <FileText className="h-5 w-5 opacity-80" />
          <p className="mt-3 text-2xl font-bold">{s._count.reports}</p>
          <p className="text-sm opacity-80">Reports</p>
        </div>
      </div>

      {/* AI Insights */}
      <StartupInsightsCard />

      {/* Tasks + Passport */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-600" />
              Pending Tasks ({tasks.length})
            </CardTitle>
            <Link href="/startup/reporting">
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                <p className="mt-2 text-sm text-emerald-600 font-medium">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((t, i) => (
                  <Link key={i} href={t.link}>
                    <div className={`flex items-center justify-between rounded-xl border p-3 hover:bg-gray-50 cursor-pointer transition-all ${t.priority === "high" ? "border-red-200 bg-red-50/50" : "border-gray-100"}`}>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.title}</p>
                        <p className="text-xs text-gray-500">{t.description}</p>
                      </div>
                      <Badge variant={t.type === "report" ? "default" : "outline"} className={t.type === "report" ? "bg-emerald-600" : ""}>
                        {t.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Passport preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-violet-600" />
              Passport
            </CardTitle>
          </CardHeader>
          <CardContent>
            {passportComplete ? (
              <div className="text-center py-4">
                {s.passportId && (
                  <div className="inline-block rounded-xl border-2 border-emerald-200 bg-emerald-50 px-5 py-3 mb-3">
                    <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-semibold">Passport ID</p>
                    <p className="text-xl font-mono font-bold text-emerald-700">{s.passportId}</p>
                  </div>
                )}
                <p className="text-sm text-gray-700 font-medium">{s.name}</p>
                <p className="text-xs text-gray-400">{user.name} &middot; {data.incubators.length} incubator(s)</p>
                <Link href="/startup/passport">
                  <Button variant="outline" size="sm" className="mt-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    View Full Passport
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto max-w-[200px] mb-3">
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${(passportProgress / 8) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{passportProgress}/8 complete</p>
                </div>
                <Link href="/startup/profile">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">Complete Passport</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        {[
          { href: "/startup/reporting", label: "Monthly Reports", icon: FileText, color: "text-emerald-600 bg-emerald-50" },
          { href: "/startup/my-startup", label: "My Startup", icon: Building2, color: "text-violet-600 bg-violet-50" },
          { href: "/startup/marketplace", label: "Marketplace", icon: Target, color: "text-pink-600 bg-pink-50" },
          { href: "/startup/incubators", label: "My Incubators", icon: Building2, color: "text-amber-600 bg-amber-50" },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="cursor-pointer transition-all hover:shadow-md hover:border-gray-300">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${link.color}`}>
                  <link.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-gray-900">{link.label}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-gray-300" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── AI Insights Card ───────────────────────────────

function StartupInsightsCard() {
  const [insights, setInsights] = useState<{
    summary?: string; strengths?: string[]; opportunities?: string[];
    actionItems?: string[]; momentum?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const res = await fetch("/api/startup/insights", { method: "POST" });
    if (res.ok) setInsights(await res.json());
    setLoading(false);
  }

  const momentumColors: Record<string, string> = {
    growing: "bg-emerald-100 text-emerald-700",
    steady: "bg-blue-100 text-blue-700",
    "needs-boost": "bg-amber-100 text-amber-700",
  };

  if (!insights && !loading) {
    return (
      <Card className="border-dashed border-emerald-200 bg-emerald-50/30">
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Startup Insights</p>
              <p className="text-xs text-gray-500">Get personalized advice for your startup</p>
            </div>
          </div>
          <Button onClick={generate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Get Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-emerald-200">
        <CardContent className="flex items-center justify-center py-10">
          <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full mr-3" />
          <p className="text-sm text-gray-500">Analyzing your startup...</p>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <Card className="border-emerald-200">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> AI Insights
          </h3>
          <div className="flex items-center gap-2">
            {insights.momentum && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${momentumColors[insights.momentum] || momentumColors.steady}`}>
                {insights.momentum}
              </span>
            )}
            <button onClick={generate} className="text-xs text-emerald-600 hover:underline">Refresh</button>
          </div>
        </div>

        {insights.summary && <p className="text-sm text-gray-700 leading-relaxed">{insights.summary}</p>}

        <div className="grid gap-3 md:grid-cols-3">
          {insights.strengths && insights.strengths.length > 0 && (
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1.5">Strengths</p>
              <ul className="space-y-1">{insights.strengths.map((s, i) => <li key={i} className="text-xs text-emerald-800">{s}</li>)}</ul>
            </div>
          )}
          {insights.opportunities && insights.opportunities.length > 0 && (
            <div className="rounded-xl bg-violet-50 p-3">
              <p className="text-xs font-semibold text-violet-700 mb-1.5">Opportunities</p>
              <ul className="space-y-1">{insights.opportunities.map((o, i) => <li key={i} className="text-xs text-violet-800">{o}</li>)}</ul>
            </div>
          )}
          {insights.actionItems && insights.actionItems.length > 0 && (
            <div className="rounded-xl bg-pink-50 p-3">
              <p className="text-xs font-semibold text-pink-700 mb-1.5">Action Items</p>
              <ul className="space-y-1">{insights.actionItems.map((a, i) => <li key={i} className="text-xs text-pink-800">{a}</li>)}</ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
