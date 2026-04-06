"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DistributionChartsProps {
  focusAreas: Record<string, number>;
  locations: Record<string, number>;
  sectors: Record<string, number>;
  total: number;
}

const COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500",
  "bg-teal-500", "bg-indigo-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

function BarDistribution({ data, total, label }: { data: Record<string, number>; total: number; label: string }) {
  const sorted = Object.entries(data).sort(([, a], [, b]) => b - a);
  if (sorted.length === 0) return <p className="py-4 text-center text-xs text-gray-400">No data</p>;

  return (
    <div className="space-y-2.5">
      {sorted.slice(0, 8).map(([name, count], i) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-700 truncate max-w-[60%]">{name.replace(/_/g, " ")}</span>
              <span className="text-xs font-medium text-gray-900">{count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div className={`h-full rounded-full ${COLORS[i % COLORS.length]} transition-all`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      {sorted.length > 8 && (
        <p className="text-[10px] text-gray-400">+{sorted.length - 8} more</p>
      )}
    </div>
  );
}

export function DistributionCharts({ focusAreas, locations, sectors, total }: DistributionChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Focus Areas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Focus Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <BarDistribution data={focusAreas} total={total} label="Focus Area" />
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <BarDistribution data={locations} total={total} label="Location" />
        </CardContent>
      </Card>

      {/* Sectors */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Sectors</CardTitle>
        </CardHeader>
        <CardContent>
          <BarDistribution data={sectors} total={total} label="Sector" />
        </CardContent>
      </Card>
    </div>
  );
}
