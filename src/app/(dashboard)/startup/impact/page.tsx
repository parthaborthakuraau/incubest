"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, X, Loader2 } from "lucide-react";

interface SocialImpactRecord {
  id: string;
  metricName: string;
  value: number;
  unit: string;
  month: number;
  year: number;
  description: string | null;
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

export default function StartupImpactPage() {
  const [impacts, setImpacts] = useState<SocialImpactRecord[]>([]);
  const [cumulative, setCumulative] = useState<Record<string, CumulativeMetric>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const now = new Date();
  const [form, setForm] = useState({
    metricName: "",
    value: "",
    unit: "",
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
    description: "",
  });

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/social-impact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({
          metricName: "",
          value: "",
          unit: "",
          month: String(now.getMonth() + 1),
          year: String(now.getFullYear()),
          description: "",
        });
        setShowForm(false);
        setLoading(true);
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to submit impact:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Group impacts by metricName for the history table
  const grouped = impacts.reduce(
    (acc, impact) => {
      if (!acc[impact.metricName]) acc[impact.metricName] = [];
      acc[impact.metricName].push(impact);
      return acc;
    },
    {} as Record<string, SocialImpactRecord[]>
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Impact</h1>
          <p className="text-sm text-gray-500">
            Track the social capital your startup generates
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Log Impact
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      {Object.keys(cumulative).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(cumulative).map(([metricName, data]) => (
            <Card key={metricName}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {formatMetricLabel(metricName)}
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {fmt.format(data.total)}{" "}
                      <span className="text-base font-normal text-gray-500">
                        {data.unit}
                      </span>
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                    <Heart className="h-6 w-6 text-brand-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Log Impact Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Log Social Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Metric Name
                  </label>
                  <Input
                    placeholder="e.g. lives_impacted, farmers_supported"
                    value={form.metricName}
                    onChange={(e) =>
                      setForm({ ...form, metricName: e.target.value })
                    }
                    required
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Use snake_case: lives_impacted, students_trained, co2_reduced
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Value
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 150"
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: e.target.value })
                    }
                    required
                    min={0}
                    step="any"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Unit
                  </label>
                  <Input
                    placeholder="e.g. people, families, kg, tons"
                    value={form.unit}
                    onChange={(e) =>
                      setForm({ ...form, unit: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Month
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={form.month}
                      onChange={(e) =>
                        setForm({ ...form, month: e.target.value })
                      }
                    >
                      {monthNames.map((name, i) => (
                        <option key={i} value={i + 1}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Year
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={form.year}
                      onChange={(e) =>
                        setForm({ ...form, year: e.target.value })
                      }
                    >
                      {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(
                        (y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Brief context about this impact entry..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Impact Entry"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Impact History */}
      {impacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No impact logged yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Start tracking your social impact by clicking &quot;Log Impact&quot; above.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([metricName, records]) => (
          <Card key={metricName}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle>{formatMetricLabel(metricName)}</CardTitle>
                <Badge variant="secondary">
                  {fmt.format(
                    records.reduce((sum, r) => sum + r.value, 0)
                  )}{" "}
                  {records[0].unit} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="pb-3 font-medium">Period</th>
                      <th className="pb-3 font-medium">Value</th>
                      <th className="pb-3 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-100"
                      >
                        <td className="py-3">
                          {monthNames[record.month - 1]} {record.year}
                        </td>
                        <td className="py-3 font-medium">
                          {fmt.format(record.value)} {record.unit}
                        </td>
                        <td className="py-3 text-gray-500 max-w-xs truncate">
                          {record.description || "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
