"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import {
  TrendingUp, IndianRupee, Users, Briefcase, Heart, Lightbulb,
  Target, Building2, Award, Shield, TreePine, CalendarDays,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ImpactData {
  overview: {
    totalStartups: number; totalRevenue: number; totalFunding: number;
    totalEmployees: number; totalCustomers: number; totalDisbursed: number;
    totalJobs: number; totalIPs: number; totalEvents: number;
    totalGrants: number; funded: number; graduated: number;
  };
  diversity: { womenLed: number; rural: number; scSt: number };
  roce: number;
  portfolioHealth: number;
  impactMetrics: Record<string, { total: number; unit: string }>;
}

export default function ImpactDashboardPage() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/impact").then(r => r.json()).then(d => { if (!d.error) setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading impact data...</p></div>;
  if (!data) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Failed to load</p></div>;

  const { overview: o, diversity: d, roce, portfolioHealth, impactMetrics } = data;
  const healthColor = portfolioHealth >= 70 ? "text-green-600" : portfolioHealth >= 40 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Impact Dashboard</h1>
        <p className="text-sm text-gray-500">Portfolio impact, ROCE, social capital, and health metrics</p>
      </div>

      {/* Portfolio Health + ROCE */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500">Portfolio Health Score</p>
            <p className={`text-5xl font-bold mt-2 ${healthColor}`}>{portfolioHealth}</p>
            <p className="text-xs text-gray-400 mt-1">out of 100</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
              <div className={`h-full rounded-full transition-all ${portfolioHealth >= 70 ? "bg-green-500" : portfolioHealth >= 40 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${portfolioHealth}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500">Return on Capital Employed</p>
            <p className="text-5xl font-bold mt-2 text-gray-900">{roce}x</p>
            <p className="text-xs text-gray-400 mt-1">Revenue / Funds Disbursed</p>
            <div className="mt-3 text-xs text-gray-500">
              {formatCurrency(o.totalRevenue)} / {formatCurrency(o.totalDisbursed)}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500">Startups Funded</p>
            <p className="text-5xl font-bold mt-2 text-gray-900">{o.funded}</p>
            <p className="text-xs text-gray-400 mt-1">of {o.totalStartups} total &middot; {formatCurrency(o.totalGrants)} disbursed</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Numbers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: formatCurrency(o.totalRevenue), icon: TrendingUp, color: "text-green-600" },
          { label: "Total Funding Raised", value: formatCurrency(o.totalFunding), icon: IndianRupee, color: "text-blue-600" },
          { label: "Jobs Created", value: o.totalJobs.toLocaleString("en-IN"), icon: Briefcase, color: "text-violet-600" },
          { label: "Employees", value: o.totalEmployees.toLocaleString("en-IN"), icon: Users, color: "text-teal-600" },
          { label: "IPs Filed", value: String(o.totalIPs), icon: Lightbulb, color: "text-orange-600" },
          { label: "Events Conducted", value: String(o.totalEvents), icon: CalendarDays, color: "text-pink-600" },
          { label: "Startups Graduated", value: String(o.graduated), icon: Award, color: "text-amber-600" },
          { label: "Customers Reached", value: o.totalCustomers.toLocaleString("en-IN"), icon: Building2, color: "text-cyan-600" },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <m.icon className={`h-8 w-8 ${m.color} shrink-0`} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                <p className="text-xs text-gray-500">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diversity & Inclusion */}
      <Card>
        <CardHeader><CardTitle>Diversity & Inclusion</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-xl bg-pink-50 p-4">
              <Heart className="h-8 w-8 text-pink-500" />
              <div><p className="text-2xl font-bold text-gray-900">{d.womenLed}</p><p className="text-xs text-gray-500">Women-Led Startups</p></div>
            </div>
            <div className="flex items-center gap-4 rounded-xl bg-blue-50 p-4">
              <Shield className="h-8 w-8 text-blue-500" />
              <div><p className="text-2xl font-bold text-gray-900">{d.scSt}</p><p className="text-xs text-gray-500">SC/ST Founders</p></div>
            </div>
            <div className="flex items-center gap-4 rounded-xl bg-green-50 p-4">
              <TreePine className="h-8 w-8 text-green-500" />
              <div><p className="text-2xl font-bold text-gray-900">{d.rural}</p><p className="text-xs text-gray-500">Rural Startups</p></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Impact Metrics */}
      {Object.keys(impactMetrics).length > 0 && (
        <Card>
          <CardHeader><CardTitle>Social Impact Metrics</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(impactMetrics).map(([name, { total, unit }]) => (
                <div key={name} className="rounded-xl border border-gray-200/80 p-4">
                  <p className="text-2xl font-bold text-gray-900">{total.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-500">{name.replace(/_/g, " ")} ({unit})</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
