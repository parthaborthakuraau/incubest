"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, UserCheck, UserPlus, Loader2, Check } from "lucide-react";

interface JobCategory {
  id: string;
  name: string;
  type: "direct" | "indirect";
  description: string | null;
}

interface JobRecord {
  id: string;
  count: number;
  month: number;
  year: number;
  description: string | null;
  category: {
    id: string;
    name: string;
    type: string;
  };
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function StartupJobsPage() {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [records, setRecords] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    Promise.all([
      fetch("/api/jobs/categories").then((r) => r.json()),
      fetch("/api/jobs").then((r) => r.json()),
    ]).then(([cats, recs]) => {
      setCategories(cats);
      setRecords(recs);

      // Pre-fill current month values
      const existing: Record<string, number> = {};
      for (const rec of recs) {
        if (rec.month === currentMonth && rec.year === currentYear) {
          existing[rec.category.id] = rec.count;
        }
      }
      setCounts(existing);
      setLoading(false);
    });
  }, [currentMonth, currentYear]);

  const directCategories = categories.filter((c) => c.type === "direct");
  const indirectCategories = categories.filter((c) => c.type === "indirect");

  const totalDirect = records.reduce(
    (sum, r) => (r.category.type === "direct" ? sum + r.count : sum),
    0
  );
  const totalIndirect = records.reduce(
    (sum, r) => (r.category.type === "indirect" ? sum + r.count : sum),
    0
  );
  const totalJobs = totalDirect + totalIndirect;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const promises = categories.map((cat) => {
        const count = counts[cat.id] ?? 0;
        return fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: cat.id,
            count,
            month: currentMonth,
            year: currentYear,
          }),
        });
      });

      await Promise.all(promises);

      // Refresh records
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setRecords(data);

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Failed to save job records:", error);
    } finally {
      setSubmitting(false);
    }
  }

  // Group history records by month/year (exclude current month)
  const historyRecords = records.filter(
    (r) => !(r.month === currentMonth && r.year === currentYear)
  );
  const grouped = historyRecords.reduce(
    (acc, rec) => {
      const key = `${rec.year}-${rec.month}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(rec);
      return acc;
    },
    {} as Record<string, JobRecord[]>
  );
  const sortedPeriods = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jobs Created</h1>
        <p className="text-sm text-gray-500">
          Track direct and indirect employment impact
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Direct Jobs"
          value={totalDirect}
          icon={UserCheck}
        />
        <StatCard
          title="Total Indirect Jobs"
          value={totalIndirect}
          icon={UserPlus}
        />
        <StatCard title="Total Jobs" value={totalJobs} icon={Users} />
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No job categories configured
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Your incubator has not set up job categories yet. Please contact
              your incubator admin.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {monthNames[currentMonth - 1]} {currentYear} - Job Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {directCategories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Badge variant="default">Direct</Badge>
                    Employment
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {directCategories.map((cat) => (
                      <div key={cat.id} className="space-y-1">
                        <label
                          htmlFor={cat.id}
                          className="text-sm font-medium text-gray-700"
                        >
                          {cat.name}
                        </label>
                        {cat.description && (
                          <p className="text-xs text-gray-400">
                            {cat.description}
                          </p>
                        )}
                        <Input
                          id={cat.id}
                          type="number"
                          min={0}
                          placeholder="0"
                          value={counts[cat.id] ?? ""}
                          onChange={(e) =>
                            setCounts((prev) => ({
                              ...prev,
                              [cat.id]: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {indirectCategories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Badge variant="secondary">Indirect</Badge>
                    Employment
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {indirectCategories.map((cat) => (
                      <div key={cat.id} className="space-y-1">
                        <label
                          htmlFor={cat.id}
                          className="text-sm font-medium text-gray-700"
                        >
                          {cat.name}
                        </label>
                        {cat.description && (
                          <p className="text-xs text-gray-400">
                            {cat.description}
                          </p>
                        )}
                        <Input
                          id={cat.id}
                          type="number"
                          min={0}
                          placeholder="0"
                          value={counts[cat.id] ?? ""}
                          onChange={(e) =>
                            setCounts((prev) => ({
                              ...prev,
                              [cat.id]: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : submitted ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Saved
                  </>
                ) : (
                  "Save Job Numbers"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {sortedPeriods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 font-medium">Period</th>
                    {categories.map((cat) => (
                      <th key={cat.id} className="pb-3 font-medium">
                        <div className="flex flex-col gap-1">
                          <span>{cat.name}</span>
                          <Badge
                            variant={
                              cat.type === "direct" ? "default" : "secondary"
                            }
                            className="w-fit text-xs"
                          >
                            {cat.type}
                          </Badge>
                        </div>
                      </th>
                    ))}
                    <th className="pb-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPeriods.map((period) => {
                    const periodRecords = grouped[period];
                    const [yearStr, monthStr] = period.split("-");
                    const total = periodRecords.reduce(
                      (sum, r) => sum + r.count,
                      0
                    );
                    return (
                      <tr key={period} className="border-b border-gray-100">
                        <td className="py-3 font-medium">
                          {monthNames[parseInt(monthStr) - 1]}{" "}
                          {yearStr}
                        </td>
                        {categories.map((cat) => {
                          const rec = periodRecords.find(
                            (r) => r.category.id === cat.id
                          );
                          return (
                            <td key={cat.id} className="py-3">
                              {rec ? rec.count : 0}
                            </td>
                          );
                        })}
                        <td className="py-3 font-semibold">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
