"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import {
  Target,
  Plus,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Cohort {
  id: string;
  name: string;
  isActive: boolean;
}

interface MilestoneTemplate {
  id: string;
  name: string;
  description: string | null;
  dueOffset: number | null;
  cohort: { id: string; name: string };
  _count: { milestones: number };
  createdAt: string;
}

interface Milestone {
  id: string;
  status: string;
  notes: string | null;
  dueDate: string | null;
  completedAt: string | null;
  template: { name: string; description: string | null };
  startup: { id: string; name: string };
}

const STATUS_COLORS: Record<string, "secondary" | "default" | "success" | "warning"> = {
  NOT_STARTED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  MISSED: "warning",
};

export default function IncubatorMilestonesPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "tracker">("templates");
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter
  const [filterCohort, setFilterCohort] = useState("");
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [templatesRes, milestonesRes] = await Promise.all([
        fetch("/api/milestones/templates"),
        fetch("/api/milestones"),
      ]);

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates);
        setCohorts(data.cohorts);
      }

      if (milestonesRes.ok) {
        setMilestones(await milestonesRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      description: formData.get("description"),
      dueOffset: formData.get("dueOffset"),
      cohortId: formData.get("cohortId"),
    };

    const res = await fetch("/api/milestones/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowForm(false);
      fetchData();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this milestone template? All related milestones will be removed.")) return;

    const res = await fetch(`/api/milestones/templates?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchData();
  }

  // Group milestones by template
  const milestonesByTemplate = milestones.reduce((acc, m) => {
    const key = m.template.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, Milestone[]>);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading milestones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
          <p className="text-sm text-gray-500">
            Define milestone templates per cohort and track startup progress
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "templates"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Target className="h-4 w-4" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab("tracker")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "tracker"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Target className="h-4 w-4" />
          Progress Tracker
        </button>
      </div>

      {/* ─── Templates Tab ───────────────────────────────── */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? (
                <><X className="mr-2 h-4 w-4" /> Cancel</>
              ) : (
                <><Plus className="mr-2 h-4 w-4" /> Add Template</>
              )}
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>New Milestone Template</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <Input
                    label="Milestone Name"
                    name="name"
                    placeholder="e.g. MVP Launch"
                    required
                  />
                  <Input
                    label="Description"
                    name="description"
                    placeholder="What should the startup achieve?"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Cohort
                      </label>
                      <select
                        name="cohortId"
                        required
                        className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="">Select cohort</option>
                        {cohorts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.isActive ? "(Active)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Due Offset (days from cohort start)"
                      name="dueOffset"
                      type="number"
                      placeholder="e.g. 90"
                    />
                  </div>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Template"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {templates.length === 0 && !showForm ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No milestone templates yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create templates to define KPIs for each cohort.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <Card key={t.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{t.name}</p>
                      {t.description && (
                        <p className="mt-0.5 text-sm text-gray-500">
                          {t.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary">{t.cohort.name}</Badge>
                        {t.dueOffset && (
                          <Badge variant="outline">
                            Due: Day {t.dueOffset}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {t._count.milestones} startup(s)
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(t.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tracker Tab ─────────────────────────────────── */}
      {activeTab === "tracker" && (
        <div className="space-y-4">
          {/* Cohort filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Filter by cohort:</label>
            <select
              value={filterCohort}
              onChange={(e) => setFilterCohort(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            >
              <option value="">All Cohorts</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {Object.keys(milestonesByTemplate).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No milestones assigned yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create milestone templates to start tracking startup progress.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(milestonesByTemplate).map(([templateName, items]) => {
              const isExpanded = expandedTemplate === templateName;
              const completed = items.filter((m) => m.status === "COMPLETED").length;

              return (
                <Card key={templateName}>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() =>
                      setExpandedTemplate(isExpanded ? null : templateName)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{templateName}</CardTitle>
                        <p className="mt-1 text-xs text-gray-500">
                          {completed}/{items.length} completed
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Progress bar */}
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{
                              width: `${items.length > 0 ? (completed / items.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="border-t pt-4">
                      <div className="space-y-2">
                        {items
                          .filter(
                            (m) =>
                              !filterCohort || m.startup.name.includes(filterCohort)
                          )
                          .map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {m.startup.name}
                                </p>
                                {m.notes && (
                                  <p className="mt-0.5 text-xs text-gray-500">
                                    {m.notes}
                                  </p>
                                )}
                                {m.dueDate && (
                                  <p className="text-xs text-gray-400">
                                    Due:{" "}
                                    {new Date(m.dueDate).toLocaleDateString(
                                      "en-IN"
                                    )}
                                  </p>
                                )}
                              </div>
                              <Badge variant={STATUS_COLORS[m.status]}>
                                {m.status.replace(/_/g, " ")}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
