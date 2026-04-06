"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  GraduationCap,
  Building2,
  Users,
  IndianRupee,
  Briefcase,
  Save,
  X,
} from "lucide-react";

type AlumniStatus = "ACTIVE" | "GRADUATED" | "ACQUIRED" | "SHUT_DOWN" | "PIVOTED";

interface AlumniStartup {
  id: string;
  name: string;
  sector: string;
  alumniStatus: AlumniStatus;
  graduatedAt: string | null;
  postGradRevenue: number | null;
  postGradFunding: number | null;
  postGradEmployees: number | null;
  acquiredBy: string | null;
  alumniNotes: string | null;
  cohort: { name: string };
}

const STATUS_BADGES: Record<AlumniStatus, string> = {
  ACTIVE: "bg-gray-100 text-gray-800",
  GRADUATED: "bg-green-100 text-green-800",
  ACQUIRED: "bg-blue-100 text-blue-800",
  SHUT_DOWN: "bg-red-100 text-red-800",
  PIVOTED: "bg-yellow-100 text-yellow-800",
};

const STATUS_LABELS: Record<AlumniStatus, string> = {
  ACTIVE: "Active",
  GRADUATED: "Graduated",
  ACQUIRED: "Acquired",
  SHUT_DOWN: "Shut Down",
  PIVOTED: "Pivoted",
};

const FILTER_TABS: { label: string; value: AlumniStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Graduated", value: "GRADUATED" },
  { label: "Acquired", value: "ACQUIRED" },
  { label: "Shut Down", value: "SHUT_DOWN" },
];

export default function AlumniPage() {
  const [startups, setStartups] = useState<AlumniStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AlumniStatus | "ALL">("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<AlumniStartup>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAlumni();
  }, []);

  async function fetchAlumni() {
    try {
      const res = await fetch("/api/alumni");
      if (res.ok) {
        const data = await res.json();
        setStartups(data);
      }
    } finally {
      setLoading(false);
    }
  }

  function startEdit(startup: AlumniStartup) {
    setEditingId(startup.id);
    setEditData({
      alumniStatus: startup.alumniStatus,
      graduatedAt: startup.graduatedAt,
      postGradRevenue: startup.postGradRevenue,
      postGradFunding: startup.postGradFunding,
      postGradEmployees: startup.postGradEmployees,
      acquiredBy: startup.acquiredBy,
      alumniNotes: startup.alumniNotes,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  async function saveEdit(startupId: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/alumni", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId, ...editData }),
      });
      if (res.ok) {
        await fetchAlumni();
        setEditingId(null);
        setEditData({});
      }
    } finally {
      setSaving(false);
    }
  }

  const filtered = filter === "ALL" ? startups : startups.filter((s) => s.alumniStatus === filter);

  const graduatedCount = startups.filter((s) => s.alumniStatus === "GRADUATED").length;
  const acquiredCount = startups.filter((s) => s.alumniStatus === "ACQUIRED").length;
  const totalPostGradRevenue = startups.reduce((sum, s) => sum + (s.postGradRevenue ?? 0), 0);
  const totalPostGradJobs = startups.reduce((sum, s) => sum + (s.postGradEmployees ?? 0), 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading alumni data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Alumni Tracking</h1>
        <p className="text-gray-500">Track post-graduation success of your startups</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Startups" value={startups.length} icon={Building2} />
        <StatCard title="Graduated" value={graduatedCount} icon={GraduationCap} />
        <StatCard title="Acquired" value={acquiredCount} icon={Briefcase} />
        <StatCard title="Post-Grad Revenue" value={formatCurrency(totalPostGradRevenue)} icon={IndianRupee} />
        <StatCard title="Post-Grad Jobs" value={totalPostGradJobs} icon={Users} />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {FILTER_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant={filter === tab.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Startup Cards */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No startups found for this filter.
            </CardContent>
          </Card>
        )}

        {filtered.map((startup) => (
          <Card key={startup.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{startup.name}</CardTitle>
                  <Badge className={STATUS_BADGES[startup.alumniStatus]}>
                    {STATUS_LABELS[startup.alumniStatus]}
                  </Badge>
                </div>
                {editingId !== startup.id ? (
                  <Button variant="outline" size="sm" onClick={() => startEdit(startup)}>
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(startup.id)} disabled={saving}>
                      <Save className="mr-1 h-4 w-4" />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingId === startup.id ? (
                /* Edit Mode */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={editData.alumniStatus || "ACTIVE"}
                      onChange={(e) => setEditData({ ...editData, alumniStatus: e.target.value as AlumniStatus })}
                    >
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Graduated Date</label>
                    <Input
                      type="date"
                      value={editData.graduatedAt ? new Date(editData.graduatedAt).toISOString().split("T")[0] : ""}
                      onChange={(e) => setEditData({ ...editData, graduatedAt: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Post-Grad Revenue</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={editData.postGradRevenue ?? ""}
                      onChange={(e) => setEditData({ ...editData, postGradRevenue: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Post-Grad Funding</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={editData.postGradFunding ?? ""}
                      onChange={(e) => setEditData({ ...editData, postGradFunding: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Post-Grad Employees</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={editData.postGradEmployees ?? ""}
                      onChange={(e) => setEditData({ ...editData, postGradEmployees: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Acquired By</label>
                    <Input
                      placeholder="Company name"
                      value={editData.acquiredBy ?? ""}
                      onChange={(e) => setEditData({ ...editData, acquiredBy: e.target.value || null })}
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      rows={2}
                      placeholder="Alumni notes..."
                      value={editData.alumniNotes ?? ""}
                      onChange={(e) => setEditData({ ...editData, alumniNotes: e.target.value || null })}
                    />
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <p className="text-xs text-gray-500">Cohort</p>
                    <p className="text-sm font-medium">{startup.cohort.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sector</p>
                    <p className="text-sm font-medium">{startup.sector.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Graduated</p>
                    <p className="text-sm font-medium">
                      {startup.graduatedAt ? formatDate(startup.graduatedAt) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Post-Grad Revenue</p>
                    <p className="text-sm font-medium">
                      {startup.postGradRevenue ? formatCurrency(startup.postGradRevenue) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Post-Grad Funding</p>
                    <p className="text-sm font-medium">
                      {startup.postGradFunding ? formatCurrency(startup.postGradFunding) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Post-Grad Employees</p>
                    <p className="text-sm font-medium">{startup.postGradEmployees ?? "-"}</p>
                  </div>
                  {startup.acquiredBy && (
                    <div>
                      <p className="text-xs text-gray-500">Acquired By</p>
                      <p className="text-sm font-medium">{startup.acquiredBy}</p>
                    </div>
                  )}
                  {startup.alumniNotes && (
                    <div className="col-span-2 sm:col-span-3 lg:col-span-5">
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm text-gray-700">{startup.alumniNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
