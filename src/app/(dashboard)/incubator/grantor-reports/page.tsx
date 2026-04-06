"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  X,
  FileText,
  LayoutTemplate,
  Trash2,
  ChevronDown,
  ChevronUp,
  Zap,
  Calendar,
  Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────

interface FieldDefinition {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "date" | "checkbox";
  required: boolean;
  options?: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  grantor: string | null;
  fields: FieldDefinition[];
  createdAt: string;
  _count?: { reports: number };
}

interface AggregatedData {
  totalStartups: number;
  activeStartups: number;
  graduatedStartups: number;
  totalRevenue: number;
  totalEmployees: number;
  totalFunding: number;
  totalIPsFiled: number;
  totalIPsGranted: number;
  totalJobsCreated: number;
  totalEvents: number;
  womenLedStartups: number;
  scStStartups: number;
  ruralStartups: number;
  reportingRate: number;
  sectors: Record<string, number>;
  stages: Record<string, number>;
}

interface GrantorReport {
  id: string;
  name: string;
  grantor: string;
  period: string;
  data: AggregatedData;
  generatedAt: string;
}

// ─── Field type options ─────────────────────────────────

const FIELD_TYPES: { value: FieldDefinition["type"]; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
];

// ─── Data label mappings ────────────────────────────────

const DATA_LABELS: Record<string, string> = {
  totalStartups: "Total Startups",
  activeStartups: "Active Startups",
  graduatedStartups: "Graduated Startups",
  totalRevenue: "Total Revenue",
  totalEmployees: "Total Employees",
  totalFunding: "Total Funding Raised",
  totalIPsFiled: "IPs Filed",
  totalIPsGranted: "IPs Granted",
  totalJobsCreated: "Jobs Created",
  totalEvents: "Events Conducted",
  womenLedStartups: "Women-Led Startups",
  scStStartups: "SC/ST Startups",
  ruralStartups: "Rural Startups",
  reportingRate: "Reporting Rate (%)",
};

const CURRENCY_FIELDS = new Set(["totalRevenue", "totalFunding"]);

export default function GrantorReportsPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "reports">(
    "templates"
  );
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [grantorReports, setGrantorReports] = useState<GrantorReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Template form state
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateGrantor, setTemplateGrantor] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateFields, setTemplateFields] = useState<FieldDefinition[]>([]);
  const [templateSaving, setTemplateSaving] = useState(false);

  // Report form state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportGrantor, setReportGrantor] = useState("");
  const [reportPeriod, setReportPeriod] = useState("");
  const [reportGenerating, setReportGenerating] = useState(false);

  // Expanded report state
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/grantor-reports");
      if (res.ok) {
        const data = await res.json();
        setGrantorReports(data.grantorReports);
        setTemplates(data.reportTemplates);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  // ─── Template CRUD ──────────────────────────────────────

  function addField() {
    setTemplateFields([
      ...templateFields,
      { name: "", label: "", type: "text", required: false },
    ]);
  }

  function updateField(index: number, updates: Partial<FieldDefinition>) {
    setTemplateFields(
      templateFields.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  }

  function removeField(index: number) {
    setTemplateFields(templateFields.filter((_, i) => i !== index));
  }

  async function saveTemplate() {
    if (!templateName.trim() || templateFields.length === 0) return;

    // Validate all fields have name and label
    for (const f of templateFields) {
      if (!f.name.trim() || !f.label.trim()) return;
    }

    setTemplateSaving(true);
    try {
      const res = await fetch("/api/report-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription || null,
          grantor: templateGrantor || null,
          fields: templateFields,
        }),
      });

      if (res.ok) {
        resetTemplateForm();
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save template:", error);
    } finally {
      setTemplateSaving(false);
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const res = await fetch(`/api/report-templates?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete template");
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  }

  function resetTemplateForm() {
    setShowTemplateForm(false);
    setTemplateName("");
    setTemplateGrantor("");
    setTemplateDescription("");
    setTemplateFields([]);
  }

  // ─── Report generation ─────────────────────────────────

  async function generateReport() {
    if (!reportName.trim() || !reportGrantor.trim() || !reportPeriod.trim())
      return;

    setReportGenerating(true);
    try {
      const res = await fetch("/api/grantor-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reportName,
          grantor: reportGrantor,
          period: reportPeriod,
        }),
      });

      if (res.ok) {
        resetReportForm();
        setActiveTab("reports");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setReportGenerating(false);
    }
  }

  function resetReportForm() {
    setShowReportForm(false);
    setReportName("");
    setReportGrantor("");
    setReportPeriod("");
  }

  // ─── Helpers ────────────────────────────────────────────

  // Collect unique grantors from templates + reports for suggestions
  const existingGrantors = Array.from(
    new Set([
      ...templates.filter((t) => t.grantor).map((t) => t.grantor!),
      ...grantorReports.map((r) => r.grantor),
    ])
  );

  function formatValue(key: string, value: unknown): string {
    if (CURRENCY_FIELDS.has(key)) return formatCurrency(value as number);
    if (typeof value === "number") return value.toLocaleString("en-IN");
    return String(value);
  }

  // ─── Render ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Grantor Reports</h1>
        <p className="text-sm text-gray-500">
          Create report templates and generate aggregate reports for grantors
        </p>
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
          <LayoutTemplate className="h-4 w-4" />
          Report Templates
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "reports"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FileText className="h-4 w-4" />
          Generated Reports
        </button>
      </div>

      {/* ─── Tab 1: Report Templates ─────────────────────── */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowTemplateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>

          {/* Template creation form */}
          {showTemplateForm && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>New Report Template</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetTemplateForm}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Template Name *
                    </label>
                    <Input
                      placeholder="e.g. AIM Quarterly Report"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Grantor
                    </label>
                    <Input
                      placeholder="e.g. AIM, DST, DPIIT"
                      value={templateGrantor}
                      onChange={(e) => setTemplateGrantor(e.target.value)}
                      list="grantor-suggestions"
                    />
                    <datalist id="grantor-suggestions">
                      {existingGrantors.map((g) => (
                        <option key={g} value={g} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Input
                    placeholder="Brief description of this template"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                  />
                </div>

                {/* Dynamic field builder */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Fields *
                    </label>
                    <Button variant="outline" size="sm" onClick={addField}>
                      <Plus className="mr-1 h-3 w-3" />
                      Add Field
                    </Button>
                  </div>

                  {templateFields.length === 0 && (
                    <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                      No fields yet. Click &quot;Add Field&quot; to start
                      building your template.
                    </p>
                  )}

                  <div className="space-y-3">
                    {templateFields.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="grid flex-1 gap-3 sm:grid-cols-4">
                          <Input
                            placeholder="Field name (e.g. total_revenue)"
                            value={field.name}
                            onChange={(e) =>
                              updateField(index, { name: e.target.value })
                            }
                          />
                          <Input
                            placeholder="Label (e.g. Total Revenue)"
                            value={field.label}
                            onChange={(e) =>
                              updateField(index, { label: e.target.value })
                            }
                          />
                          <select
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                            value={field.type}
                            onChange={(e) =>
                              updateField(index, {
                                type: e.target
                                  .value as FieldDefinition["type"],
                              })
                            }
                          >
                            {FIELD_TYPES.map((ft) => (
                              <option key={ft.value} value={ft.value}>
                                {ft.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-sm text-gray-600">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) =>
                                  updateField(index, {
                                    required: e.target.checked,
                                  })
                                }
                                className="rounded border-gray-300"
                              />
                              Required
                            </label>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeField(index)}
                          className="shrink-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" onClick={resetTemplateForm}>
                    Cancel
                  </Button>
                  <Button
                    onClick={saveTemplate}
                    disabled={
                      templateSaving ||
                      !templateName.trim() ||
                      templateFields.length === 0
                    }
                  >
                    {templateSaving ? "Saving..." : "Save Template"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Template list */}
          {templates.length === 0 && !showTemplateForm ? (
            <Card>
              <CardContent className="py-12 text-center">
                <LayoutTemplate className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No templates yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Create a report template to define the structure of your
                  grantor reports.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">
                        {template.name}
                      </CardTitle>
                      {template.description && (
                        <p className="mt-1 text-xs text-gray-500">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTemplate(template.id)}
                      className="shrink-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-2">
                      {template.grantor && (
                        <Badge variant="secondary">{template.grantor}</Badge>
                      )}
                      <Badge variant="outline">
                        {(template.fields as FieldDefinition[]).length} fields
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs text-gray-400">
                      Created{" "}
                      {new Date(template.createdAt).toLocaleDateString(
                        "en-IN"
                      )}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab 2: Generated Reports ────────────────────── */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowReportForm(true)}>
              <Zap className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>

          {/* Report generation form */}
          {showReportForm && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Generate Grantor Report</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetReportForm}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Report Name *
                    </label>
                    <Input
                      placeholder="e.g. AIM Q1 2026 Report"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Grantor *
                    </label>
                    <Input
                      placeholder="e.g. AIM, DST, DPIIT"
                      value={reportGrantor}
                      onChange={(e) => setReportGrantor(e.target.value)}
                      list="report-grantor-suggestions"
                    />
                    <datalist id="report-grantor-suggestions">
                      {existingGrantors.map((g) => (
                        <option key={g} value={g} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Period *
                    </label>
                    <Input
                      placeholder="e.g. Q1 2026, Annual 2025-26"
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  This will auto-aggregate data from all startups in your
                  incubator and create a snapshot report.
                </p>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="outline" onClick={resetReportForm}>
                    Cancel
                  </Button>
                  <Button
                    onClick={generateReport}
                    disabled={
                      reportGenerating ||
                      !reportName.trim() ||
                      !reportGrantor.trim() ||
                      !reportPeriod.trim()
                    }
                  >
                    {reportGenerating ? "Generating..." : "Generate Report"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated reports list */}
          {grantorReports.length === 0 && !showReportForm ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No reports generated yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Generate an aggregate report to create a data snapshot for
                  your grantors.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {grantorReports.map((report) => {
                const isExpanded = expandedReportId === report.id;
                const data = report.data;

                return (
                  <Card key={report.id}>
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedReportId(isExpanded ? null : report.id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <CardTitle className="text-base">
                              {report.name}
                            </CardTitle>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge>{report.grantor}</Badge>
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {report.period}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <a
                            href={`/api/grantor-reports/pdf?id=${report.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Download className="h-3 w-3" />
                            PDF
                          </a>
                          <span className="text-xs text-gray-400">
                            Generated{" "}
                            {new Date(report.generatedAt).toLocaleDateString(
                              "en-IN"
                            )}
                          </span>
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
                        {/* Key metrics grid */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {Object.entries(DATA_LABELS).map(([key, label]) => (
                            <div
                              key={key}
                              className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                            >
                              <p className="text-xs text-gray-500">{label}</p>
                              <p className="mt-1 text-lg font-semibold text-gray-900">
                                {formatValue(
                                  key,
                                  data[key as keyof AggregatedData]
                                )}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Sector distribution */}
                        {data.sectors &&
                          Object.keys(data.sectors).length > 0 && (
                            <div className="mt-6">
                              <h4 className="mb-2 text-sm font-medium text-gray-700">
                                Sector Distribution
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(data.sectors).map(
                                  ([sector, count]) => (
                                    <Badge
                                      key={sector}
                                      variant="outline"
                                    >
                                      {sector.replace(/_/g, " ")}: {count}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Stage distribution */}
                        {data.stages &&
                          Object.keys(data.stages).length > 0 && (
                            <div className="mt-4">
                              <h4 className="mb-2 text-sm font-medium text-gray-700">
                                Stage Distribution
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(data.stages).map(
                                  ([stage, count]) => (
                                    <Badge
                                      key={stage}
                                      variant="secondary"
                                    >
                                      {stage.replace(/_/g, " ")}: {count}
                                    </Badge>
                                  )
                                )}
                              </div>
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
      )}
    </div>
  );
}
