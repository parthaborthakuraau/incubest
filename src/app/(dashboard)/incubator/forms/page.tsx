"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import {
  Plus, X, Trash2, FileText, Copy, Check, ChevronDown, ChevronUp,
  ExternalLink, Lock, Globe, Users, GripVertical, Eye, Send,
  Download, BarChart3, Upload, Star,
} from "lucide-react";
import { FIELD_TYPES, generateFieldId } from "@/lib/form-field-types";
import type { FormField } from "@/lib/form-field-types";

// ─── Types ──────────────────────────────────────────

interface FormData {
  id: string; title: string; description: string | null; type: string;
  fields: FormField[]; isPublic: boolean; isActive: boolean;
  deadline: string | null; targetStartupIds: string[]; createdAt: string;
  program: { name: string } | null;
  _count: { responses: number };
}

interface FormResponse {
  id: string; data: Record<string, unknown>; status: string;
  respondentName: string | null; respondentEmail: string | null;
  createdAt: string;
  startup: { name: string } | null;
  user: { name: string } | null;
}

interface StartupOption { id: string; name: string; }
interface DueDiligenceRecord {
  id: string; documentUrl: string; reviewerName: string;
  reviewDate: string; notes: string | null; startup: { name: string };
}

const TABS = [
  { id: "forms", label: "Forms", icon: FileText },
  { id: "due-diligence", label: "Due Diligence", icon: Upload },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TYPE_CONFIG = {
  INVESTMENT: { icon: Lock, label: "Investment", color: "bg-violet-100 text-violet-700" },
  CALL_FOR_ENTRIES: { icon: Globe, label: "Call for Entries", color: "bg-green-100 text-green-700" },
  DUE_DILIGENCE: { icon: Users, label: "Due Diligence", color: "bg-gray-100 text-gray-700" },
};

// ─── Main Page ──────────────────────────────────────

export default function FormsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("forms");
  const [forms, setForms] = useState<FormData[]>([]);
  const [startups, setStartups] = useState<StartupOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/forms").then(r => r.json()),
      fetch("/api/startups").then(r => r.json()),
    ]).then(([f, s]) => {
      if (Array.isArray(f)) setForms(f);
      if (Array.isArray(s)) setStartups(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function refetch() {
    fetch("/api/forms").then(r => r.json()).then(f => { if (Array.isArray(f)) setForms(f); });
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
        <p className="text-sm text-gray-500">Investment forms, call for entries, and due diligence</p>
      </div>

      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "forms" && <FormsTab forms={forms} startups={startups} onRefetch={refetch} />}
      {activeTab === "due-diligence" && <DueDiligenceTab startups={startups} />}
    </div>
  );
}

// ─── Forms Tab ──────────────────────────────────────

function FormsTab({ forms, startups, onRefetch }: { forms: FormData[]; startups: StartupOption[]; onRefetch: () => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [viewingForm, setViewingForm] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formType, setFormType] = useState<"INVESTMENT" | "CALL_FOR_ENTRIES">("CALL_FOR_ENTRIES");
  const [deadline, setDeadline] = useState("");
  const [fields, setFields] = useState<FormField[]>([
    { id: generateFieldId(), name: "", label: "", type: "short_text", required: true },
  ]);
  const [selectedStartups, setSelectedStartups] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function addField(type: FormField["type"] = "short_text") {
    setFields([...fields, { id: generateFieldId(), name: "", label: "", type, required: false, options: type === "single_choice" || type === "multiple_choice" || type === "dropdown" ? ["Option 1", "Option 2"] : undefined }]);
  }

  function updateField(idx: number, updates: Partial<FormField>) {
    const f = [...fields]; f[idx] = { ...f[idx], ...updates }; setFields(f);
  }

  function removeField(idx: number) { setFields(fields.filter((_, i) => i !== idx)); }

  function addOption(fieldIdx: number) {
    const f = [...fields];
    f[fieldIdx] = { ...f[fieldIdx], options: [...(f[fieldIdx].options || []), `Option ${(f[fieldIdx].options?.length || 0) + 1}`] };
    setFields(f);
  }

  function updateOption(fieldIdx: number, optIdx: number, value: string) {
    const f = [...fields];
    const opts = [...(f[fieldIdx].options || [])]; opts[optIdx] = value;
    f[fieldIdx] = { ...f[fieldIdx], options: opts }; setFields(f);
  }

  function removeOption(fieldIdx: number, optIdx: number) {
    const f = [...fields];
    f[fieldIdx] = { ...f[fieldIdx], options: (f[fieldIdx].options || []).filter((_, i) => i !== optIdx) };
    setFields(f);
  }

  function resetForm() {
    setShowCreate(false); setTitle(""); setDescription(""); setFormType("CALL_FOR_ENTRIES");
    setDeadline(""); setSelectedStartups([]);
    setFields([{ id: generateFieldId(), name: "", label: "", type: "short_text", required: true }]);
  }

  async function handleCreate() {
    if (!title || fields.some(f => !f.label)) return;
    setSubmitting(true);
    const processed = fields.map(f => ({ ...f, name: f.name || f.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") }));

    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, description: description || null, type: formType,
        fields: processed, deadline: deadline || null,
        targetStartupIds: formType === "INVESTMENT" ? selectedStartups : [],
      }),
    });

    if (res.ok && formType === "INVESTMENT" && selectedStartups.length > 0) {
      const form = await res.json();
      // Notify selected startups
      await fetch("/api/forms/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: form.id, startupIds: selectedStartups }),
      });
    }

    resetForm(); onRefetch(); setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this form and all responses?")) return;
    await fetch(`/api/forms?id=${id}`, { method: "DELETE" });
    onRefetch();
  }

  function copyLink(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/forms/${id}`);
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  }

  // ─── Viewing responses for a specific form
  if (viewingForm) {
    const form = forms.find(f => f.id === viewingForm);
    if (!form) { setViewingForm(null); return null; }
    return <FormResponses form={form} onBack={() => setViewingForm(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? <><X className="mr-2 h-4 w-4" />Cancel</> : <><Plus className="mr-2 h-4 w-4" />New Form</>}
        </Button>
      </div>

      {/* ─── Create Form ─── */}
      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Create Form</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <Input label="Form Title *" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. RKVY Seed Fund Application" />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Tell respondents what this form is about"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none" />
            </div>

            {/* Type selector */}
            <div className="grid gap-3 sm:grid-cols-2">
              {(["CALL_FOR_ENTRIES", "INVESTMENT"] as const).map(t => {
                const cfg = TYPE_CONFIG[t];
                return (
                  <button key={t} type="button" onClick={() => setFormType(t)}
                    className={`rounded-xl border p-4 text-left transition-all ${formType === t ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-200 hover:border-gray-300"}`}>
                    <cfg.icon className="h-5 w-5 mb-2 text-gray-500" />
                    <p className="font-medium text-gray-900">{cfg.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t === "CALL_FOR_ENTRIES" ? "Public — anyone can fill without an account" : "Send to specific startups — requires login"}
                    </p>
                  </button>
                );
              })}
            </div>

            <Input label="Deadline (optional)" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />

            {/* Startup selector for Investment type */}
            {formType === "INVESTMENT" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Send to Startups ({selectedStartups.length})</label>
                  <Button size="sm" variant="outline" onClick={() => setSelectedStartups(startups.map(s => s.id))}>Select All</Button>
                </div>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-2 space-y-1">
                  {startups.map(s => (
                    <label key={s.id} className={`flex items-center gap-2 rounded-lg p-2 text-sm cursor-pointer ${selectedStartups.includes(s.id) ? "bg-violet-50 text-violet-700" : "hover:bg-gray-50"}`}>
                      <input type="checkbox" checked={selectedStartups.includes(s.id)}
                        onChange={() => setSelectedStartups(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])} />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Field Builder ─── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-900">Questions</label>
              </div>
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div key={field.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-3">
                        <input value={field.label} onChange={e => updateField(idx, { label: e.target.value })}
                          placeholder="Question title" className="w-full border-0 border-b-2 border-gray-200 bg-transparent text-sm font-medium text-gray-900 pb-1 focus:outline-none focus:border-gray-900" />

                        <div className="flex flex-wrap items-center gap-2">
                          <select value={field.type} onChange={e => {
                            const newType = e.target.value as FormField["type"];
                            const needsOptions = ["single_choice", "multiple_choice", "dropdown"].includes(newType);
                            updateField(idx, { type: newType, options: needsOptions ? (field.options || ["Option 1", "Option 2"]) : undefined });
                          }} className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700">
                            {FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.icon} {ft.label}</option>)}
                          </select>
                          <label className="flex items-center gap-1 text-xs text-gray-500">
                            <input type="checkbox" checked={field.required} onChange={e => updateField(idx, { required: e.target.checked })} className="rounded" />
                            Required
                          </label>
                          <input value={field.placeholder || ""} onChange={e => updateField(idx, { placeholder: e.target.value })}
                            placeholder="Placeholder text..." className="flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none min-w-[120px]" />
                        </div>

                        {/* Options for choice fields */}
                        {field.options && (
                          <div className="space-y-1.5 pl-1">
                            {field.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <span className="text-gray-300">
                                  {field.type === "single_choice" ? "○" : field.type === "multiple_choice" ? "☐" : "•"}
                                </span>
                                <input value={opt} onChange={e => updateOption(idx, oi, e.target.value)}
                                  className="flex-1 border-0 border-b border-gray-200 bg-transparent text-sm text-gray-700 pb-0.5 focus:outline-none focus:border-gray-400" />
                                <button onClick={() => removeOption(idx, oi)} className="text-gray-300 hover:text-red-500"><X className="h-3 w-3" /></button>
                              </div>
                            ))}
                            <button onClick={() => addOption(idx)} className="text-xs text-blue-600 hover:underline mt-1">+ Add option</button>
                          </div>
                        )}
                      </div>
                      {fields.length > 1 && (
                        <button onClick={() => removeField(idx)} className="text-gray-300 hover:text-red-500 mt-1"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add field buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                {FIELD_TYPES.slice(0, 8).map(ft => (
                  <button key={ft.value} onClick={() => addField(ft.value as FormField["type"])}
                    className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors">
                    {ft.icon} {ft.label}
                  </button>
                ))}
                <button onClick={() => addField("single_choice")}
                  className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors">
                  ◉ Choice
                </button>
                <button onClick={() => addField("rating")}
                  className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors">
                  ⭐ Rating
                </button>
                <button onClick={() => addField("file_upload")}
                  className="rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors">
                  📎 File
                </button>
              </div>
            </div>

            <div className="flex gap-2 border-t border-gray-100 pt-4">
              <Button onClick={handleCreate} disabled={submitting || !title}>{submitting ? "Creating..." : "Create Form"}</Button>
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Forms List ─── */}
      {forms.length === 0 && !showCreate ? (
        <Card><CardContent className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No forms yet</h3>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {forms.filter(f => f.type !== "DUE_DILIGENCE").map(form => {
            const cfg = TYPE_CONFIG[form.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.CALL_FOR_ENTRIES;
            return (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{form.title}</h3>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                        {form.deadline && <Badge variant="outline">Due {new Date(form.deadline).toLocaleDateString("en-IN")}</Badge>}
                      </div>
                      {form.description && <p className="mt-1 text-xs text-gray-500">{form.description}</p>}
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span>{form._count.responses} response(s)</span>
                        <span>{form.fields.length} questions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => setViewingForm(form.id)}>
                        <BarChart3 className="mr-1.5 h-3 w-3" /> Responses
                      </Button>
                      {(form.type === "CALL_FOR_ENTRIES" || form.isPublic) && (
                        <button onClick={() => copyLink(form.id)}
                          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-all ${copiedId === form.id ? "border-green-300 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                          {copiedId === form.id ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Link</>}
                        </button>
                      )}
                      <button onClick={() => handleDelete(form.id)} className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Form Responses Viewer ──────────────────────────

function FormResponses({ form, onBack }: { form: FormData; onBack: () => void }) {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"summary" | "individual">("summary");

  useEffect(() => {
    fetch(`/api/forms/${form.id}`).then(r => r.json()).then(d => {
      setResponses(d.responses || []); setLoading(false);
    }).catch(() => setLoading(false));
  }, [form.id]);

  function exportCSV() {
    const headers = ["Respondent", "Email", "Submitted", "Status", ...form.fields.map(f => f.label)];
    const rows = responses.map(r => [
      r.respondentName || r.startup?.name || r.user?.name || "—",
      r.respondentEmail || "",
      new Date(r.createdAt).toLocaleDateString("en-IN"),
      r.status,
      ...form.fields.map(f => String((r.data as Record<string, unknown>)?.[f.name || f.label.toLowerCase().replace(/\s+/g, "_")] || "")),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${form.title.replace(/\s+/g, "_")}_responses.csv`; a.click();
  }

  // Summary: count answers per field
  function getFieldSummary(field: FormField) {
    const key = field.name || field.label.toLowerCase().replace(/\s+/g, "_");
    const values = responses.map(r => (r.data as Record<string, unknown>)?.[key]).filter(Boolean);

    if (["single_choice", "multiple_choice", "dropdown"].includes(field.type)) {
      const counts: Record<string, number> = {};
      for (const v of values) {
        if (Array.isArray(v)) v.forEach(x => { counts[String(x)] = (counts[String(x)] || 0) + 1; });
        else counts[String(v)] = (counts[String(v)] || 0) + 1;
      }
      return { type: "distribution", counts, total: values.length };
    }
    if (field.type === "rating") {
      const nums = values.map(v => Number(v)).filter(n => !isNaN(n));
      const avg = nums.length > 0 ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;
      return { type: "rating", avg: Math.round(avg * 10) / 10, count: nums.length };
    }
    if (field.type === "number") {
      const nums = values.map(v => Number(v)).filter(n => !isNaN(n));
      const sum = nums.reduce((s, n) => s + n, 0);
      const avg = nums.length > 0 ? sum / nums.length : 0;
      return { type: "number", sum, avg: Math.round(avg * 100) / 100, count: nums.length };
    }
    return { type: "text", values: values.slice(0, 10).map(String), total: values.length };
  }

  if (loading) return <div className="flex h-40 items-center justify-center"><p className="text-gray-500">Loading responses...</p></div>;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">← Back to Forms</button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{form.title}</h2>
          <p className="text-sm text-gray-500">{responses.length} response(s)</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg bg-gray-100 p-0.5">
            <button onClick={() => setView("summary")} className={`rounded-md px-3 py-1 text-xs font-medium ${view === "summary" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>Summary</button>
            <button onClick={() => setView("individual")} className={`rounded-md px-3 py-1 text-xs font-medium ${view === "individual" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>Individual</button>
          </div>
          <Button size="sm" variant="outline" onClick={exportCSV}><Download className="mr-1 h-3 w-3" /> CSV</Button>
        </div>
      </div>

      {responses.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><p className="text-sm text-gray-500">No responses yet</p></CardContent></Card>
      ) : view === "summary" ? (
        /* ─── Summary View ─── */
        <div className="space-y-4">
          {form.fields.map((field, i) => {
            const summary = getFieldSummary(field);
            return (
              <Card key={i}>
                <CardContent className="p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-3">{field.label}</p>
                  {summary.type === "distribution" && "counts" in summary && (
                    <div className="space-y-2">
                      {Object.entries(summary.counts as Record<string, number>).sort(([,a],[,b]) => b - a).map(([opt, count]) => (
                        <div key={opt}>
                          <div className="flex justify-between text-xs mb-0.5"><span className="text-gray-700">{opt}</span><span className="font-medium">{count}</span></div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-violet-500" style={{ width: `${(count / (summary.total || 1)) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {summary.type === "rating" && "avg" in summary && (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-gray-900">{(summary as {avg:number}).avg}</span>
                      <div className="flex">{[1,2,3,4,5].map(n => <Star key={n} className={`h-5 w-5 ${n <= Math.round((summary as {avg:number}).avg) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />)}</div>
                      <span className="text-xs text-gray-500">{(summary as {count:number}).count} responses</span>
                    </div>
                  )}
                  {summary.type === "number" && "sum" in summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div><p className="text-2xl font-bold text-gray-900">{((summary as {sum:number}).sum || 0).toLocaleString("en-IN")}</p><p className="text-xs text-gray-500">Total</p></div>
                      <div><p className="text-2xl font-bold text-gray-900">{((summary as {avg:number}).avg || 0).toLocaleString("en-IN")}</p><p className="text-xs text-gray-500">Average</p></div>
                      <div><p className="text-2xl font-bold text-gray-900">{(summary as {count:number}).count}</p><p className="text-xs text-gray-500">Responses</p></div>
                    </div>
                  )}
                  {summary.type === "text" && "values" in summary && (
                    <div className="space-y-1">{((summary as {values:string[]}).values || []).map((v, j) => <p key={j} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-1.5">{v}</p>)}</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* ─── Individual View ─── */
        <div className="space-y-3">
          {responses.map(resp => (
            <Card key={resp.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{resp.respondentName || resp.startup?.name || resp.user?.name || "Anonymous"}</p>
                    {resp.respondentEmail && <p className="text-xs text-gray-500">{resp.respondentEmail}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={resp.status === "SHORTLISTED" ? "success" : resp.status === "REJECTED" ? "destructive" : "secondary"}>{resp.status}</Badge>
                    <span className="text-xs text-gray-400">{new Date(resp.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {form.fields.map((field, fi) => {
                    const key = field.name || field.label.toLowerCase().replace(/\s+/g, "_");
                    const val = (resp.data as Record<string, unknown>)?.[key];
                    return (
                      <div key={fi} className="rounded-lg bg-gray-50 px-3 py-2">
                        <p className="text-[10px] text-gray-500">{field.label}</p>
                        <p className="text-sm text-gray-900 font-medium">{val !== undefined && val !== null ? String(val) : "—"}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Due Diligence Tab ──────────────────────────────

function DueDiligenceTab({ startups }: { startups: StartupOption[] }) {
  const [records, setRecords] = useState<DueDiligenceRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/due-diligence").then(r => r.json()).then(d => { if (Array.isArray(d)) setRecords(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    // Upload document
    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    let documentUrl = "";
    if (fileInput?.files?.[0]) {
      const uf = new FormData(); uf.append("file", fileInput.files[0]);
      const ur = await fetch("/api/upload", { method: "POST", body: uf });
      if (ur.ok) documentUrl = (await ur.json()).url;
    }

    if (!documentUrl) { alert("Please upload a document"); setSubmitting(false); return; }

    await fetch("/api/due-diligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startupId: fd.get("startupId"), reviewerName: fd.get("reviewerName"),
        reviewDate: fd.get("reviewDate"), notes: fd.get("notes"), documentUrl,
      }),
    });

    setShowForm(false); setSubmitting(false);
    fetch("/api/due-diligence").then(r => r.json()).then(d => { if (Array.isArray(d)) setRecords(d); });
  }

  if (loading) return <div className="flex h-40 items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" />Cancel</> : <><Upload className="mr-2 h-4 w-4" />Upload Due Diligence</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Upload Due Diligence Document</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Startup *</label>
                  <select name="startupId" required className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900">
                    <option value="">Select startup</option>
                    {startups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <Input label="Reviewer Name *" name="reviewerName" required placeholder="Due diligence officer name" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Review Date *" name="reviewDate" type="date" required />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Document (PDF/Image) *</label>
                  <input type="file" accept=".pdf,image/*" required
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                <textarea name="notes" rows={2} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none" />
              </div>
              <Button type="submit" disabled={submitting}>{submitting ? "Uploading..." : "Upload"}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {records.length === 0 && !showForm ? (
        <Card><CardContent className="py-12 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No due diligence records</h3>
          <p className="mt-2 text-sm text-gray-500">Upload scanned due diligence documents here.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {records.map(r => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">{r.startup.name}</p>
                  <p className="text-xs text-gray-500">Reviewed by {r.reviewerName} on {new Date(r.reviewDate).toLocaleDateString("en-IN")}</p>
                  {r.notes && <p className="mt-0.5 text-xs text-gray-400">{r.notes}</p>}
                </div>
                <a href={r.documentUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline"><ExternalLink className="mr-1 h-3 w-3" /> View</Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
