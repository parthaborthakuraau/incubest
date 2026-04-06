"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp, Loader2, Info } from "lucide-react";

interface StartupInfo {
  id: string;
  name: string;
  slug: string;
}

interface SocialImpactRecord {
  id: string;
  metricName: string;
  value: number;
  unit: string;
  month: number;
  year: number;
  description: string | null;
  startup: StartupInfo;
}

interface CumulativeMetric {
  total: number;
  unit: string;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const fmt = new Intl.NumberFormat("en-IN");

function formatMetricLabel(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function IncubatorImpactPage() {
  const [impacts, setImpacts] = useState<SocialImpactRecord[]>([]);
  const [cumulative, setCumulative] = useState<Record<string, CumulativeMetric>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/social-impact");
        if (res.ok) {
          const data = await res.json();
          setImpacts(data.impacts || []);
          setCumulative(data.cumulative || {});
        }
      } catch (err) {
        console.error("Failed to fetch social impact data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build per-startup breakdown for each metric
  const breakdownByMetric: Record<
    string,
    Record<string, { startupName: string; total: number; unit: string }>
  > = {};

  for (const impact of impacts) {
    if (!breakdownByMetric[impact.metricName]) {
      breakdownByMetric[impact.metricName] = {};
    }
    const startupId = impact.startup.id;
    if (!breakdownByMetric[impact.metricName][startupId]) {
      breakdownByMetric[impact.metricName][startupId] = {
        startupName: impact.startup.name,
        total: 0,
        unit: impact.unit,
      };
    }
    breakdownByMetric[impact.metricName][startupId].total += impact.value;
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const metricNames = Object.keys(cumulative);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Social Impact Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Cumulative social capital across all startups
        </p>
      </div>

      {/* Aggregate Stat Cards */}
      {metricNames.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metricNames.map((metricName) => {
            const data = cumulative[metricName];
            return (
              <Card key={metricName}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {formatMetricLabel(metricName)}
                      </p>
                      <p className="mt-1 text-3xl font-bold text-gray-900">
                        {fmt.format(data.total)}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {data.unit}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                      <TrendingUp className="h-6 w-6 text-brand-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No impact data yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Social impact entries from your startups will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Per-Metric Breakdown Tables */}
      {metricNames.map((metricName) => {
        const startups = breakdownByMetric[metricName] || {};
        const startupEntries = Object.values(startups).sort(
          (a, b) => b.total - a.total
        );
        const metricTotal = cumulative[metricName].total;
        const metricUnit = cumulative[metricName].unit;

        return (
          <Card key={metricName}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle>{formatMetricLabel(metricName)}</CardTitle>
                <Badge variant="secondary">
                  {fmt.format(metricTotal)} {metricUnit} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="pb-3 font-medium">Startup</th>
                      <th className="pb-3 font-medium text-right">
                        Contribution
                      </th>
                      <th className="pb-3 font-medium text-right">
                        % of Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {startupEntries.map((entry) => (
                      <tr
                        key={entry.startupName}
                        className="border-b border-gray-100"
                      >
                        <td className="py-3 font-medium">
                          {entry.startupName}
                        </td>
                        <td className="py-3 text-right">
                          {fmt.format(entry.total)} {entry.unit}
                        </td>
                        <td className="py-3 text-right text-gray-500">
                          {metricTotal > 0
                            ? ((entry.total / metricTotal) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="py-3">Total</td>
                      <td className="py-3 text-right">
                        {fmt.format(metricTotal)} {metricUnit}
                      </td>
                      <td className="py-3 text-right">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* How We Calculate - Transparency Section */}
      {metricNames.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-brand-600" />
              <CardTitle>How We Calculate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              All social impact numbers are transparently calculated from
              individual startup-reported data. No estimates or projections are
              included.
            </p>
            <ul className="space-y-2">
              {metricNames.map((metricName) => {
                const data = cumulative[metricName];
                const startupCount = Object.keys(
                  breakdownByMetric[metricName] || {}
                ).length;
                return (
                  <li
                    key={metricName}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    <span>
                      <strong>Total {formatMetricLabel(metricName)}</strong> ={" "}
                      Sum of all startup-reported {metricName.replace(/_/g, " ")}{" "}
                      across all months ({fmt.format(data.total)} {data.unit}{" "}
                      from {startupCount} startup
                      {startupCount !== 1 ? "s" : ""})
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
