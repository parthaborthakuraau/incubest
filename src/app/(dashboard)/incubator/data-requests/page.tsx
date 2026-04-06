"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import {
  Plus,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from "lucide-react";

interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface StartupOption {
  id: string;
  name: string;
  cohort: { name: string };
}

interface ProgramOption {
  id: string;
  name: string;
}

interface ResponseData {
  id: string;
  status: string;
  data: Record<string, unknown> | null;
  submittedAt: string | null;
  startup: { id: string; name: string };
}

interface DataRequest {
  id: string;
  title: string;
  description: string | null;
  fields: FieldDefinition[];
  deadline: string;
  createdAt: string;
  program: { name: string } | null;
  responses: ResponseData[];
}

const STATUS_BADGE: Record<string, "secondary" | "success" | "warning"> = {
  PENDING: "warning",
  SUBMITTED: "success",
  OVERDUE: "secondary",
};

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Long Text" },
  { value: "date", label: "Date" },
];

export default function DataRequestsPage() {
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [startups, setStartups] = useState<StartupOption[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedStartups, setSelectedStartups] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [fields, setFields] = useState<FieldDefinition[]>([
    { name: "", label: "", type: "text", required: true },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/data-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
        setStartups(data.startups);
        setPrograms(data.programs);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }

  function addField() {
    setFields([...fields, { name: "", label: "", type: "text", required: false }]);
  }

  function updateField(idx: number, updates: Partial<FieldDefinition>) {
    setFields(fields.map((f, i) => (i === idx ? { ...f, ...updates } : f)));
  }

  function removeField(idx: number) {
    setFields(fields.filter((_, i) => i !== idx));
  }

  function toggleStartup(id: string) {
    setSelectedStartups((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedStartups(startups.map((s) => s.id));
  }

  function resetForm() {
    setShowForm(false);
    setTitle("");
    setDescription("");
    setDeadline("");
    setSelectedStartups([]);
    setSelectedProgram("");
    setFields([{ name: "", label: "", type: "text", required: true }]);
  }

  async function handleSubmit() {
    // Auto-set field names from labels
    const processedFields = fields.map((f) => ({
      ...f,
      name: f.name || f.label.toLowerCase().replace(/\s+/g, "_"),
    }));

    if (!title || !deadline || selectedStartups.length === 0 || processedFields.some((f) => !f.label)) {
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/data-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        fields: processedFields,
        deadline,
        startupIds: selectedStartups,
        programId: selectedProgram || null,
      }),
    });

    if (res.ok) {
      resetForm();
      fetchData();
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Requests</h1>
          <p className="text-sm text-gray-500">
            Send ad-hoc data collection requests to specific startups
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <><X className="mr-2 h-4 w-4" /> Cancel</>
          ) : (
            <><Plus className="mr-2 h-4 w-4" /> New Request</>
          )}
        </Button>
      </div>

      {/* ─── Create Form ─────────────────────────────── */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Data Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Last month's revenue data"
              />
              <Input
                label="Deadline *"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional context for the startups"
            />

            {/* Program filter */}
            {programs.length > 0 && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Program (optional)
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Programs</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Fields builder */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Data Fields *
                </label>
                <Button variant="outline" size="sm" onClick={addField}>
                  <Plus className="mr-1 h-3 w-3" /> Add Field
                </Button>
              </div>
              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2"
                  >
                    <Input
                      placeholder="Field label (e.g. Revenue)"
                      value={field.label}
                      onChange={(e) => updateField(idx, { label: e.target.value })}
                      className="flex-1"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(idx, { type: e.target.value })}
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                    >
                      {FIELD_TYPES.map((ft) => (
                        <option key={ft.value} value={ft.value}>
                          {ft.label}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(idx, { required: e.target.checked })}
                      />
                      Req
                    </label>
                    {fields.length > 1 && (
                      <button
                        onClick={() => removeField(idx)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Startup selection */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Send to Startups * ({selectedStartups.length} selected)
                </label>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
              </div>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
                {startups.map((s) => (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm transition-colors ${
                      selectedStartups.includes(s.id)
                        ? "bg-brand-50 text-brand-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStartups.includes(s.id)}
                      onChange={() => toggleStartup(s.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-gray-400">{s.cohort.name}</span>
                  </label>
                ))}
                {startups.length === 0 && (
                  <p className="p-2 text-sm text-gray-400">No startups found</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !title ||
                  !deadline ||
                  selectedStartups.length === 0
                }
              >
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Requests List ───────────────────────────── */}
      {requests.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Send className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No data requests yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Send an ad-hoc data request to collect specific information from your startups.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const isExpanded = expandedId === req.id;
            const submitted = req.responses.filter((r) => r.status === "SUBMITTED").length;
            const total = req.responses.length;
            const isOverdue = new Date(req.deadline) < new Date();

            return (
              <Card key={req.id}>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{req.title}</CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        {req.program && (
                          <Badge variant="secondary">{req.program.name}</Badge>
                        )}
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          Due {new Date(req.deadline).toLocaleDateString("en-IN")}
                        </span>
                        {isOverdue && <Badge variant="warning">Overdue</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {submitted}/{total}
                        </p>
                        <p className="text-xs text-gray-400">responses</p>
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
                    {req.description && (
                      <p className="mb-3 text-sm text-gray-500">{req.description}</p>
                    )}

                    <div className="space-y-2">
                      {req.responses.map((resp) => (
                        <div
                          key={resp.id}
                          className="rounded-lg border border-gray-100 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{resp.startup.name}</p>
                            <Badge variant={STATUS_BADGE[resp.status]}>
                              {resp.status === "SUBMITTED" && (
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                              )}
                              {resp.status === "PENDING" && (
                                <AlertTriangle className="mr-1 h-3 w-3" />
                              )}
                              {resp.status}
                            </Badge>
                          </div>
                          {resp.data && (
                            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {Object.entries(resp.data).map(([key, val]) => {
                                const fieldDef = req.fields.find(
                                  (f) => f.name === key
                                );
                                return (
                                  <div
                                    key={key}
                                    className="rounded bg-gray-50 px-2 py-1"
                                  >
                                    <p className="text-xs text-gray-500">
                                      {fieldDef?.label || key}
                                    </p>
                                    <p className="text-sm font-medium">
                                      {String(val)}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {resp.submittedAt && (
                            <p className="mt-1 text-xs text-gray-400">
                              Submitted{" "}
                              {new Date(resp.submittedAt).toLocaleDateString(
                                "en-IN"
                              )}
                            </p>
                          )}
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
