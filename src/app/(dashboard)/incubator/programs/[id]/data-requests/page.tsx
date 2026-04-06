"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Send, ChevronDown, ChevronUp, Clock, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";

interface FieldDef { name: string; label: string; type: string; required: boolean; }
interface StartupOption { id: string; name: string; cohort: { name: string }; }
interface ResponseData { id: string; status: string; data: Record<string, unknown> | null; submittedAt: string | null; startup: { id: string; name: string }; }
interface DataRequest { id: string; title: string; description: string | null; fields: FieldDef[]; deadline: string; createdAt: string; responses: ResponseData[]; }

const STATUS_BADGE: Record<string, "secondary" | "success" | "warning"> = { PENDING: "warning", SUBMITTED: "success", OVERDUE: "secondary" };
const FIELD_TYPES = [{ value: "text", label: "Text" }, { value: "number", label: "Number" }, { value: "textarea", label: "Long Text" }, { value: "date", label: "Date" }];

export default function ProgramDataRequestsPage() {
  const { id: programId } = useParams<{ id: string }>();
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [startups, setStartups] = useState<StartupOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedStartups, setSelectedStartups] = useState<string[]>([]);
  const [fields, setFields] = useState<FieldDef[]>([{ name: "", label: "", type: "text", required: true }]);

  useEffect(() => { fetchData(); }, [programId]);

  async function fetchData() {
    const res = await fetch("/api/data-requests");
    if (res.ok) {
      const data = await res.json();
      // Filter requests to this program
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRequests((data.requests || []).filter((r: any) => !r.programId || r.programId === programId));
      // Filter startups to those in this program's cohorts
      const cohortsRes = await fetch(`/api/cohorts?programId=${programId}`);
      if (cohortsRes.ok) {
        const cData = await cohortsRes.json();
        const cohortNames = new Set((cData.cohorts || []).map((c: { name: string }) => c.name));
        setStartups((data.startups || []).filter((s: StartupOption) => cohortNames.has(s.cohort.name)));
      } else {
        setStartups(data.startups || []);
      }
    }
    setLoading(false);
  }

  function resetForm() { setShowForm(false); setTitle(""); setDescription(""); setDeadline(""); setSelectedStartups([]); setFields([{ name: "", label: "", type: "text", required: true }]); }

  async function handleSubmit() {
    const processedFields = fields.map((f) => ({ ...f, name: f.name || f.label.toLowerCase().replace(/\s+/g, "_") }));
    if (!title || !deadline || selectedStartups.length === 0) return;
    setSubmitting(true);
    const res = await fetch("/api/data-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: description || null, fields: processedFields, deadline, startupIds: selectedStartups, programId }),
    });
    if (res.ok) { resetForm(); fetchData(); }
    setSubmitting(false);
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Requests</h1>
          <p className="text-sm text-gray-500">Ad-hoc data requests for this program&apos;s startups</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> New Request</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Data Request</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Last month's revenue" />
              <Input label="Deadline *" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional context" />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Fields *</label>
                <Button variant="outline" size="sm" onClick={() => setFields([...fields, { name: "", label: "", type: "text", required: false }])}>
                  <Plus className="mr-1 h-3 w-3" /> Add Field
                </Button>
              </div>
              {fields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2 rounded-lg border bg-gray-50 p-2">
                  <Input placeholder="Label" value={field.label} onChange={(e) => { const f = [...fields]; f[idx] = { ...f[idx], label: e.target.value }; setFields(f); }} className="flex-1" />
                  <select value={field.type} onChange={(e) => { const f = [...fields]; f[idx] = { ...f[idx], type: e.target.value }; setFields(f); }} className="rounded-md border px-2 py-1.5 text-sm">
                    {FIELD_TYPES.map((ft) => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                  </select>
                  {fields.length > 1 && <button onClick={() => setFields(fields.filter((_, i) => i !== idx))} className="p-1 text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>}
                </div>
              ))}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Startups ({selectedStartups.length})</label>
                <Button variant="outline" size="sm" onClick={() => setSelectedStartups(startups.map((s) => s.id))}>Select All</Button>
              </div>
              <div className="max-h-40 overflow-y-auto rounded-lg border p-2 space-y-1">
                {startups.map((s) => (
                  <label key={s.id} className={`flex items-center gap-2 rounded-md p-2 text-sm cursor-pointer ${selectedStartups.includes(s.id) ? "bg-brand-50 text-brand-700" : "hover:bg-gray-50"}`}>
                    <input type="checkbox" checked={selectedStartups.includes(s.id)} onChange={() => setSelectedStartups((p) => p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id])} />
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-gray-400">{s.cohort.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting || !title || !deadline || selectedStartups.length === 0}>
                <Send className="mr-2 h-4 w-4" /> {submitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 && !showForm ? (
        <Card><CardContent className="py-12 text-center">
          <Send className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No data requests yet</h3>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const isExpanded = expandedId === req.id;
            const submitted = req.responses.filter((r) => r.status === "SUBMITTED").length;
            return (
              <Card key={req.id}>
                <CardHeader className="cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : req.id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{req.title}</CardTitle>
                      <span className="flex items-center gap-1 text-xs text-gray-500 mt-1"><Clock className="h-3 w-3" /> Due {new Date(req.deadline).toLocaleDateString("en-IN")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{submitted}/{req.responses.length}</span>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="border-t pt-4 space-y-2">
                    {req.responses.map((resp) => (
                      <div key={resp.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{resp.startup.name}</p>
                          <Badge variant={STATUS_BADGE[resp.status]}>{resp.status}</Badge>
                        </div>
                        {resp.data && (
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {Object.entries(resp.data).map(([key, val]) => (
                              <div key={key} className="rounded bg-gray-50 px-2 py-1">
                                <p className="text-xs text-gray-500">{req.fields.find((f) => f.name === key)?.label || key}</p>
                                <p className="text-sm font-medium">{String(val)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
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
