"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface Milestone {
  id: string;
  status: string;
  notes: string | null;
  dueDate: string | null;
  completedAt: string | null;
  template: { name: string; description: string | null };
}

const STATUS_COLORS: Record<string, "secondary" | "default" | "success" | "warning"> = {
  NOT_STARTED: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  MISSED: "warning",
};

const STATUS_OPTIONS = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "MISSED"];

export default function StartupMilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchMilestones();
  }, []);

  async function fetchMilestones() {
    const res = await fetch("/api/milestones");
    if (res.ok) {
      setMilestones(await res.json());
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string, notes?: string) {
    setUpdating(id);
    const res = await fetch("/api/milestones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, notes }),
    });

    if (res.ok) {
      fetchMilestones();
    }
    setUpdating(null);
  }

  const completed = milestones.filter((m) => m.status === "COMPLETED").length;
  const inProgress = milestones.filter((m) => m.status === "IN_PROGRESS").length;
  const overdue = milestones.filter(
    (m) =>
      m.dueDate &&
      new Date(m.dueDate) < new Date() &&
      m.status !== "COMPLETED"
  ).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading milestones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
        <p className="text-sm text-gray-500">
          Track your progress on incubator-assigned milestones
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Target className="h-8 w-8 text-brand-600" />
            <div>
              <p className="text-2xl font-bold">{milestones.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{completed}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{inProgress}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{overdue}</p>
              <p className="text-xs text-gray-500">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      {milestones.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Overall Progress</p>
              <p className="text-sm text-gray-500">
                {completed}/{milestones.length} (
                {Math.round((completed / milestones.length) * 100)}%)
              </p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{
                  width: `${(completed / milestones.length) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones list */}
      {milestones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No milestones assigned yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Your incubator will assign milestones to track your progress.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {milestones.map((m) => {
            const isOverdue =
              m.dueDate &&
              new Date(m.dueDate) < new Date() &&
              m.status !== "COMPLETED";

            return (
              <Card
                key={m.id}
                className={isOverdue ? "border-red-200 bg-red-50/30" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{m.template.name}</p>
                        <Badge variant={STATUS_COLORS[m.status]}>
                          {m.status.replace(/_/g, " ")}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="warning">Overdue</Badge>
                        )}
                      </div>
                      {m.template.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {m.template.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                        {m.dueDate && (
                          <span>
                            Due: {new Date(m.dueDate).toLocaleDateString("en-IN")}
                          </span>
                        )}
                        {m.completedAt && (
                          <span>
                            Completed: {new Date(m.completedAt).toLocaleDateString("en-IN")}
                          </span>
                        )}
                      </div>
                      {m.notes && (
                        <p className="mt-2 rounded-lg bg-gray-50 p-2 text-sm text-gray-600">
                          {m.notes}
                        </p>
                      )}
                    </div>

                    {/* Status update */}
                    <div className="flex items-center gap-2">
                      <select
                        value={m.status}
                        onChange={(e) => updateStatus(m.id, e.target.value)}
                        disabled={updating === m.id}
                        className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Notes input */}
                  {m.status !== "COMPLETED" && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Add notes..."
                        defaultValue={m.notes || ""}
                        onBlur={(e) => {
                          if (e.target.value !== (m.notes || "")) {
                            updateStatus(m.id, m.status, e.target.value);
                          }
                        }}
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
