"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown, ChevronUp, Download } from "lucide-react";
import { formatCurrency, getMonthName } from "@/lib/utils";

interface Report {
  id: string;
  month: number;
  year: number;
  status: string;
  data: Record<string, unknown>;
  submittedAt: string | null;
  reviewNotes: string | null;
  startup: { id: string; name: string };
}

export default function ProgramReportsPage() {
  const { id: programId } = useParams<{ id: string }>();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reports?programId=${programId}`)
      .then((res) => res.json())
      .then((data) => {
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [programId]);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const thisMonthReports = reports.filter((r) => r.month === currentMonth && r.year === currentYear);
  const submitted = thisMonthReports.filter((r) => r.status === "SUBMITTED").length;
  const reviewed = thisMonthReports.filter((r) => r.status === "REVIEWED").length;

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading reports...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Reports from startups in this program</p>
        </div>
        <a href={`/api/reports/export?programId=${programId}`}>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">{getMonthName(currentMonth)} {currentYear} Submitted</p>
            <p className="mt-1 text-2xl font-bold">{submitted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Pending Review</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {thisMonthReports.filter((r) => r.status === "SUBMITTED").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Reviewed</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{reviewed}</p>
          </CardContent>
        </Card>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No reports yet</h3>
            <p className="mt-2 text-sm text-gray-500">Reports will appear here once startups submit them.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const isExpanded = expandedId === report.id;
            return (
              <Card key={report.id}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{report.startup.name}</CardTitle>
                      <p className="mt-0.5 text-xs text-gray-500">{getMonthName(report.month)} {report.year}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === "REVIEWED" ? "success" : report.status === "SUBMITTED" ? "default" : "secondary"}>
                        {report.status}
                      </Badge>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && report.data && (
                  <CardContent className="border-t pt-4">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(report.data).map(([key, val]) => (
                        <div key={key} className="rounded bg-gray-50 px-3 py-2">
                          <p className="text-xs text-gray-500">{key.replace(/_/g, " ")}</p>
                          <p className="text-sm font-medium">{String(val)}</p>
                        </div>
                      ))}
                    </div>
                    {report.reviewNotes && (
                      <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3">
                        <p className="text-xs font-medium text-green-700">Review Feedback</p>
                        <p className="mt-1 text-sm text-green-800">{report.reviewNotes}</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
