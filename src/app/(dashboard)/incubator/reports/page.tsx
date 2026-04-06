"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { FileText, Download, Check, MessageSquare } from "lucide-react";
import Link from "next/link";

interface Report {
  id: string;
  month: number;
  year: number;
  status: string;
  data: Record<string, unknown>;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  startupId: string;
  startup: { name: string; slug: string; cohort?: { name: string } };
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function IncubatorReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    const res = await fetch("/api/reports");
    if (res.ok) {
      setReports(await res.json());
    }
    setLoading(false);
  }

  async function handleReview(reportId: string) {
    setSaving(true);
    const res = await fetch("/api/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId,
        status: "REVIEWED",
        reviewNotes: reviewNotes || null,
      }),
    });
    if (res.ok) {
      setReviewingId(null);
      setReviewNotes("");
      fetchReports();
    }
    setSaving(false);
  }

  // Group by month/year
  const grouped = reports.reduce(
    (acc, report) => {
      const key = `${report.year}-${report.month}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(report);
      return acc;
    },
    {} as Record<string, Report[]>
  );

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentMonthReports = reports.filter(
    (r) => r.month === currentMonth && r.year === currentYear
  );
  const submittedCount = currentMonthReports.length;
  const reviewedCount = currentMonthReports.filter(
    (r) => r.status === "REVIEWED"
  ).length;
  const pendingReview = currentMonthReports.filter(
    (r) => r.status === "SUBMITTED"
  ).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">
            Review and manage startup reports
          </p>
        </div>
        <a href="/api/reports/export">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </a>
      </div>

      {/* Current month status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">
              {monthNames[currentMonth - 1]} {currentYear} Submitted
            </p>
            <p className="mt-1 text-2xl font-bold">{submittedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Pending Review</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {pendingReview}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Reviewed</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {reviewedCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports by month */}
      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No reports yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Reports will appear here once startups submit them.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([key, monthReports]) => {
          const [year, month] = key.split("-").map(Number);
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle>
                  {monthNames[month - 1]} {year}
                  <Badge variant="secondary" className="ml-2">
                    {monthReports.length} reports
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthReports.map((report) => (
                    <details
                      key={report.id}
                      className="rounded-lg border border-gray-100"
                    >
                      <summary className="flex cursor-pointer items-center justify-between p-3">
                        <div>
                          <Link
                            href={`/incubator/startups/${report.startupId}`}
                            className="text-sm font-medium text-brand-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {report.startup.name}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              report.status === "REVIEWED"
                                ? "success"
                                : report.status === "SUBMITTED"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {report.status}
                          </Badge>
                          {report.submittedAt && (
                            <span className="text-xs text-gray-400">
                              {new Date(report.submittedAt).toLocaleDateString("en-IN")}
                            </span>
                          )}
                        </div>
                      </summary>
                      <div className="border-t border-gray-100 p-3">
                        {/* Report data */}
                        <div className="grid gap-3 md:grid-cols-2">
                          {Object.entries(report.data).map(([k, v]) => (
                            <div key={k}>
                              <p className="text-xs text-gray-500">
                                {k
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </p>
                              <p className="text-sm font-medium whitespace-pre-wrap">
                                {typeof v === "number"
                                  ? v.toLocaleString("en-IN")
                                  : String(v || "—")}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Review notes (if already reviewed) */}
                        {report.reviewNotes && (
                          <div className="mt-4 rounded-lg bg-green-50 p-3">
                            <p className="text-xs font-medium text-green-700">
                              Review Feedback
                            </p>
                            <p className="mt-1 text-sm text-green-800 whitespace-pre-wrap">
                              {report.reviewNotes}
                            </p>
                            {report.reviewedAt && (
                              <p className="mt-1 text-xs text-green-600">
                                Reviewed on{" "}
                                {new Date(report.reviewedAt).toLocaleDateString("en-IN")}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Review actions */}
                        {report.status === "SUBMITTED" && (
                          <div className="mt-4">
                            {reviewingId === report.id ? (
                              <div className="space-y-3">
                                <textarea
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  rows={3}
                                  placeholder="Add feedback for the startup (optional)..."
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleReview(report.id)}
                                    disabled={saving}
                                  >
                                    <Check className="mr-1 h-3 w-3" />
                                    {saving
                                      ? "Saving..."
                                      : "Mark as Reviewed"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setReviewingId(null);
                                      setReviewNotes("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReviewingId(report.id)}
                              >
                                <MessageSquare className="mr-1 h-3 w-3" />
                                Review & Give Feedback
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
