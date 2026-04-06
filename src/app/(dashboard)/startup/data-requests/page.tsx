"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

interface DataRequestResponse {
  id: string;
  status: string;
  data: Record<string, unknown> | null;
  submittedAt: string | null;
  request: {
    id: string;
    title: string;
    description: string | null;
    fields: FieldDefinition[];
    deadline: string;
  };
}

export default function StartupDataRequestsPage() {
  const [responses, setResponses] = useState<DataRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeResponse, setActiveResponse] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch("/api/data-requests");
    if (res.ok) {
      setResponses(await res.json());
    }
    setLoading(false);
  }

  async function handleSubmit(responseId: string, fields: FieldDefinition[], form: HTMLFormElement) {
    setSubmitting(true);

    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    for (const field of fields) {
      const val = formData.get(field.name);
      data[field.name] = field.type === "number" ? Number(val) : val;
    }

    const res = await fetch("/api/data-requests/respond", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responseId, data }),
    });

    if (res.ok) {
      setActiveResponse(null);
      fetchData();
    }
    setSubmitting(false);
  }

  const pending = responses.filter((r) => r.status === "PENDING");
  const submitted = responses.filter((r) => r.status === "SUBMITTED");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Requests</h1>
        <p className="text-sm text-gray-500">
          Respond to data requests from your incubator
        </p>
      </div>

      {/* Pending count */}
      {pending.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            You have <strong>{pending.length}</strong> pending data request
            {pending.length > 1 ? "s" : ""} to complete.
          </p>
        </div>
      )}

      {/* ─── Pending Requests ────────────────────────── */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Pending</h2>
          {pending.map((resp) => {
            const isOverdue = new Date(resp.request.deadline) < new Date();
            const isActive = activeResponse === resp.id;

            return (
              <Card
                key={resp.id}
                className={isOverdue ? "border-red-200" : "border-yellow-200"}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {resp.request.title}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          Due{" "}
                          {new Date(resp.request.deadline).toLocaleDateString(
                            "en-IN"
                          )}
                        </span>
                        {isOverdue && <Badge variant="warning">Overdue</Badge>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        setActiveResponse(isActive ? null : resp.id)
                      }
                    >
                      {isActive ? "Cancel" : "Respond"}
                    </Button>
                  </div>
                </CardHeader>

                {isActive && (
                  <CardContent className="border-t pt-4">
                    {resp.request.description && (
                      <p className="mb-3 text-sm text-gray-500">
                        {resp.request.description}
                      </p>
                    )}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(
                          resp.id,
                          resp.request.fields,
                          e.currentTarget
                        );
                      }}
                      className="space-y-3"
                    >
                      {resp.request.fields.map((field) => (
                        <div key={field.name}>
                          {field.type === "textarea" ? (
                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && " *"}
                              </label>
                              <textarea
                                name={field.name}
                                required={field.required}
                                rows={3}
                                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                              />
                            </div>
                          ) : (
                            <Input
                              label={`${field.label}${field.required ? " *" : ""}`}
                              name={field.name}
                              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                              required={field.required}
                            />
                          )}
                        </div>
                      ))}
                      <Button type="submit" disabled={submitting}>
                        <Send className="mr-2 h-4 w-4" />
                        {submitting ? "Submitting..." : "Submit Response"}
                      </Button>
                    </form>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Submitted Responses ─────────────────────── */}
      {submitted.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Submitted</h2>
          {submitted.map((resp) => (
            <Card key={resp.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{resp.request.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Submitted{" "}
                      {resp.submittedAt
                        ? new Date(resp.submittedAt).toLocaleDateString("en-IN")
                        : ""}
                    </p>
                  </div>
                  <Badge variant="success">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Submitted
                  </Badge>
                </div>
                {resp.data && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {Object.entries(resp.data).map(([key, val]) => {
                      const fieldDef = resp.request.fields.find(
                        (f) => f.name === key
                      );
                      return (
                        <div key={key} className="rounded bg-gray-50 px-3 py-2">
                          <p className="text-xs text-gray-500">
                            {fieldDef?.label || key}
                          </p>
                          <p className="text-sm font-medium">{String(val)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {responses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No data requests
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Your incubator hasn&apos;t sent any data requests yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
