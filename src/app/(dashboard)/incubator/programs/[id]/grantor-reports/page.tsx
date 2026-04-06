"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, X, FileText, ChevronDown, ChevronUp, Calendar, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AggregatedData {
  totalStartups: number; activeStartups: number; graduatedStartups: number;
  totalRevenue: number; totalEmployees: number; totalFunding: number;
  totalIPsFiled: number; totalIPsGranted: number; totalJobsCreated: number;
  totalEvents: number; womenLedStartups: number; scStStartups: number;
  ruralStartups: number; reportingRate: number;
  sectors: Record<string, number>; stages: Record<string, number>;
}

interface GrantorReport {
  id: string; name: string; grantor: string; period: string;
  data: AggregatedData; generatedAt: string;
}

const DATA_LABELS: Record<string, string> = {
  totalStartups: "Total Startups", activeStartups: "Active Startups",
  graduatedStartups: "Graduated", totalRevenue: "Total Revenue",
  totalEmployees: "Total Employees", totalFunding: "Total Funding",
  totalIPsFiled: "IPs Filed", totalIPsGranted: "IPs Granted",
  totalJobsCreated: "Jobs Created", totalEvents: "Events Conducted",
  womenLedStartups: "Women-Led", scStStartups: "SC/ST",
  ruralStartups: "Rural", reportingRate: "Reporting Rate (%)",
};
const CURRENCY_FIELDS = new Set(["totalRevenue", "totalFunding"]);

export default function ProgramGrantorReportsPage() {
  const { id: programId } = useParams<{ id: string }>();
  const [reports, setReports] = useState<GrantorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reportName, setReportName] = useState("");
  const [reportGrantor, setReportGrantor] = useState("");
  const [reportPeriod, setReportPeriod] = useState("");

  useEffect(() => { fetchData(); }, [programId]);

  async function fetchData() {
    const res = await fetch("/api/grantor-reports");
    if (res.ok) {
      const data = await res.json();
      setReports(data.grantorReports || []);
    }
    setLoading(false);
  }

  async function generate() {
    if (!reportName || !reportGrantor || !reportPeriod) return;
    setGenerating(true);
    const res = await fetch("/api/grantor-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: reportName, grantor: reportGrantor, period: reportPeriod }),
    });
    if (res.ok) { setShowForm(false); setReportName(""); setReportGrantor(""); setReportPeriod(""); fetchData(); }
    setGenerating(false);
  }

  function fmtVal(key: string, value: unknown): string {
    if (CURRENCY_FIELDS.has(key)) return formatCurrency(value as number);
    if (typeof value === "number") return value.toLocaleString("en-IN");
    return String(value);
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grantor Reports</h1>
          <p className="text-sm text-gray-500">Generate aggregate reports for this program&apos;s grantors</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Zap className="mr-2 h-4 w-4" /> Generate Report</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Generate Grantor Report</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Name *" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="e.g. AIM Q1 2026" />
              <Input label="Grantor *" value={reportGrantor} onChange={(e) => setReportGrantor(e.target.value)} placeholder="e.g. AIM" />
              <Input label="Period *" value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} placeholder="e.g. Q1 2026" />
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={generate} disabled={generating || !reportName || !reportGrantor || !reportPeriod}>
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {reports.length === 0 && !showForm ? (
        <Card><CardContent className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No reports generated yet</h3>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const isExpanded = expandedId === report.id;
            return (
              <Card key={report.id}>
                <CardHeader className="cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : report.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <CardTitle className="text-base">{report.name}</CardTitle>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge>{report.grantor}</Badge>
                          <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar className="h-3 w-3" />{report.period}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a href={`/api/grantor-reports/pdf?id=${report.id}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                        <Download className="h-3 w-3" /> PDF
                      </a>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="border-t pt-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {Object.entries(DATA_LABELS).map(([key, label]) => (
                        <div key={key} className="rounded-lg border bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="mt-1 text-lg font-semibold">{fmtVal(key, report.data[key as keyof AggregatedData])}</p>
                        </div>
                      ))}
                    </div>
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
