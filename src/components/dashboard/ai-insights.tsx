"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, CheckCircle2, Lightbulb, Loader2, RefreshCw } from "lucide-react";

interface Insights {
  summary: string;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
  metrics: {
    portfolioHealth?: string;
    revenueGrowthTrend?: string;
    reportingCompliance?: string;
  };
}

const HEALTH_COLORS: Record<string, string> = {
  good: "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  "needs-attention": "bg-red-100 text-red-700",
  up: "bg-green-100 text-green-700",
  flat: "bg-gray-100 text-gray-700",
  down: "bg-red-100 text-red-700",
  poor: "bg-red-100 text-red-700",
};

export function AIInsights() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/insights", { method: "POST" });
    if (res.ok) {
      setInsights(await res.json());
    } else {
      setError("Failed to generate insights. Check your Groq API key.");
    }
    setLoading(false);
  }

  if (!insights && !loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50">
              <Sparkles className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Portfolio Insights</p>
              <p className="text-xs text-gray-500">Get AI-powered analysis of your portfolio</p>
            </div>
          </div>
          <Button onClick={generate} disabled={loading}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500 mr-3" />
          <p className="text-sm text-gray-500">Analyzing your portfolio...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-5">
          <p className="text-sm text-red-600">{error}</p>
          <Button size="sm" variant="outline" onClick={generate} className="mt-2">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-violet-500" />
          AI Portfolio Insights
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={generate} disabled={loading}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <p className="text-sm text-gray-700 leading-relaxed">{insights.summary}</p>

        {/* Health badges */}
        {insights.metrics && (
          <div className="flex flex-wrap gap-2">
            {insights.metrics.portfolioHealth && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${HEALTH_COLORS[insights.metrics.portfolioHealth] || HEALTH_COLORS.moderate}`}>
                Portfolio: {insights.metrics.portfolioHealth}
              </span>
            )}
            {insights.metrics.revenueGrowthTrend && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${HEALTH_COLORS[insights.metrics.revenueGrowthTrend] || HEALTH_COLORS.flat}`}>
                Revenue: {insights.metrics.revenueGrowthTrend}
              </span>
            )}
            {insights.metrics.reportingCompliance && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${HEALTH_COLORS[insights.metrics.reportingCompliance] || HEALTH_COLORS.moderate}`}>
                Reporting: {insights.metrics.reportingCompliance}
              </span>
            )}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {/* Highlights */}
          {insights.highlights.length > 0 && (
            <div className="rounded-xl bg-green-50/50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-green-700 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> Highlights
              </p>
              <ul className="space-y-1.5">
                {insights.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-green-800 leading-relaxed">{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Concerns */}
          {insights.concerns.length > 0 && (
            <div className="rounded-xl bg-orange-50/50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 mb-2">
                <AlertTriangle className="h-3.5 w-3.5" /> Concerns
              </p>
              <ul className="space-y-1.5">
                {insights.concerns.map((c, i) => (
                  <li key={i} className="text-xs text-orange-800 leading-relaxed">{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <div className="rounded-xl bg-blue-50/50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-2">
                <Lightbulb className="h-3.5 w-3.5" /> Recommendations
              </p>
              <ul className="space-y-1.5">
                {insights.recommendations.map((r, i) => (
                  <li key={i} className="text-xs text-blue-800 leading-relaxed">{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
