"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Check, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";

interface Report {
  id: string;
  month: number;
  year: number;
  status: string;
  data: Record<string, unknown>;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function StartupReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => { fetchReports(); }, []);

  async function fetchReports() {
    const res = await fetch("/api/reports");
    if (res.ok) setReports(await res.json());
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedMonth) return;
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: selectedMonth.month,
        year: selectedMonth.year,
        templateId: "default",
        data: {
          revenue: Number(fd.get("revenue")) || 0,
          employees_full_time: Number(fd.get("employees_full_time")) || 0,
          employees_part_time: Number(fd.get("employees_part_time")) || 0,
          customers: Number(fd.get("customers")) || 0,
          funding_raised: Number(fd.get("funding_raised")) || 0,
          key_achievements: fd.get("key_achievements") || "",
          challenges: fd.get("challenges") || "",
          support_needed: fd.get("support_needed") || "",
          product_updates: fd.get("product_updates") || "",
          partnerships: fd.get("partnerships") || "",
        },
      }),
    });

    setSelectedMonth(null);
    setSubmitting(false);
    fetchReports();
  }

  // Build last 12 months list
  const months: { month: number; year: number; label: string; report: Report | null; isPast: boolean }[] = [];
  for (let i = 0; i < 12; i++) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m <= 0) { m += 12; y -= 1; }
    const report = reports.find(r => r.month === m && r.year === y) || null;
    const isPast = i > 0 || now.getDate() >= 25; // current month only after 25th
    months.push({ month: m, year: y, label: `${MONTH_NAMES[m - 1]} ${y}`, report, isPast });
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  // ─── Filing form for a specific month ───
  if (selectedMonth) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedMonth(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to Reports
        </button>
        <Card>
          <CardHeader>
            <CardTitle>{MONTH_NAMES[selectedMonth.month - 1]} {selectedMonth.year} Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Monthly Revenue (₹)" name="revenue" type="number" placeholder="0" />
                <Input label="Customers / Users" name="customers" type="number" placeholder="0" />
                <Input label="Full-time Employees" name="employees_full_time" type="number" placeholder="0" />
                <Input label="Part-time / Contract" name="employees_part_time" type="number" placeholder="0" />
                <Input label="Funding Raised this Month (₹)" name="funding_raised" type="number" placeholder="0" />
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Key Achievements</label>
                  <textarea name="key_achievements" rows={3} placeholder="What did you accomplish?" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Challenges</label>
                  <textarea name="challenges" rows={3} placeholder="What challenges are you facing?" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Support Needed</label>
                  <textarea name="support_needed" rows={2} placeholder="What help do you need from your incubator?" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Updates</label>
                  <textarea name="product_updates" rows={2} placeholder="Product progress this month" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Partnerships</label>
                  <textarea name="partnerships" rows={2} placeholder="New partnerships or collaborations" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none" /></div>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : `Submit ${MONTH_NAMES[selectedMonth.month - 1]} Report`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Month history view ───
  const pending = months.filter(m => !m.report && m.isPast);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monthly Reports</h1>
        <p className="text-sm text-gray-500">
          {pending.length > 0 ? `${pending.length} pending report(s)` : "All reports up to date"}
        </p>
      </div>

      {/* Pending reports banner */}
      {pending.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              You have {pending.length} pending report(s):
            </p>
            <div className="flex flex-wrap gap-2">
              {pending.map(m => (
                <Button key={`${m.month}-${m.year}`} size="sm" variant="outline"
                  onClick={() => setSelectedMonth({ month: m.month, year: m.year })}
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                  {m.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Month-by-month list */}
      <div className="space-y-2">
        {months.map(m => {
          const report = m.report;
          const isExpanded = report && expandedId === report.id;

          return (
            <Card key={`${m.month}-${m.year}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                      report ? "bg-green-100 text-green-700" : m.isPast ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-400"
                    }`}>
                      {MONTH_NAMES[m.month - 1].slice(0, 3)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.label}</p>
                      {report && (
                        <p className="text-xs text-gray-500">
                          Submitted {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString("en-IN") : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report ? (
                      <>
                        <Badge variant={report.status === "REVIEWED" ? "success" : report.status === "SUBMITTED" ? "default" : "secondary"}>
                          {report.status}
                        </Badge>
                        <button onClick={() => setExpandedId(isExpanded ? null : report.id)} className="text-gray-400 hover:text-gray-600">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </>
                    ) : m.isPast ? (
                      <Button size="sm" onClick={() => setSelectedMonth({ month: m.month, year: m.year })}>
                        File Report
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">Upcoming</span>
                    )}
                  </div>
                </div>

                {/* Expanded report data */}
                {isExpanded && report && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(report.data).map(([key, val]) => (
                        <div key={key} className="rounded-lg bg-gray-50 px-3 py-2">
                          <p className="text-[10px] text-gray-500">{key.replace(/_/g, " ")}</p>
                          <p className="text-sm font-medium text-gray-900">{String(val || "—")}</p>
                        </div>
                      ))}
                    </div>
                    {report.reviewNotes && (
                      <div className="mt-3 rounded-xl bg-green-50 border border-green-200 p-3">
                        <p className="text-xs font-medium text-green-700">Feedback from Incubator</p>
                        <p className="mt-1 text-sm text-green-800">{report.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
