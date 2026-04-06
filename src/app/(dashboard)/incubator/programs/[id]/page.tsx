"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard, Users, Building2, IndianRupee, FileText,
  Target, TrendingUp, Download, Search, ArrowUpDown,
  CheckCircle2, AlertTriangle, Clock, Phone, Mail,
  Heart, Shield, TreePine, Lightbulb, Send,
  ChevronDown, ChevronUp, Plus, Trash2, Settings, Upload, Copy, Check,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, getMonthName } from "@/lib/utils";
import { FOCUS_AREAS, ALL_FOCUS_AREAS } from "@/lib/focus-areas";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Types ──────────────────────────────────────────────

interface VerticalData {
  id: string; name: string; description: string | null; logo: string | null; isActive: boolean;
  cohorts: { id: string; name: string; isActive: boolean; _count: { startups: number } }[];
}

interface CohortData {
  id: string; name: string; isActive: boolean;
  _count: { startups: number };
  vertical: { id: string; name: string } | null;
}

interface StartupData {
  id: string; name: string; slug: string; sector: string; stage: string;
  city: string | null; state: string | null;
  revenue: number; funding: number; employeesCount: number; customersCount: number;
  dpiitRecognized: boolean; isWomenLed: boolean; isRural: boolean;
  founderGender: string | null; founderCategory: string | null;
  alumniStatus: string; ipCount: number;
  cohort: { id: string; name: string };
  founders: { id: string; name: string; email: string; phone: string | null }[];
  _count: { reports: number; milestones: number; jobRecords: number; socialImpacts: number };
  createdAt: string;
}

interface FounderData {
  id: string; name: string; email: string; phone: string | null;
  startupId: string; startupName: string; cohortName: string;
  sector: string; stage: string;
}

interface FundData {
  id: string; name: string; amount: number; status: string;
  disbursedAt: string | null; utilizedAt: string | null; notes: string | null;
  startup: { id: string; name: string };
}

interface ReportData {
  id: string; month: number; year: number; status: string;
  data: Record<string, unknown>; submittedAt: string | null;
  reviewNotes: string | null; reviewedAt: string | null;
  startup: { id: string; name: string };
}

interface MilestoneData {
  id: string; status: string; notes: string | null; dueDate: string | null;
  template: { name: string };
  startup: { id: string; name: string };
}

interface OverviewData {
  totalStartups: number; activeCohorts: number; totalRevenue: number;
  totalFunding: number; totalEmployees: number; totalCustomers: number;
  reportingRate: number; reportedCount: number;
  milestoneCompleted: number; milestoneTotal: number;
  totalDisbursed: number; totalUtilized: number;
  womenLed: number; scSt: number; rural: number;
  sectors: Record<string, number>; stages: Record<string, number>;
  totalIPs: number; totalIPsGranted: number; events: number;
}

interface ProgramData {
  id: string; name: string; type: string; grantor: string | null;
  description: string | null; reportingCycle: string; totalFundPool: number;
  focusAreas: string[];
}

interface WorkspaceData {
  program: ProgramData;
  overview: OverviewData;
  cohorts: CohortData[];
  verticals: VerticalData[];
  startups: StartupData[];
  founders: FounderData[];
  funds: FundData[];
  reports: ReportData[];
  milestones: MilestoneData[];
  currentMonth: number;
  currentYear: number;
}

// ─── Tab definitions ────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "cohorts", label: "Cohorts", icon: Users },
  { id: "startups", label: "Startups", icon: Building2 },
  { id: "founders", label: "Founders", icon: Users },
  { id: "financials", label: "Financials", icon: IndianRupee },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "mentors", label: "Mentors", icon: Users },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "export", label: "Export", icon: Download },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Main Component ─────────────────────────────────────

export default function ProgramWorkspace() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  function refetch() {
    fetch(`/api/programs/${id}/workspace`)
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { refetch(); }, [id]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading workspace...</p></div>;
  }

  if (!data?.program) {
    return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Program not found</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.program.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{data.program.type.replace(/_/g, " ")}</Badge>
            {data.program.grantor && <Badge variant="outline">{data.program.grantor}</Badge>}
            <Badge variant="outline">{data.program.reportingCycle}</Badge>
            {data.program.focusAreas?.map((a) => (
              <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("settings" as TabId)}
          className="text-gray-500 hover:text-gray-700"
        >
          <Settings className="h-4 w-4 mr-1" /> Settings
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <OverviewTab data={data} />}
      {activeTab === "cohorts" && <CohortsTab programId={id} verticals={data.verticals} cohorts={data.cohorts} programFocusAreas={data.program.focusAreas || []} onRefresh={refetch} />}
      {(activeTab as string) === "settings" && <ProgramSettingsTab programId={id} program={data.program} verticals={data.verticals} onRefresh={refetch} />}
      {activeTab === "startups" && <StartupsTab startups={data.startups} cohorts={data.cohorts} />}
      {activeTab === "founders" && <FoundersTab founders={data.founders} />}
      {activeTab === "financials" && <FinancialsTab program={data.program} funds={data.funds} overview={data.overview} />}
      {activeTab === "reports" && <ReportsTab reports={data.reports} startups={data.startups} overview={data.overview} currentMonth={data.currentMonth} currentYear={data.currentYear} />}
      {activeTab === "mentors" && <MentorsTab programId={id} />}
      {activeTab === "analytics" && <AnalyticsTab reports={data.reports} startups={data.startups} overview={data.overview} />}
      {activeTab === "export" && <ExportTab programId={id} startups={data.startups} reports={data.reports} founders={data.founders} funds={data.funds} />}
    </div>
  );
}

// ─── COHORTS TAB ────────────────────────────────────────

interface CohortStartup {
  id: string; name: string; slug: string; sector: string; stage: string;
  onboardingStatus: string; city: string | null; state: string | null;
  passportFlags: { signal: string; strength: string; matchedStartup: string; matchedOrg: string; details: string }[] | null;
  founders: { id: string; name: string; email: string; phone: string | null }[];
  createdAt: string;
}

function CohortsTab({ programId, verticals, cohorts, programFocusAreas, onRefresh }: {
  programId: string; verticals: VerticalData[]; cohorts: CohortData[]; programFocusAreas: string[]; onRefresh: () => void;
}) {
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [showCohortForm, setShowCohortForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterVertical, setFilterVertical] = useState("");

  // Cohort detail state
  const [cohortStartups, setCohortStartups] = useState<CohortStartup[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingStartups, setLoadingStartups] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [selectedStartupIds, setSelectedStartupIds] = useState<string[]>([]);
  const [inviteResults, setInviteResults] = useState<{ startupName: string; inviteUrl: string }[] | null>(null);
  const [inviting, setInviting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvResults, setCsvResults] = useState<{ created: number; errors: number } | null>(null);

  const filtered = filterVertical
    ? cohorts.filter((c) => c.vertical?.id === filterVertical)
    : cohorts;

  useEffect(() => {
    if (selectedCohort) fetchCohortStartups(selectedCohort);
  }, [selectedCohort]);

  async function fetchCohortStartups(cohortId: string) {
    setLoadingStartups(true);
    const res = await fetch(`/api/cohorts/${cohortId}/startups`);
    if (res.ok) setCohortStartups(await res.json());
    setLoadingStartups(false);
  }

  async function createCohort(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/cohorts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"), description: fd.get("description"),
        year: fd.get("year"), startDate: fd.get("startDate"),
        endDate: fd.get("endDate") || null, programId,
        verticalId: fd.get("verticalId") || null,
      }),
    });
    setShowCohortForm(false);
    setSubmitting(false);
    onRefresh();
  }

  async function addStartup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/cohorts/${selectedCohort}/startups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startupName: fd.get("startupName"), founderName: fd.get("founderName"),
        founderEmail: fd.get("founderEmail"), sector: fd.get("sector") || undefined,
        focusArea: fd.get("focusArea") || undefined,
        city: fd.get("city") || undefined, state: fd.get("state") || undefined,
      }),
    });
    if (res.ok) { setShowAddForm(false); fetchCohortStartups(selectedCohort!); onRefresh(); }
    else { const err = await res.json(); alert(err.error); }
    setSubmitting(false);
  }

  async function handleCSVUpload() {
    if (!csvFile || !selectedCohort) return;
    setSubmitting(true);
    const text = await csvFile.text();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) { alert("CSV must have a header row and at least one data row"); setSubmitting(false); return; }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z_]/g, ""));
    const rows = lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = vals[i] || ""; });
      return {
        startupName: row.startup_name || row.startupname || row.name || "",
        founderName: row.founder_name || row.foundername || row.founder || "",
        founderEmail: row.founder_email || row.founderemail || row.email || "",
        sector: row.sector || "",
        stage: row.stage || "",
        city: row.city || "",
        state: row.state || "",
      };
    });

    const res = await fetch(`/api/cohorts/${selectedCohort}/startups/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    if (res.ok) {
      const data = await res.json();
      setCsvResults({ created: data.created, errors: data.errors });
      fetchCohortStartups(selectedCohort!);
      onRefresh();
    }
    setCsvFile(null);
    setShowCSVUpload(false);
    setSubmitting(false);
  }

  function toggleSelect(id: string) {
    setSelectedStartupIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function selectAllDraft() {
    setSelectedStartupIds(cohortStartups.filter((s) => s.onboardingStatus === "DRAFT").map((s) => s.id));
  }

  async function inviteSelected() {
    if (!selectedCohort) return;
    setInviting(true);
    const ids = selectedStartupIds.length > 0 ? selectedStartupIds : undefined;
    const res = await fetch(`/api/cohorts/${selectedCohort}/startups/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startupIds: ids }),
    });
    if (res.ok) {
      const data = await res.json();
      setInviteResults(data.results);
      setSelectedStartupIds([]);
      fetchCohortStartups(selectedCohort!);
      onRefresh();
    }
    setInviting(false);
  }

  const STATUS_COLORS: Record<string, "secondary" | "warning" | "success"> = { DRAFT: "secondary", INVITED: "warning", JOINED: "success" };

  // ─── Cohort Detail View ─────────────────────────────
  if (selectedCohort) {
    const cohort = cohorts.find((c) => c.id === selectedCohort);
    const draftCount = cohortStartups.filter((s) => s.onboardingStatus === "DRAFT").length;

    return (
      <div className="space-y-4">
        <button onClick={() => { setSelectedCohort(null); setInviteResults(null); setCsvResults(null); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowUpDown className="h-3 w-3 rotate-90" /> Back to Cohorts
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{cohort?.name || "Cohort"}</h2>
            {cohort?.vertical && <Badge variant="outline" className="mt-1">{cohort.vertical.name}</Badge>}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="mr-1 h-3 w-3" /> Add Startup
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowCSVUpload(!showCSVUpload)}>
              <Upload className="mr-1 h-3 w-3" /> Upload CSV
            </Button>
            {draftCount > 0 && (
              <Button size="sm" onClick={() => { selectAllDraft(); }} variant="outline">
                Select All Draft ({draftCount})
              </Button>
            )}
            {selectedStartupIds.length > 0 && (
              <Button size="sm" onClick={inviteSelected} disabled={inviting}>
                {inviting ? "Inviting..." : `Invite ${selectedStartupIds.length} Startup(s)`}
              </Button>
            )}
          </div>
        </div>

        {/* Invite results */}
        {inviteResults && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-green-800">{inviteResults.length} invite(s) generated!</p>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {inviteResults.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span>{r.startupName}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(r.inviteUrl); }}
                      className="flex items-center gap-1 text-green-700 hover:text-green-900"
                    >
                      <Copy className="h-3 w-3" /> Copy Link
                    </button>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => setInviteResults(null)}>Dismiss</Button>
            </CardContent>
          </Card>
        )}

        {/* CSV results */}
        {csvResults && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800">
                CSV Import: <strong>{csvResults.created}</strong> created, <strong>{csvResults.errors}</strong> errors
              </p>
              <Button size="sm" variant="ghost" className="mt-1" onClick={() => setCsvResults(null)}>Dismiss</Button>
            </CardContent>
          </Card>
        )}

        {/* Add single startup form */}
        {showAddForm && (
          <Card className="border-brand-200">
            <CardContent className="p-4">
              <form onSubmit={addStartup} className="space-y-3">
                <p className="text-sm font-medium">Add Startup</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input label="Startup Name *" name="startupName" required />
                  <Input label="Founder Name *" name="founderName" required />
                  <Input label="Founder Email *" name="founderEmail" type="email" required />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Sector</label>
                    <select name="sector" className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
                      <option value="">Select</option>
                      {["AGRITECH","EDTECH","FINTECH","HEALTHTECH","FOODTECH","CLEANTECH","DEEPTECH","SAAS","ECOMMERCE","AI_ML","IOT","BIOTECH","OTHER"].map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Focus Area</label>
                    <select name="focusArea" className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
                      <option value="">Select</option>
                      {programFocusAreas.length > 0
                        ? programFocusAreas.map((a) => <option key={a} value={a}>{a}</option>)
                        : ALL_FOCUS_AREAS.map((a) => <option key={a} value={a}>{a}</option>)
                      }
                    </select>
                  </div>
                  <Input label="City" name="city" />
                  <Input label="State" name="state" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={submitting}>{submitting ? "Adding..." : "Add"}</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* CSV upload */}
        {showCSVUpload && (
          <Card className="border-brand-200">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium">Upload CSV</p>
              <p className="text-xs text-gray-500">
                CSV columns: <code>startup_name, founder_name, founder_email</code> (required), <code>sector, stage, city, state</code> (optional)
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCSVUpload} disabled={!csvFile || submitting}>
                  {submitting ? "Uploading..." : "Import"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowCSVUpload(false); setCsvFile(null); }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Startup table */}
        {loadingStartups ? (
          <p className="py-8 text-center text-gray-500">Loading startups...</p>
        ) : cohortStartups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No startups yet</h3>
              <p className="mt-2 text-sm text-gray-500">Add startups individually or upload a CSV.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-gray-500">
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedStartupIds.length === cohortStartups.filter((s) => s.onboardingStatus === "DRAFT").length && selectedStartupIds.length > 0}
                          onChange={() => selectedStartupIds.length > 0 ? setSelectedStartupIds([]) : selectAllDraft()}
                        />
                      </th>
                      <th className="px-4 py-3 font-medium">Startup</th>
                      <th className="px-4 py-3 font-medium">Founder</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Sector</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Join Link</th>
                      <th className="px-4 py-3 font-medium w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortStartups.map((s) => {
                      const joinUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${s.id}`;
                      const hasFlags = s.passportFlags && s.passportFlags.length > 0;
                      return (
                      <tr key={s.id} className={`border-b border-gray-100 hover:bg-gray-50 ${hasFlags ? "bg-yellow-50/50" : ""}`}>
                        <td className="px-4 py-3">
                          {s.onboardingStatus === "DRAFT" && (
                            <input
                              type="checkbox"
                              checked={selectedStartupIds.includes(s.id)}
                              onChange={() => toggleSelect(s.id)}
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <Link href={`/incubator/startups/${s.id}`} className="text-gray-900 hover:text-blue-600 hover:underline">
                            {s.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{s.founders[0]?.name || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{s.founders[0]?.email || "—"}</td>
                        <td className="px-4 py-3 text-xs">{s.sector.replace(/_/g, " ")}</td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_COLORS[s.onboardingStatus]}>
                            {s.onboardingStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { navigator.clipboard.writeText(joinUrl); setCopiedId(s.id); setTimeout(() => setCopiedId(null), 2000); }}
                            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-all ${copiedId === s.id ? "border-green-300 bg-green-50 text-green-700" : "text-gray-500 hover:bg-gray-100"}`}
                            title={joinUrl}
                          >
                            {copiedId === s.id ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {hasFlags && (
                            <span
                              className="cursor-pointer text-yellow-600"
                              title={s.passportFlags!.map((f) => f.details).join("\n")}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </span>
                          )}
                        </td>
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

  // ─── Cohorts List View ──────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {verticals.length > 0 && (
            <select value={filterVertical} onChange={(e) => setFilterVertical(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">All Verticals</option>
              {verticals.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          )}
          <Badge variant="outline">{filtered.length} cohorts</Badge>
        </div>
        <Button onClick={() => setShowCohortForm(!showCohortForm)}>
          {showCohortForm ? <><Trash2 className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> New Cohort</>}
        </Button>
      </div>

      {showCohortForm && (
        <Card className="border-brand-200">
          <CardContent className="p-4">
            <form onSubmit={createCohort} className="space-y-3">
              <p className="text-sm font-medium">New Cohort</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Name *" name="name" placeholder="e.g. Batch 2 - 2026" required />
                <Input label="Year" name="year" type="number" placeholder="2026" />
              </div>
              {verticals.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Vertical</label>
                  <select name="verticalId" className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="">None</option>
                    {verticals.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              )}
              <Input label="Description" name="description" placeholder="Optional" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Start Date *" name="startDate" type="date" required />
                <Input label="End Date" name="endDate" type="date" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={submitting}>{submitting ? "Creating..." : "Create"}</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowCohortForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 && !showCohortForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No cohorts yet</h3>
            <p className="mt-2 text-sm text-gray-500">Create your first cohort to start adding startups.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer transition-all hover:shadow-md hover:border-brand-200"
              onClick={() => setSelectedCohort(c.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{c.name}</h3>
                  <Badge variant={c.isActive ? "success" : "secondary"}>{c.isActive ? "Active" : "Completed"}</Badge>
                </div>
                {c.vertical && <Badge variant="outline" className="mt-1">{c.vertical.name}</Badge>}
                <p className="mt-2 text-sm text-gray-500">{c._count.startups} startups</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PROGRAM SETTINGS TAB ───────────────────────────────

function ProgramSettingsTab({ programId, program, verticals, onRefresh }: {
  programId: string; program: ProgramData; verticals: VerticalData[]; onRefresh: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showVerticalForm, setShowVerticalForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(program.focusAreas || []);
  const [customArea, setCustomArea] = useState("");
  const [showAreaPicker, setShowAreaPicker] = useState(false);

  function toggleArea(area: string) {
    setSelectedAreas((prev) => prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]);
  }

  function addCustomArea() {
    if (customArea.trim() && !selectedAreas.includes(customArea.trim())) {
      setSelectedAreas([...selectedAreas, customArea.trim()]);
      setCustomArea("");
    }
  }

  async function saveProgram(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/programs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: programId,
        name: fd.get("name"),
        grantor: fd.get("grantor"),
        description: fd.get("description"),
        reportingCycle: fd.get("reportingCycle"),
        totalFundPool: fd.get("totalFundPool") ? parseFloat(fd.get("totalFundPool") as string) : undefined,
        focusAreas: selectedAreas,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onRefresh();
  }

  async function createVertical(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/verticals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), description: fd.get("description"), programId }),
    });
    setShowVerticalForm(false);
    setSubmitting(false);
    onRefresh();
  }

  async function deleteVertical(id: string) {
    if (!confirm("Delete this vertical?")) return;
    await fetch(`/api/verticals?id=${id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div className="space-y-6">
      {/* Program details */}
      <Card>
        <CardHeader><CardTitle>Program Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={saveProgram} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Program Name" name="name" defaultValue={program.name} required />
              <Input label="Grantor" name="grantor" defaultValue={program.grantor || ""} placeholder="e.g. AIM, RKVY" />
            </div>
            <Input label="Description" name="description" defaultValue={program.description || ""} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Reporting Cycle</label>
                <select name="reportingCycle" defaultValue={program.reportingCycle} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUAL">Annual</option>
                </select>
              </div>
              <Input label="Total Fund Pool (INR)" name="totalFundPool" type="number" defaultValue={program.totalFundPool || ""} placeholder="e.g. 10000000" />
            </div>

            {/* Focus Areas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Focus Areas</label>
                <button type="button" onClick={() => setShowAreaPicker(!showAreaPicker)} className="text-xs text-blue-600 hover:underline">
                  {showAreaPicker ? "Close picker" : "Browse areas"}
                </button>
              </div>
              {/* Selected tags */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedAreas.map((area) => (
                  <span key={area} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {area}
                    <button type="button" onClick={() => toggleArea(area)} className="text-gray-400 hover:text-red-500">×</button>
                  </span>
                ))}
                {selectedAreas.length === 0 && <span className="text-xs text-gray-400">No focus areas selected</span>}
              </div>
              {/* Custom input */}
              <div className="flex gap-2 mb-2">
                <input
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomArea(); } }}
                  placeholder="Add custom area..."
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <Button type="button" size="sm" variant="outline" onClick={addCustomArea}>Add</Button>
              </div>
              {/* Predefined picker */}
              {showAreaPicker && (
                <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 space-y-3">
                  {FOCUS_AREAS.map((cat) => (
                    <div key={cat.category}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{cat.category}</p>
                      <div className="flex flex-wrap gap-1">
                        {cat.areas.map((area) => (
                          <button
                            key={area}
                            type="button"
                            onClick={() => toggleArea(area)}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                              selectedAreas.includes(area)
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              {saved && <span className="text-sm text-green-600 flex items-center gap-1"><Check className="h-4 w-4" /> Saved</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Verticals management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Verticals (Sub-Programs)</CardTitle>
          <Button size="sm" onClick={() => setShowVerticalForm(!showVerticalForm)}>
            {showVerticalForm ? "Cancel" : <><Plus className="mr-1 h-3 w-3" /> Add Vertical</>}
          </Button>
        </CardHeader>
        <CardContent>
          {showVerticalForm && (
            <form onSubmit={createVertical} className="mb-4 space-y-3 rounded-lg border border-brand-200 p-3">
              <Input label="Name" name="name" placeholder="e.g. Student Innovators" required />
              <Input label="Description" name="description" placeholder="Optional" />
              <Button type="submit" size="sm" disabled={submitting}>{submitting ? "Creating..." : "Create"}</Button>
            </form>
          )}

          {verticals.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">
              No verticals. Add verticals if this program has sub-programs (e.g. Seed, Pre-Seed, Student).
            </p>
          ) : (
            <div className="space-y-2">
              {verticals.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{v.name}</p>
                    {v.description && <p className="text-xs text-gray-500">{v.description}</p>}
                    <p className="text-xs text-gray-400">{v.cohorts.length} cohort(s)</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteVertical(v.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── OVERVIEW TAB ───────────────────────────────────────

function OverviewTab({ data }: { data: WorkspaceData }) {
  const o = data.overview;
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPI label="Startups" value={o.totalStartups} icon={Building2} />
        <KPI label="Active Cohorts" value={o.activeCohorts} icon={Users} />
        <KPI label="Revenue" value={formatCurrency(o.totalRevenue)} icon={TrendingUp} />
        <KPI label="Reporting Rate" value={`${o.reportingRate}%`} sub={`${o.reportedCount}/${o.totalStartups} this month`} icon={FileText} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPI label="Employees" value={o.totalEmployees} icon={Users} />
        <KPI label="Funding Raised" value={formatCurrency(o.totalFunding)} icon={IndianRupee} />
        <KPI label="Milestones" value={`${o.milestoneCompleted}/${o.milestoneTotal}`} icon={Target} />
        <KPI label="IPs Filed / Granted" value={`${o.totalIPs} / ${o.totalIPsGranted}`} icon={Lightbulb} />
      </div>

      {/* Diversity & Inclusion */}
      <Card>
        <CardHeader><CardTitle>Diversity & Inclusion</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Heart className="h-8 w-8 text-pink-500" />
              <div>
                <p className="text-2xl font-bold">{o.womenLed}</p>
                <p className="text-xs text-gray-500">Women-Led Startups</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Shield className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{o.scSt}</p>
                <p className="text-xs text-gray-500">SC/ST Founders</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <TreePine className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{o.rural}</p>
                <p className="text-xs text-gray-500">Rural Startups</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sector & Stage distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Sector Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(o.sectors).sort(([,a],[,b]) => b - a).map(([sector, count]) => (
                <div key={sector} className="flex items-center justify-between">
                  <span className="text-sm">{sector.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${(count / o.totalStartups) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Stage Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(o.stages).sort(([,a],[,b]) => b - a).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between">
                  <span className="text-sm">{stage.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${(count / o.totalStartups) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohorts */}
      <Card>
        <CardHeader><CardTitle>Cohorts</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.cohorts.map((c) => (
              <Link key={c.id} href={`/incubator/cohorts/${c.id}`}>
                <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">{c._count.startups} startups</p>
                  </div>
                  <Badge variant={c.isActive ? "success" : "secondary"}>
                    {c.isActive ? "Active" : "Completed"}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── STARTUPS TAB ───────────────────────────────────────

function StartupsTab({ startups, cohorts }: { startups: StartupData[]; cohorts: CohortData[] }) {
  const [search, setSearch] = useState("");
  const [filterCohort, setFilterCohort] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "revenue" | "employeesCount" | "funding">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = [...startups];
    if (search) result = result.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    if (filterCohort) result = result.filter((s) => s.cohort.id === filterCohort);
    if (filterStage) result = result.filter((s) => s.stage === filterStage);
    if (filterSector) result = result.filter((s) => s.sector === filterSector);
    result.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return mul * a.name.localeCompare(b.name);
      return mul * ((a[sortBy] as number) - (b[sortBy] as number));
    });
    return result;
  }, [startups, search, filterCohort, filterStage, filterSector, sortBy, sortDir]);

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  }

  const stages = [...new Set(startups.map((s) => s.stage))];
  const sectors = [...new Set(startups.map((s) => s.sector))];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search startups..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select value={filterCohort} onChange={(e) => setFilterCohort(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Cohorts</option>
          {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Stages</option>
          {stages.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Sectors</option>
          {sectors.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <Badge variant="outline">{filtered.length} results</Badge>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium cursor-pointer" onClick={() => toggleSort("name")}>
                    <span className="flex items-center gap-1">Startup <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-4 py-3 font-medium">Cohort</th>
                  <th className="px-4 py-3 font-medium">Stage</th>
                  <th className="px-4 py-3 font-medium">Sector</th>
                  <th className="px-4 py-3 font-medium cursor-pointer" onClick={() => toggleSort("revenue")}>
                    <span className="flex items-center gap-1">Revenue <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-4 py-3 font-medium cursor-pointer" onClick={() => toggleSort("funding")}>
                    <span className="flex items-center gap-1">Funding <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-4 py-3 font-medium cursor-pointer" onClick={() => toggleSort("employeesCount")}>
                    <span className="flex items-center gap-1">Jobs <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-4 py-3 font-medium">IPs</th>
                  <th className="px-4 py-3 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/incubator/startups/${s.id}`} className="font-medium text-brand-600 hover:underline">
                        {s.name}
                      </Link>
                      <p className="text-xs text-gray-400">
                        {s.founders.map((f) => f.name).join(", ")}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">{s.cohort.name}</td>
                    <td className="px-4 py-3"><Badge variant="secondary">{s.stage.replace(/_/g, " ")}</Badge></td>
                    <td className="px-4 py-3 text-xs">{s.sector.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(s.revenue)}</td>
                    <td className="px-4 py-3">{formatCurrency(s.funding)}</td>
                    <td className="px-4 py-3">{s.employeesCount}</td>
                    <td className="px-4 py-3">{s.ipCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {s.isWomenLed && <Badge variant="outline" className="text-[10px] px-1">W</Badge>}
                        {s.isRural && <Badge variant="outline" className="text-[10px] px-1">R</Badge>}
                        {s.dpiitRecognized && <Badge variant="outline" className="text-[10px] px-1">DPIIT</Badge>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── FOUNDERS TAB ───────────────────────────────────────

function FoundersTab({ founders }: { founders: FounderData[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return founders;
    const q = search.toLowerCase();
    return founders.filter(
      (f) => f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q) || f.startupName.toLowerCase().includes(q)
    );
  }, [founders, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search founders..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <Badge variant="outline">{filtered.length} founders</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((f) => (
          <Card key={`${f.id}-${f.startupId}`}>
            <CardContent className="p-4">
              <p className="font-semibold">{f.name}</p>
              <Link href={`/incubator/startups/${f.startupId}`} className="text-sm text-brand-600 hover:underline">
                {f.startupName}
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">{f.cohortName} &middot; {f.sector.replace(/_/g, " ")}</p>
              <div className="mt-3 space-y-1">
                <p className="flex items-center gap-2 text-xs text-gray-600">
                  <Mail className="h-3.5 w-3.5" /> {f.email}
                </p>
                {f.phone && (
                  <p className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="h-3.5 w-3.5" /> {f.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── FINANCIALS TAB ─────────────────────────────────────

function FinancialsTab({ program, funds, overview }: { program: ProgramData; funds: FundData[]; overview: OverviewData }) {
  const remaining = program.totalFundPool - overview.totalDisbursed;
  const utilizationRate = overview.totalDisbursed > 0 ? Math.round((overview.totalUtilized / overview.totalDisbursed) * 100) : 0;

  // Group funds by startup
  const byStartup: Record<string, { name: string; funds: FundData[] }> = {};
  for (const f of funds) {
    if (!byStartup[f.startup.id]) byStartup[f.startup.id] = { name: f.startup.name, funds: [] };
    byStartup[f.startup.id].funds.push(f);
  }

  return (
    <div className="space-y-6">
      {/* Fund pool overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPI label="Total Fund Pool" value={formatCurrency(program.totalFundPool)} icon={IndianRupee} />
        <KPI label="Disbursed" value={formatCurrency(overview.totalDisbursed)} icon={IndianRupee} />
        <KPI label="Utilized" value={formatCurrency(overview.totalUtilized)} icon={IndianRupee} />
        <KPI label="Remaining" value={formatCurrency(remaining > 0 ? remaining : 0)} sub={`${utilizationRate}% utilization`} icon={IndianRupee} />
      </div>

      {/* Progress bar */}
      {program.totalFundPool > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Fund Utilization</p>
              <p className="text-sm text-gray-500">{formatCurrency(overview.totalDisbursed)} / {formatCurrency(program.totalFundPool)}</p>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min((overview.totalDisbursed / program.totalFundPool) * 100, 100)}%` }}>
                <div className="h-full rounded-full bg-green-500" style={{ width: `${overview.totalDisbursed > 0 ? (overview.totalUtilized / overview.totalDisbursed) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Utilized</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Disbursed</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-200" /> Remaining</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-startup breakdown */}
      <Card>
        <CardHeader><CardTitle>Disbursements by Startup</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(byStartup).length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">No fund disbursements recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Startup</th>
                    <th className="pb-3 font-medium">Fund</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {funds.map((f) => (
                    <tr key={f.id} className="border-b border-gray-100">
                      <td className="py-3">{f.startup.name}</td>
                      <td className="py-3">{f.name}</td>
                      <td className="py-3 font-medium">{formatCurrency(f.amount)}</td>
                      <td className="py-3">
                        <Badge variant={f.status === "UTILIZED" ? "success" : f.status === "DISBURSED" ? "default" : "warning"}>
                          {f.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-xs text-gray-500">
                        {f.disbursedAt ? new Date(f.disbursedAt).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── REPORTS TAB ────────────────────────────────────────

function ReportsTab({ reports, startups, overview, currentMonth, currentYear }: {
  reports: ReportData[]; startups: StartupData[]; overview: OverviewData;
  currentMonth: number; currentYear: number;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  // Find startups that haven't reported this month
  const reportedThisMonth = new Set(
    reports.filter((r) => r.month === currentMonth && r.year === currentYear).map((r) => r.startup.id)
  );
  const notReported = startups.filter((s) => !reportedThisMonth.has(s.id));

  const filtered = filterStatus ? reports.filter((r) => r.status === filterStatus) : reports;

  return (
    <div className="space-y-6">
      {/* Compliance stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPI label="Reporting Rate" value={`${overview.reportingRate}%`} sub={`${getMonthName(currentMonth)} ${currentYear}`} icon={FileText} />
        <KPI label="Total Reports" value={reports.length} icon={FileText} />
        <KPI label="Pending Review" value={reports.filter((r) => r.status === "SUBMITTED").length} icon={Clock} />
        <KPI label="Not Reported" value={notReported.length} sub="this month" icon={AlertTriangle} />
      </div>

      {/* Not reported warning */}
      {notReported.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-4 w-4" />
              Not Reported — {getMonthName(currentMonth)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {notReported.map((s) => (
                <Link key={s.id} href={`/incubator/startups/${s.id}`}>
                  <Badge variant="warning" className="cursor-pointer">{s.name}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="DRAFT">Draft</option>
        </select>
        <Badge variant="outline">{filtered.length} reports</Badge>
      </div>

      {/* Reports list */}
      <div className="space-y-2">
        {filtered.slice(0, 50).map((r) => {
          const isExpanded = expandedId === r.id;
          return (
            <Card key={r.id}>
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : r.id)}
              >
                <div>
                  <p className="text-sm font-medium">{r.startup.name}</p>
                  <p className="text-xs text-gray-500">{getMonthName(r.month)} {r.year}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === "REVIEWED" ? "success" : r.status === "SUBMITTED" ? "default" : "secondary"}>
                    {r.status}
                  </Badge>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </div>
              {isExpanded && r.data && (
                <CardContent className="border-t pt-4">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(r.data).map(([key, val]) => (
                      <div key={key} className="rounded bg-gray-50 px-3 py-2">
                        <p className="text-xs text-gray-500">{key.replace(/_/g, " ")}</p>
                        <p className="text-sm font-medium">{String(val)}</p>
                      </div>
                    ))}
                  </div>
                  {r.reviewNotes && (
                    <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3">
                      <p className="text-xs font-medium text-green-700">Feedback</p>
                      <p className="mt-1 text-sm text-green-800">{r.reviewNotes}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── EXPORT TAB ─────────────────────────────────────────

function ExportTab({ programId, startups, reports, founders, funds }: {
  programId: string;
  startups: StartupData[]; reports: ReportData[]; founders: FounderData[]; funds: FundData[];
}) {
  function downloadCSV(filename: string, headers: string[], rows: string[][]) {
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportStartups() {
    downloadCSV("startups.csv",
      ["Name", "Cohort", "Sector", "Stage", "City", "State", "Revenue", "Funding", "Employees", "Customers", "IPs", "Women-Led", "Rural", "DPIIT", "Founders"],
      startups.map((s) => [
        s.name, s.cohort.name, s.sector, s.stage, s.city || "", s.state || "",
        String(s.revenue), String(s.funding), String(s.employeesCount), String(s.customersCount),
        String(s.ipCount), s.isWomenLed ? "Yes" : "No", s.isRural ? "Yes" : "No",
        s.dpiitRecognized ? "Yes" : "No", s.founders.map((f) => f.name).join("; "),
      ])
    );
  }

  function exportFounders() {
    downloadCSV("founders.csv",
      ["Name", "Email", "Phone", "Startup", "Cohort", "Sector", "Stage"],
      founders.map((f) => [f.name, f.email, f.phone || "", f.startupName, f.cohortName, f.sector, f.stage])
    );
  }

  function exportReports() {
    downloadCSV("reports.csv",
      ["Startup", "Month", "Year", "Status", "Submitted At"],
      reports.map((r) => [
        r.startup.name, getMonthName(r.month), String(r.year), r.status,
        r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("en-IN") : "",
      ])
    );
  }

  function exportFunds() {
    downloadCSV("funds.csv",
      ["Startup", "Fund", "Amount", "Status", "Disbursed At", "Utilized At", "Notes"],
      funds.map((f) => [
        f.startup.name, f.name, String(f.amount), f.status,
        f.disbursedAt ? new Date(f.disbursedAt).toLocaleDateString("en-IN") : "",
        f.utilizedAt ? new Date(f.utilizedAt).toLocaleDateString("en-IN") : "",
        f.notes || "",
      ])
    );
  }

  const exports = [
    { label: "Startups Data", desc: "All startups with metrics, diversity tags, founders", count: startups.length, action: exportStartups, icon: Building2 },
    { label: "Founders Directory", desc: "All founders with contact details", count: founders.length, action: exportFounders, icon: Users },
    { label: "Monthly Reports", desc: "All submitted reports with status", count: reports.length, action: exportReports, icon: FileText },
    { label: "Fund Disbursements", desc: "All fund transactions with status", count: funds.length, action: exportFunds, icon: IndianRupee },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Download program data as CSV files. You can filter and analyze in Excel/Sheets.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {exports.map((exp) => (
          <Card key={exp.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <exp.icon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="font-medium">{exp.label}</p>
                  <p className="text-xs text-gray-500">{exp.desc}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{exp.count} records</p>
                </div>
              </div>
              <Button variant="outline" onClick={exp.action}>
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PDF grantor report */}
      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium">Grantor Report (PDF)</p>
              <p className="text-xs text-gray-500">Generate a formatted PDF report for your grantor</p>
            </div>
          </div>
          <Link href={`/incubator/programs/${programId}/grantor-reports`}>
            <Button>
              <FileText className="mr-2 h-4 w-4" /> Generate
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── MENTORS TAB ────────────────────────────────────────

interface MentorAssigned {
  id: string;
  expertise: string[];
  user: { id: string; name: string; email: string; phone: string | null };
  sessions: { id: string; date: string; duration: number }[];
}

interface MentorAvailable {
  id: string;
  user: { id: string; name: string; email: string };
  expertise: string[];
}

function MentorsTab({ programId }: { programId: string }) {
  const [assigned, setAssigned] = useState<MentorAssigned[]>([]);
  const [available, setAvailable] = useState<MentorAvailable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMentors(); }, [programId]);

  async function fetchMentors() {
    const res = await fetch(`/api/programs/${programId}/mentors`);
    if (res.ok) {
      const data = await res.json();
      setAssigned(data.assigned || []);
      setAvailable(data.available || []);
    }
    setLoading(false);
  }

  async function assignMentor(mentorId: string) {
    await fetch(`/api/programs/${programId}/mentors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId }),
    });
    fetchMentors();
  }

  async function removeMentor(mentorId: string) {
    await fetch(`/api/programs/${programId}/mentors?mentorId=${mentorId}`, {
      method: "DELETE",
    });
    fetchMentors();
  }

  if (loading) return <div className="flex h-40 items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="space-y-6">
      {/* Assigned mentors */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Mentors ({assigned.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assigned.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">No mentors assigned to this program yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assigned.map((m) => {
                const totalSessions = m.sessions.length;
                const totalHours = Math.round(m.sessions.reduce((s, sess) => s + sess.duration, 0) / 60);
                return (
                  <Card key={m.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{m.user.name}</p>
                          <p className="text-xs text-gray-500">{m.user.email}</p>
                        </div>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => removeMentor(m.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                      {m.expertise.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {m.expertise.map((e) => (
                            <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex gap-4 text-xs text-gray-500">
                        <span>{totalSessions} sessions</span>
                        <span>{totalHours}h mentoring</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available to assign */}
      {available.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {available.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{m.user.name}</p>
                    <p className="text-xs text-gray-500">{m.user.email}</p>
                    {m.expertise.length > 0 && (
                      <div className="mt-1 flex gap-1">
                        {m.expertise.slice(0, 3).map((e) => (
                          <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button size="sm" onClick={() => assignMentor(m.id)}>
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {assigned.length === 0 && available.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No mentors in your incubator yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Add mentors from the <Link href="/incubator/mentors" className="text-brand-600 hover:underline">Mentors page</Link> first.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── ANALYTICS TAB ──────────────────────────────────────

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

function AnalyticsTab({ reports, startups, overview }: {
  reports: ReportData[]; startups: StartupData[]; overview: OverviewData;
}) {
  // 1. Reporting compliance by month (last 12 months)
  const reportsByMonth = useMemo(() => {
    const months: Record<string, { submitted: number; reviewed: number; total: number }> = {};
    for (const r of reports) {
      const key = `${r.year}-${String(r.month).padStart(2, "0")}`;
      if (!months[key]) months[key] = { submitted: 0, reviewed: 0, total: 0 };
      months[key].total++;
      if (r.status === "SUBMITTED") months[key].submitted++;
      if (r.status === "REVIEWED") months[key].reviewed++;
    }
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, val]) => {
        const [y, m] = key.split("-");
        return {
          month: `${getMonthName(parseInt(m)).slice(0, 3)} ${y.slice(2)}`,
          ...val,
        };
      });
  }, [reports]);

  // 2. Revenue distribution by startup (top 10)
  const revenueByStartup = useMemo(() => {
    return [...startups]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((s) => ({ name: s.name.length > 15 ? s.name.slice(0, 15) + "..." : s.name, revenue: s.revenue }));
  }, [startups]);

  // 3. Sector distribution for pie chart
  const sectorData = useMemo(() => {
    return Object.entries(overview.sectors).map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value,
    }));
  }, [overview.sectors]);

  // 4. Stage pipeline
  const stageOrder = ["IDEATION", "VALIDATION", "EARLY_TRACTION", "SCALING", "GROWTH", "GRADUATED"];
  const stageData = useMemo(() => {
    return stageOrder
      .filter((s) => overview.stages[s])
      .map((s) => ({
        stage: s.replace(/_/g, " "),
        count: overview.stages[s] || 0,
      }));
  }, [overview.stages]);

  // 5. Employment by startup (top 10)
  const employmentByStartup = useMemo(() => {
    return [...startups]
      .sort((a, b) => b.employeesCount - a.employeesCount)
      .slice(0, 10)
      .map((s) => ({ name: s.name.length > 15 ? s.name.slice(0, 15) + "..." : s.name, employees: s.employeesCount }));
  }, [startups]);

  // 6. Diversity breakdown
  const diversityData = useMemo(() => [
    { name: "Women-Led", value: overview.womenLed },
    { name: "SC/ST", value: overview.scSt },
    { name: "Rural", value: overview.rural },
    { name: "Others", value: overview.totalStartups - overview.womenLed - overview.scSt - overview.rural },
  ].filter((d) => d.value > 0), [overview]);

  return (
    <div className="space-y-6">
      {/* Row 1: Reporting trend + Revenue */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Reporting Compliance (Monthly)</CardTitle></CardHeader>
          <CardContent>
            {reportsByMonth.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No report data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={reportsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reviewed" name="Reviewed" fill="#22c55e" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="submitted" name="Submitted" fill="#6366f1" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Revenue by Startup (Top 10)</CardTitle></CardHeader>
          <CardContent>
            {revenueByStartup.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No revenue data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueByStartup} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                  <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Sector pie + Stage pipeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Sector Distribution</CardTitle></CardHeader>
          <CardContent>
            {sectorData.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {sectorData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Startup Pipeline (by Stage)</CardTitle></CardHeader>
          <CardContent>
            {stageData.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Startups" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {stageData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Employment + Diversity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Employment by Startup (Top 10)</CardTitle></CardHeader>
          <CardContent>
            {employmentByStartup.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={employmentByStartup} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="employees" name="Employees" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Diversity Breakdown</CardTitle></CardHeader>
          <CardContent>
            {diversityData.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={diversityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {diversityData.map((_, i) => (
                      <Cell key={i} fill={["#ec4899", "#6366f1", "#22c55e", "#d1d5db"][i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── KPI helper ─────────────────────────────────────────

function KPI({ label, value, sub, icon: Icon }: {
  label: string; value: string | number; sub?: string; icon: typeof Building2;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Icon className="h-5 w-5 text-brand-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
