"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, X, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface MilestoneTemplate {
  id: string;
  name: string;
  description: string | null;
  dueOffset: number | null;
  cohort: { id: string; name: string };
  _count: { milestones: number };
}

interface Milestone {
  id: string;
  status: string;
  notes: string | null;
  dueDate: string | null;
  template: { name: string };
  startup: { id: string; name: string };
}

interface Cohort { id: string; name: string; isActive: boolean; }

const STATUS_COLORS: Record<string, "secondary" | "default" | "success" | "warning"> = {
  NOT_STARTED: "secondary", IN_PROGRESS: "default", COMPLETED: "success", MISSED: "warning",
};

export default function ProgramMilestonesPage() {
  const { id: programId } = useParams<{ id: string }>();
  const [templates, setTemplates] = useState<MilestoneTemplate[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, [programId]);

  async function fetchData() {
    const [tRes, mRes, cRes] = await Promise.all([
      fetch("/api/milestones/templates"),
      fetch("/api/milestones"),
      fetch(`/api/cohorts?programId=${programId}`),
    ]);
    if (tRes.ok) {
      const data = await tRes.json();
      // Filter templates to only those from cohorts in this program
      setTemplates(data.templates || []);
    }
    if (mRes.ok) setMilestones(await mRes.json());
    if (cRes.ok) {
      const data = await cRes.json();
      setCohorts(data.cohorts || []);
    }
    setLoading(false);
  }

  // Filter templates to only cohorts in this program
  const programCohortIds = new Set(cohorts.map((c) => c.id));
  const filteredTemplates = templates.filter((t) => programCohortIds.has(t.cohort.id));

  const milestonesByTemplate = milestones.reduce((acc, m) => {
    const key = m.template.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, Milestone[]>);

  // Only show milestones from program templates
  const programTemplateNames = new Set(filteredTemplates.map((t) => t.name));

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await fetch("/api/milestones/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description"),
        dueOffset: formData.get("dueOffset"),
        cohortId: formData.get("cohortId"),
      }),
    });
    setShowForm(false);
    setSubmitting(false);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this milestone template?")) return;
    await fetch(`/api/milestones/templates?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
          <p className="text-sm text-gray-500">Milestone templates and progress for this program</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> Add Template</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Milestone Template</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Milestone Name" name="name" placeholder="e.g. MVP Launch" required />
              <Input label="Description" name="description" placeholder="What should the startup achieve?" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Cohort</label>
                  <select name="cohortId" required className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">Select cohort</option>
                    {cohorts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <Input label="Due Offset (days)" name="dueOffset" type="number" placeholder="e.g. 90" />
              </div>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Template"}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Templates list */}
      {filteredTemplates.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Templates</h2>
          {filteredTemplates.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary">{t.cohort.name}</Badge>
                    {t.dueOffset && <Badge variant="outline">Day {t.dueOffset}</Badge>}
                    <span className="text-xs text-gray-400">{t._count.milestones} startup(s)</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Progress tracker */}
      <h2 className="text-lg font-semibold">Progress</h2>
      {Object.entries(milestonesByTemplate)
        .filter(([name]) => programTemplateNames.has(name))
        .map(([templateName, items]) => {
          const isExpanded = expandedTemplate === templateName;
          const completed = items.filter((m) => m.status === "COMPLETED").length;
          return (
            <Card key={templateName}>
              <CardHeader className="cursor-pointer" onClick={() => setExpandedTemplate(isExpanded ? null : templateName)}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{templateName}</CardTitle>
                    <p className="mt-1 text-xs text-gray-500">{completed}/{items.length} completed</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${items.length > 0 ? (completed / items.length) * 100 : 0}%` }} />
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="border-t pt-4 space-y-2">
                  {items.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                      <div>
                        <p className="text-sm font-medium">{m.startup.name}</p>
                        {m.dueDate && <p className="text-xs text-gray-400">Due: {new Date(m.dueDate).toLocaleDateString("en-IN")}</p>}
                      </div>
                      <Badge variant={STATUS_COLORS[m.status]}>{m.status.replace(/_/g, " ")}</Badge>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}

      {filteredTemplates.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No milestones yet</h3>
            <p className="mt-2 text-sm text-gray-500">Create milestone templates for this program&apos;s cohorts.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
